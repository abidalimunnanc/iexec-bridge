// #!/usr/bin/env node
import Web3 from 'web3';
// import { exec } from 'child_process';
import config from './config.json';

import * as xwhep from './xwhep';

//instanciation provider http
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var contract = require("truffle-contract");

// instanciation contract
var truffleContract = contract({
  abi: config.ContractAbi,
  network_id: "*"
})

truffleContract.setProvider(provider);

const contractInstance = truffleContract.at(config.ContractAddress);

// instanciation web3
let web3 = new Web3(provider);
const bridgeAccount = web3.eth.accounts[0];
const runningGas = 400000;

console.log('start', contractInstance);

// event watcher
const launchEvent = contractInstance.Launch({});

/*
 * The following functions are called when we get event from solidity,
 * they have to call XtremWeb and return result to solidity
 */

// return UID
function submit(user, appName, param) {
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
function setParam(user, provider, creator, paramName, paramValue, workUid) {
  console.log('setParam', user, provider, creator, paramName, paramValue, workUid);
  xwhep.setParam(user, provider, creator, workUid).then((error) => {
    contractInstance.setParamCallback(user, provider, workUid, error, {
      from: bridgeAccount,
      gas: runningGas
    }, function(error, result) {
      if (!error) {
        contractInstance.getWork(user, provider, workUid, function(error, result) {
          if (!error) {
            console.log("name :" + result[0]);
            console.log("timestamp :" + result[1]);
            console.log("status :" + result[2]);
            console.log("stdout :" + result[3]);
            console.log("stderr :" + result[4]);
          } else {
            console.log(error);
          }
        });
      } else {
        console.log(error);
      }
    });
  });
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

function register(user, provider, creator, appName) {
  xwhep.register(user, provider, creator, appName).then(workUid => {
      console.log(`Here the workUid = ${workUid}`);
      contractInstance.registerCallback(user, provider, appName, workUid, '', {
          from: bridgeAccount,
          gas: runningGas
        }).then(result => {
          contractInstance.getWork.call(user, provider, workUid).then(result => {
              console.log("name :" + result[0]);
              console.log("timestamp :" + result[1]);
              console.log("status :" + result[2]);
              console.log("stdout :" + result[3]);
              console.log("stderr :" + result[4]);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
      contractInstance.registerCallback(user, provider, appName, '', `${error}`, {
          from: bridgeAccount,
          gas: runningGas
        }).then(result => {
          contractInstance.getWork.call(user, provider, '').then(result => {
              console.log("name :" + result[0]);
              console.log("timestamp :" + result[1]);
              console.log("status :" + result[2]);
              console.log("stdout :" + result[3]);
              console.log("stderr :" + result[4]);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(error => {
          console.log(error);
        });
    });
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
  console.log(`Parse ${res.args.user} ${res.args.provider} ${res.args.creator} ${res.args.functionName} ${res.args.param1} ${res.args.param2} ${res.args.UID}`);
  if (res.args.functionName === 'submitAndWait') {
    // submitAndWait(res.args.user, res.args.provider, res.args.param1, res.args.param2, res.args.param3);
  } else if (res.args.functionName === 'submit') {
    submit(res.args.user, res.args.provider, res.args.creator, res.args.param1, res.args.param2);
  } else if (res.args.functionName === 'setParam') {
    setParam(res.args.user, res.args.provider, res.args.creator, res.args.param1, res.args.param2, res.args.UID);
  } else if (res.args.functionName === 'status') {
    status(res.args.user, res.args.provider, res.args.UID);
  } else if (res.args.functionName === 'result') {
    result(res.args.user, res.args.provider, res.args.UID);
  } else if (res.args.functionName === 'stdout') {
    stdout(res.args.user, res.args.provider, res.args.UID);
  } else if (res.args.functionName === 'toDelete') {
    toDelete(res.args.user, res.args.provider, res.args.UID);
  } else if (res.args.functionName === 'waitResult') {
    waitResult(res.args.user, res.args.provider, res.args.param1, res.args.UID);
  } else if (res.args.functionName === 'register') {
    register(res.args.user, res.args.provider, res.args.creator, res.args.param1);
  } else if (res.args.functionName === 'getParam') {
    getParam(res.args.user, res.args.provider, res.args.param1, res.args.UID);
  }
});
