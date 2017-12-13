const Debug = require('debug');
const Web3 = require('web3');
const createXWHEPClient = require('xwhep-js-client');
const _ = require('lodash');
const oracleJSON = require('iexec-oracle-contract/build/contracts/IexecOracle.json');
const config = require('./config');
const { signAndSendTx, walletFromPrivKey } = require('./utils');

const debug = Debug('app');

const {
  CHAIN, HOST, PRIVATE_KEY, XW_LOGIN, XW_PWD, XW_HOST, XW_PORT, IEXEC_ORACLE,
} = process.env;
debug('CHAIN', CHAIN);

const rlcWallet = walletFromPrivKey(PRIVATE_KEY);
const { network_id } = config.networks[CHAIN];
debug('network_id', network_id);

const ws = new Web3.providers.WebsocketProvider(HOST);

ws.on('connect', () => debug('connected to', HOST));
ws.on('end', evt => debug('onEnd', evt));
ws.on('error', error => debug('onError', error));

const web3 = new Web3(ws);

const oracleAddress = IEXEC_ORACLE || oracleJSON.networks[network_id].address;
debug('watching oracle at ', oracleAddress);

const oracleContract = new web3.eth.Contract(oracleJSON.abi, oracleAddress);
const xwhep = createXWHEPClient({
  login: XW_LOGIN,
  password: XW_PWD,
  hostname: XW_HOST,
  port: XW_PORT,
});

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
    chainID: network_id,
  });
  debug('processed txReceipt', txReceipt);
  return txReceipt;
}

oracleContract.events.Submit(async (error, event) => {
  if (error) return debug('Submit error', error);

  debug('Submit event', event);
  const { user, provider, args } = event.returnValues;
  const dapp = event.returnValues.dapp.toLowerCase();
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
    debug('params', params);

    const { stdout, uri } = await xwhep.submitAndWait(
      undefined, user, dapp, provider, dapp,
      params, submitTxHash,
    );
    debug('stdout', stdout);
    debug('uri', uri);

    return callback(submitTxHash, user, dapp, 4, stdout, '', uri);
  } catch (e) {
    debug('error onSubmit', e);
    return callback(submitTxHash, user, dapp, 5, '', 'Bridge failed. Off-chain computation cancelled', '');
  }
});
