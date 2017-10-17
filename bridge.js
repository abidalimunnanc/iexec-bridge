// #!/usr/bin/env node
import Web3 from 'web3';
// import { exec } from 'child_process';

import createXWHEPClient from 'xwhep-js-client';

//instanciation provider http
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var contract = require("truffle-contract");
const xwhep = createXWHEPClient({login:'admin', password: 'admin', hostname: 'localhost', port: '9443'});

const oracleJSON = require('iexec-oracle-contract/build/contracts/IexecOracle.json');

const ROPSTEN_ORACLE_ADDRESS = oracleJSON.networks['3'].address;
const RINKEBY_ORACLE_ADDRESS = oracleJSON.networks['4'].address;
const KOVAN_ORACLE_ADDRESS = oracleJSON.networks['42'].address;

// instanciation contract
var truffleContract = contract({
    abi: oracleJSON.abi,
    network_id: "*"
})

truffleContract.setProvider(provider);

const contractInstance = truffleContract.at(ROPSTEN_ORACLE_ADDRESS);

// instanciation web3
let web3 = new Web3(provider);
const bridgeAccount = web3.eth.accounts[0];
const runningGas = 400000;

console.log('start', contractInstance);

// event watcher
const submitEvent = contractInstance.Submit({});

/*
 * The following functions are called when we get event from solidity,
 * they have to call XtremWeb and return result to solidity
 */

function submitAndWaitAndGetStdout(user, dapp, provider, appName, param,submitTxHash) {
    let workUid='';
    let stdout='';

    let cmdLine=smartContractParamToCmdLine(param);
    let stdin=smartContractParamToStdin(param);

    xwhep.submitAndWaitAndGetStdout(user, dapp, provider, appName,cmdLine,stdin,submitTxHash).then(result => {
        [workUid,stdout]=result;
        console.log(`Here the workUid = ${workUid}`);
        console.log(`Here the stdout = ${stdout}`);
      contractInstance.submitCallback(submitTxHash,user, dapp, workUid, appName, 4 /*COMPLETED*/, stdout,'', {
            from: bridgeAccount,
            gas: runningGas,
            gasPrice:100000000000
        })
            .catch(error => {
            console.log(error);
        });
    })
    .catch(error => {
            console.log(error);
            contractInstance.submitCallback(submitTxHash,user, dapp, workUid, appName, 5/*ERROR*/, stdout, `${error}`, {
                from: bridgeAccount,
                gas: runningGas,
                gasPrice:100000000000
            })
                .catch(error => {
                console.log(error);
        });
    });
}

function smartContractParamToCmdLine(param) {
   if(isJsonString(param)){
       let paramJSON= JSON.parse(param);
       return paramJSON.cmdLine;
   }
   else{
    //by default it is a cmdLine
    return param;
   }
}


function smartContractParamToStdin(param) {
    if(isJsonString(param)){
       let paramJSON= JSON.parse(param);
       return paramJSON.stdin;
    }
    else{
        //by default it is a cmdLine not stdin
        return "";
    }
}


function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


/*
 * Event watcher: this function listen to the event and call the related fonction
 */
submitEvent.watch((err, res) => {
    if (err) {
        console.log(`Erreur event ${err}`);
        return;
    }
    console.log("res.transactionHash:"+res.transactionHash);
    console.log(`Parse ${res.args.user} ${res.args.dapp} ${res.args.provider} ${res.args.appName} ${res.args.args}`);


    submitAndWaitAndGetStdout(res.args.user, res.args.dapp, res.args.provider, res.args.appName, res.args.args,res.transactionHash);

});


