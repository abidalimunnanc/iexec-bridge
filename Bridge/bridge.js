#!/usr/bin/env node
import Web3 from 'web3';
// import { exec } from 'child_process';
import config from './config.json';

// instanciation web3
let web3 = null;
if (typeof web3 !== 'undefined') web3 = new Web3(web3.currentProvider);
else web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// instanciation contract
const vanitygenContract = web3.eth.contract(config.ContractAbi);
const contractInstance = vanitygenContract.at(config.ContractAddress);

// event watcher
const launchEvent = contractInstance.Launch({});

// // return UID
// function submit(appName, param) {}
//
// // return pattern
// function submitAndWait(appName, param1, pattern) {}
//
// function setParam(UID, paramName, paramValue) {}
//
// // return param
// function getParam(UID, paramName) {}
//
// // return string (COMPLETED PENDING RUNNING ERROR)
// function status(UID) {}
//
// // return PATHSTR
// function result(UID) {}
//
// // return string
// function stdout(UID) {}
//
// function toDelete(UID) {}

launchEvent.watch((err, res) => {
  if (err) {
    console.log(`Erreur event ${err}`);
    return;
  }
  console.log(`Parse ${res.args.user} ${res.args.fonction} ${res.args.param1} ${res.args.param2}`);
  const params = `-P ${res.args.value}  1${res.args.param}`;
  console.log(`params send to submit task ${params}`);

  // submit(params, res.args.addr);
});
