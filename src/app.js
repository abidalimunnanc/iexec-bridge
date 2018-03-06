const Debug = require('debug');
const Web3 = require('web3');
const createIEXECClient = require('iexec-server-js-client');
const _ = require('lodash');
const oracleJSON = require('iexec-oracle-contract/build/contracts/IexecOracle.json');
const config = require('./config');
const { signAndSendTx, walletFromPrivKey } = require('./utils');

const debug = Debug('app');

const {
  CHAIN, HOST, PRIVATE_KEY, XW_LOGIN, XW_PWD, XW_SERVER, IEXEC_ORACLE,
} = process.env;
debug('CHAIN', CHAIN);

const rlcWallet = walletFromPrivKey(PRIVATE_KEY);
const chainID = config.networks[CHAIN].network_id;
debug('chainID', chainID);

const ws = new Web3.providers.WebsocketProvider(HOST);

ws.on('connect', () => debug('connected to', HOST));
ws.on('end', evt => debug('onEnd', evt));
// needs reconnect logic
ws.on('error', error => debug('onError', error));

const web3 = new Web3(ws);

const oracleAddress = IEXEC_ORACLE || oracleJSON.networks[chainID].address;
debug('watching oracle at', oracleAddress);

const oracleContract = new web3.eth.Contract(oracleJSON.abi, oracleAddress);

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
