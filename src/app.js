const Debug = require('debug');
const Web3 = require('web3');
const createIEXECClient = require('iexec-server-js-client');
const _ = require('lodash');
const oracleJSON = require('iexec-oracle-contract/build/contracts/IexecOracle.json');
const config = require('./config');
const { signAndSendTx, walletFromPrivKey, sleep } = require('./utils');

const debug = Debug('app');

const {
  CHAIN, HOST, PRIVATE_KEY, XW_LOGIN, XW_PWD, XW_SERVER, IEXEC_ORACLE,
} = process.env;
debug('CHAIN', CHAIN);

const WS_RECONNECT = 2000;
const rlcWallet = walletFromPrivKey(PRIVATE_KEY);
const chainID = config.networks[CHAIN].network_id;
debug('chainID', chainID);

let ws;
let web3;
let oracleContract;
let oracleAddress;

async function callback(submitTxHash, user, dapp, status, stdout, stderr, uri) {
  const unsignedTx = oracleContract.methods.submitCallback(
    submitTxHash, user, dapp,
    status, stdout, stderr, uri,
  ).encodeABI();
  debug('unsignedTx', unsignedTx);

  const txReceipt = await signAndSendTx({
    web3,
    userWallet: rlcWallet,
    unsignedTx,
    nonceOffset: 0,
    contractAddress: oracleAddress,
    chainID,
  });
  debug('processed txReceipt', txReceipt);
  return txReceipt;
}

const registerOracleEvents = () => {
  oracleContract.events.Submit(async (error, event) => {
    if (error) return debug('Submit error', error);

    debug('Submit event', event);
    const { args } = event.returnValues;
    const dapp = event.returnValues.dapp.toLowerCase();
    const user = event.returnValues.user.toLowerCase();
    const submitTxHash = event.transactionHash;

    try {
      debug('args', args);
      let param = {};
      try {
        param = JSON.parse(args);
      } catch (err) {
        param = args;
      }

      const params = _.isPlainObject(param) ? param : { cmdline: param };
      params.sgid = submitTxHash;
      debug('params', params);

      const iexec = createIEXECClient({
        login: XW_LOGIN,
        password: XW_PWD,
        server: XW_SERVER,
        mandated: user,
      });

      const workUID = await iexec.submitWorkByAppName(dapp, params);
      const work = await iexec.waitForWorkCompleted(workUID);
      const resulturi = iexec.getFieldValue(work, 'resulturi');
      const { stdout } = await iexec.downloadStream(iexec.uri2uid(resulturi));
      debug('stdout', stdout);
      debug('resulturi', resulturi);

      return callback(submitTxHash, user, dapp, 4, stdout, '', resulturi);
    } catch (e) {
      debug('error onSubmit', e);
      return callback(submitTxHash, user, dapp, 5, '', 'Bridge failed. Off-chain computation cancelled', '');
    }
  });
};

const initWeb3 = async () => new Promise((res) => {
  debug('web3 connecting to ws');
  ws = new Web3.providers.WebsocketProvider(HOST);
  debug('after web3 providers');
  ws.on('connect', async () => {
    debug('connected to node', HOST);
    web3 = new Web3(ws);
    web3.eth.getBlockNumber().then(blockNumber => debug('node blockNumber', blockNumber));

    oracleAddress = IEXEC_ORACLE || oracleJSON.networks[chainID].address;
    debug('watching oracle at', oracleAddress);
    oracleContract = new web3.eth.Contract(oracleJSON.abi, oracleAddress);
    registerOracleEvents();
    res(ws);
  });
  ws.on('end', async (evt) => {
    debug('ws.onEnd error', evt.reason, 'code', evt.code);
    debug('Web3 ws reconnecting in', WS_RECONNECT);
    await sleep(WS_RECONNECT);
    initWeb3();
  });
  ws.on('error', () => debug('we.onError'));
});

initWeb3();
