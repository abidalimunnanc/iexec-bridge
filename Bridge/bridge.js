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

function callApi() {

}

launchEvent.watch((err, result) => {
  if (err) {
    console.log(`Erreur event ${err}`);
    return;
  }
  console.log(`Parse ${result.args.user} ${result.args.fonction} ${result.args.param1} ${result.args.param2}`);
  const params = `-P ${result.args.value}  1${result.args.param}`;
  console.log(`params send to submit task ${params}`);

  callApi(params, result.args.addr);
});
