// #!/usr/bin/env node
import Web3 from 'web3';
// import { exec } from 'child_process';
import config from './config.json';

import { submit } from './xwhep';
// instanciation web3
let web3 = null;
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// instanciation contract

const XtremWebInterface = web3.eth.contract(config.ContractAbi);
const contractInstance = XtremWebInterface.at(config.ContractAddress);
console.log('start', contractInstance);
// event watcher
const launchEvent = contractInstance.Launch({});

/*
 * The following functions are called when we get event from solidity,
 * they have to call XtremWeb and return result to solidity
 */

// return UID
function bSubmit(user, appName, param) {
  console.log('Submit', appName, param);
  submit(appName, param).then((res, err) => {
    if (!err) console.log(res);
    else console.log(err);
  });
  // CALL XTREMWEB
}
/*
// return pattern
function submitAndWait(user, appName, param, pattern) {
  console.log('Submit and Wait ', appName, param, pattern);
  // CALL XTREMWEB
}
*/
function setParam(user, paramName, paramValue, UID) {
  console.log('setParam', UID, paramName, paramValue);
  // CALL XTREMWEB
}

// return string (COMPLETED PENDING RUNNING ERROR)
function status(user, UID) {
  console.log('status', UID);
  // CALL XTREMWEB
}

// return PATHSTR
function result(user, UID) {
  console.log('result', UID);
  // CALL XTREMWEB
}

// return string
function stdout(user, UID) {
  console.log('stdout', UID);
  // CALL XTREMWEB
}

function toDelete(user, UID) {
  console.log('toDelete', UID);
  // CALL XTREMWEB
}

function waitResult(user, pattern, UID) {
  console.log('waitResult', pattern, UID);
  // CALL XTREMWEB
}

function register(user, appName) {
  console.log('register', appName);
  // CALL XTREMWEB
}

function getParam(user, paramName, UID) {
  console.log('getParam', paramName, UID);
  // CALL XTREMWEB
}

/*
 * Event watcher: this function listen to the event and call the related fonction
 */
launchEvent.watch((err, res) => {
  if (err) {
    console.log(`Erreur event ${err}`);
    return;
  }
  console.log(`Parse ${res.args.user} ${res.args.functionName} ${res.args.param1} ${res.args.param2} ${res.args.param3} ${res.args.UID}`);
  if (res.args.functionName === 'submitAndWait') {
    // submitAndWait(res.args.user, res.args.param1, res.args.param2, res.args.param3);
  } else if (res.args.functionName === 'submit') {
    bSubmit(res.args.user, res.args.param1, res.args.param2);
  } else if (res.args.functionName === 'setParam') {
    setParam(res.args.user, res.args.param1, res.args.param2, res.args.UID)
  } else if (res.args.functionName === 'status') {
    status(res.args.user, res.args.UID);
  } else if (res.args.functionName === 'result') {
    result(res.args.user, res.args.UID);
  } else if (res.args.functionName === 'stdout') {
    stdout(res.args.user, res.args.UID);
  } else if (res.args.functionName === 'toDelete') {
    toDelete(res.args.user, res.args.UID);
  } else if (res.args.functionName === 'waitResult') {
    waitResult(res.args.user, res.args.param1, res.args.UID);
  } else if (res.args.functionName === 'register') {
    register(res.args.user, res.args.param1)
  } else if (res.args.functionName === 'getParam') {
    getParam(res.args.user, res.args.param1, res.args.UID)
  }
});
