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

function submitAndWaitAndGetStdout(user, provider, creator, appName, param) {
    xwhep.submitAndWaitAndGetStdout(user, provider, creator, appName,param).then(result => {
        [workUid,stdout]=result;
        console.log(`Here the workUid = ${workUid}`);
        console.log(`Here the stdout = ${stdout}`);
        contractInstance.submitCallback(user, provider, appName, workUid, '', {
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
        contractInstance.submitCallback(user, provider, appName, '', `${error}`, {
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




// return string (COMPLETED PENDING RUNNING ERROR)
function status(user, provider, creator, paramName, paramValue, workUid) {
  console.log('status', workUid);
  xwhep.getStatus(workUid).then(status => {
    console.log("status is " + status);
    //StatusEnum {UNSET=0, UNAVAILABLE=1, PENDING=2, RUNNING=3, COMPLETED=4, ERROR=5}
    let workStatusToReturn;
    if (status.indexOf("UNAVAILABLE") !== -1) {
      workStatusToReturn = 1;
    } else if (status.indexOf("PENDING") !== -1) {
      workStatusToReturn = 2;
    } else if (status.indexOf("RUNNING") !== -1) {
      workStatusToReturn = 3;
    } else if (status.indexOf("COMPLETED") !== -1) {
      workStatusToReturn = 4;
    } else if (status.indexOf("ERROR") !== -1) {
      workStatusToReturn = 5;
    } else {
      workStatusToReturn = 5;
    }
    console.log("workStatusToReturn" + workStatusToReturn);
    contractInstance.statusCallback(user, provider, workUid, workStatusToReturn, '', {
        from: bridgeAccount,
        gas: 400000
      }).then(result => {
        console.log('status Done');
      })
      .catch(error => {
        console.log('status KO');
        console.log(error);
      });


  });
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
  if (res.args.functionName === 'submit') {
      submitAndWaitAndGetStdout(res.args.user, res.args.provider, res.args.creator, res.args.param1, res.args.param2);
  }
});
