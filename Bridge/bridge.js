#!/usr/bin/env node
var Web3 = require('web3');
var exec = require('child_process').exec;
var config = require('./config');

// instanciation web3
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// instanciation contract
var vanitygenContract = web3.eth.contract(config.ContractAbi);
var contractInstance = vanitygenContract.at(config.ContractAddress);

// event watcher
var launchEvent = contractInstance.Launch({});
launchEvent.watch(function(err, result){
	if (err) {
		console.log("Erreur event ", err);
		return;
	}
	console.log("Parse ",result.args.user,result.args.fonction,result.args.param1,result.args.param2);
	var params = "-P " + result.args.value + " 1" + result.args.param;
	console.log("params send to submit task ", params);

	callApi(params, result.args.addr);
});


function callApi() {



}

/*
function submitTask( param, address) {
	var task = '/home/ubuntu/run_vanitygen_with_replication.sh "' +  param + '"';
	console.log("submit TASK ", task);
	var child = exec(task);
	child.stdout.on('data', function(data) {
    		console.log('stdout: ' + data);
		var running = /RUNNING/i;
		var result = /\n*Address./i;
		var invalid = /Invalid|Download error/i;
		if (data.match(running) && data.match(running)[0]){

			//console.log("Running ",data);
		contractInstance.broadcast("Running",address,{gas: 200000} ,function(error,result){
        		if (!error){
                		console.log("res event = " +result);
        		} else {
                		console.log(error);
        		}
        	});
		}
		if (data.match(invalid) && data.match(invalid)[0]){

		contractInstance.broadcast("Invalid",address,{gas: 200000} ,function(error,result){
        		if (!error){
                		console.log("res event = " +result);
        		} else {
                		console.log(error);
        		}
        	});
			console.log("invalid ",data);
		}
		var url = /UID='([\w\d-]+)'/i;
		if (data.match(url)) {
			vanurl = data.match(url)[1];
			console.log("vanurl", vanurl);

		contractInstance.broadcast(vanurl,address,{gas: 200000} ,function(error,result){
        		if (!error){
                		console.log("res event = " +result);
        		} else {
                		console.log(error);
        		}
        	});
		}
		if (data.match(result) && data.match(result)[0]){
		//var privKey = /PrivkeyPart: (\w*)/i;
		//var addressreg = /Address: \w*/i;
		var vanparam = data.match(privKey)[0] + " -- " + data.match(addressreg)[0];
		contractInstance.pushResult(address,vanparam,vanurl,{gas: 1000000},function(error,result){
	        if (!error){
			console.log("push result "+ vanparam +" -- "+vanurl,"result",result);
			child.kill();
        	} else {
                	console.log("pushresult err = " +error);
        	}
		});
			console.log("Running ",data);
		}
	});
	child.stderr.on('data', function(data) {
    		console.log('stderr: ' + data);
	});
	child.on('close', function(code) {
    		console.log('closing code: ' + code);
		if (code == '1') {


		contractInstance.broadcast("Invalid",address,{gas: 200000} ,function(error,result){
        		if (!error){
                		console.log("res event = " +result);
        		} else {
                		console.log(error);
        		}
        	});

		}
	});
	child.on('error', function(code) {
    		console.log('closing error: ' + code);
	});
	child.on('exit', function(code) {
    		console.log('closing exit: ' + code);
	});
	child.on('disconnect', function(code) {
    		console.log('closing exit: ' + code);
	});
	child.on('message', function(code) {
    		console.log('closing exit: ' + code);
	});

}
