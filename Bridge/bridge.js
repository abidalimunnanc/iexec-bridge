#!/usr/bin/env node
/*


import Web3 from 'web3';
//import { exec } from 'child_process';
import config from './config.json';

//instanciation web3
let web3 = null;
if (typeof web3 !== 'undefined') web3 = new Web3(web3.currentProvider);
else web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

//instanciation contract
const vanitygenContract = web3.eth.contract(config.ContractAbi);
const contractInstance = vanitygenContract.at(config.ContractAddress);

//event watcher
const launchEvent = contractInstance.Launch({});

 */

const https = require('https');
const fs = require('fs');
const util = require('util');
var parseString = require('xml2js').parseString;
const uuidV4 = require('uuid/v4');


/**
 * This are the local XWHEP server informations, for testing only
 */
var LOCALHOSTNAME = "localhost";
var LOCALHOSTPORT = 4430;
var LOCALHOSTURI  = "https://" + LOCALHOSTNAME + ":" + LOCALHOSTPORT;

/**
 * This are the iExec server informations
 */
var IEXECHOSTNAME = "iexec";
var IEXECPORT = 443;
var IEXECURI  = "https://" + IEXECHOSTNAME + ":" + IEXECPORT;

/**
 * These are the used configuration
 */
var SERVERNAME = LOCALHOSTNAME;
var SERVERPORT = LOCALHOSTPORT;
var SERVERURI = LOCALHOSTURI;

/* 
var SERVERNAME = IEXECHOSTNAME;
var SERVERPORT = IEXECPORT;
var SERVERURI = IEXECURI;
 */


/**
 * API PATH
 */
var PATH_GETAPPS = "/getapps";
var PATH_GET = "/get";

/**
 * API URI
 */
var URI_GETAPPS = SERVERURI + PATH_GETAPPS;
var URI_GET = SERVERURI + PATH_GET;

/**
 * Credentials
 */
var LOGIN="admin";
var PASSWD="adminp";
var CREDENTIALS="?XWLOGIN=" + LOGIN + "&XWPASSWD=" + PASSWD;

/**
 * API URIs
 */
var URI_GETAPPS = SERVERURI + PATH_GETAPPS + CREDENTIALS;


/**
 * This is the XML tag of the element returned by the server on error
 */
var XMLRPCRESULTTAG="xmlrpcresult";
/**
 * This is the XMLRPCRESULT return code
 */
var XMLRPCRESULTRETURNCODE="RETURNCODE";
/**
 * This is the XMLRPCRESULT return code
 */
var XMLRPCRESULTMESSAGE="MESSAGE";


/**
 * This contains all known application names
 */
var hashtableAppNames = {};


/**
 * This throws "Connection error"
 */
function connectionError() {
	throw "Connection error";
}

/**
 * This checks if there is an remote call error
 * @param xmldoc contains the server answer
 * @exception is throw if xmldoc represents an error 
 */
function rpcError(xmldoc) {
	var rpcErr = xmldoc.getElementsByTagName(XMLRPCRESULTTAG)[0];
	if(rpcErr != null) {
		var msg = rpcErr.getAttribute(XMLRPCRESULTMESSAGE);
		throw  msg;
	}
}


/**
 * This registers a new UNAVAILABLE work for the provided application.
 * Since the status is set to UNAVAILABLE, this new work is not candidate for scheduling.
 * This lets a chance to sets some parameters. 
 * To make this work candidate for scheduling, setPending() must be called
 * @param appName is the application name 
 * @return uid of the registered work
 * @exception is thrown if application is not found
 * @see #setPending(uid) 
 */
function register(appName) {
	if(!(appName in hashtableAppNames)){
		getApps();
	}
	if(!(appName in hashtableAppNames)){
		throw "Application not found : " + appName;
	}
	const workUid = uuidV4();
	console.log("work uid = " + workUid);
}

/**
 * This registers a new PENDING work for the provided application.
 * Since the status is set to PENDING, this new work candidate for scheduling.
 * @param appName is the application name 
 * @param cmdLineParam is the command line parameter. This may be ""
 * @return uid of the submitted work
 * @exception is thrown if application is not found
 */
function submit(appName, cmdLineParam) {
}

/**
 * This sets a parameter for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @param paramName contains the name of the work parameter to modify
 * @param paramValue contains the value of the work parameter
 * @return nothing
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not UNAVAILABLE
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only (e.g. status, return code, etc.)
 */
function setParam(uid, paramName, paramValue) {
}

/**
 * This retrieves a parameter for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @param paramName contains the name of the work parameter to modify
 * @return the parameter value
 * @exception is thrown if work is not found
 * @exception is thrown if paramName does not represent a valid work parameter
 */
function getParam(uid, paramName) {
}

/**
 * This retrieves the status for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @return the work status
 * @exception is thrown if work is not found
 * @see #getParam(uid, paramName) 
 */
function getStatus(uid) {
	return getParam()
}

/**
 * This sets the status of the provided work to PENDING
 * @param uid is the work unique identifier 
 * @return nothing
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not UNAVAILABLE
 */
function setPending(uid) {
}

/**
 * This retrieves the result path
 * @param uid is the work unique identifier 
 * @return the work result path on local file system; "" if work has no result
 * @exception is thrown if work is not found
 * @exception is thrown if work status is ERROR
 */
function getResultPath(uid) {
}

/**
 * This the content of the work stdout file
 * @param uid is the work unique identifier 
 * @return a String
 * @exception is thrown if work is not found
 * @exception is thrown if stdout file is not found
 */
function getStdout(uid) {
}

/**
 * This removes the work
 * @param uid is the work unique identifier 
 * @return nothing
 */
function remove(uid) {
}

/**
 * This submits a work for the provided application and waits the result.
 * @param appName is the application name 
 * @param cmdLineParam is the command line parameter. This may be ""
 * @param pattern is a regexp to be found in stdout
 * @return the value of the found pattern
 * @exception is thrown if application is not found
 * @exception is thrown if work status is ERROR
 */
function submitAndWait(appName, cmdLineParam, pattern) {
	var uid = submit(appName, cmdLineParam);
	return waitResult(uid, pattern);
}

/**
 * This waits the work result.
 * @param uid is the work unique identifier 
 * @param pattern is a regexp to be found in stdout
 * @return the value of the found pattern
 * @exception is thrown if work is not found
 * @exception is thrown if work status is ERROR
 */
function waitResult(uid, pattern) {
}


/**
 * This retrieves an application
 * @param appUid is the uid of the application to retrieve
 */
function getApp(appUid) {
	var getAppResponse = "";
	var getAppResponseLength = 1;

	var getAppPath = PATH_GET + "/" + appUid;
	const options = {
			hostname: SERVERNAME,
			port: SERVERPORT,
			path: getAppPath + CREDENTIALS,
			method: 'GET',
			rejectUnauthorized: false
	};
	console.log(options.hostname + ":" + options.port + getAppPath);

	const req = https.request(options, (res) => {
		getAppResponseLength = res.headers['content-length'];

		res.on('data', (d) => {
			var strd = String.fromCharCode.apply(null, new Uint16Array(d));
			getAppResponse += strd;
		});

		res.on('end', (d) => {

			parseString(getAppResponse, function (err, result) {
				var jsonData = JSON.parse(JSON.stringify(result));
				if (jsonData['xwhep']['app'] == undefined) {
					throw ("not an application : " + appUid);
				}

				var appName =  jsonData['xwhep']['app'][0]['name'];
				console.log("app name = " + appName);

				if(!(appName in hashtableAppNames)){
					hashtableAppNames[appName] = appUid;
				}
			});
		});
	});

	req.on('error', (e) => {
		console.error(e);
		connectionError();
	});
	req.end();

}

/**
 * This retrieves registered applications uid
 * This cancels all detail
 */
function getApps() {
	var getAppsResponse = "";
	var getAppsResponseLength = 1;

	const options = {
			hostname: SERVERNAME,
			port: SERVERPORT,
			path: PATH_GETAPPS + CREDENTIALS,
			method: 'GET',
			rejectUnauthorized: false
	};

	console.log(options.hostname + ":" + options.port + PATH_GETAPPS);

	const req = https.request(options, (res) => {
//		console.log('statusCode:', res.statusCode);
//		console.log('headers :', res.headers);
//		console.log("headers : " + Object.prototype.toString.call(res.headers).slice(8, -1) + "\n");
		getAppsResponseLength = res.headers['content-length'];
//		console.log("getAppsResponseLength : " + getAppsResponseLength);

		res.on('data', (d) => {
//			console.log('DATA statusCode:', res.statusCode);
//			console.log('DATA headers :', res.headers);
			var strd = String.fromCharCode.apply(null, new Uint16Array(d));
			getAppsResponse += strd;
//			console.log("DATA getAppsResponse  : " + getAppsResponse);
//			console.log("DATA " + getAppsResponseLength + " ; " + getAppsResponse.length);
		});

		res.on('end', (d) => {
//			console.log('END statusCode:', res.statusCode);
//			console.log('END headers :', res.headers);
//			console.log("END getAppsResponse  : " + getAppsResponse);
//			console.log("END " + getAppsResponseLength + " ; " + getAppsResponse.length);

//			console.log("END stringify " + JSON.stringify(getAppsResponse));

			parseString(getAppsResponse, function (err, result) {
//				console.dir("parseString stringify " + JSON.stringify(result));
				var jsonData = JSON.parse(JSON.stringify(result));
//				console.log("parseString json 0 " + jsonData);
//				console.log("parseString json 1 " + jsonData['xwhep']);
//				console.log("parseString json 2 " + jsonData['xwhep']['XMLVector']);
				var appsCount = jsonData['xwhep']['XMLVector'][0]['XMLVALUE'].length;
				console.log("appsCount " + appsCount);
				for (var i = 0; i < appsCount; i++) {
					var appuid = JSON.stringify(jsonData['xwhep']['XMLVector'][0]['XMLVALUE'][i]['$']['value']).replace(/\"/g, "");
					console.log("app[" + i + "].uid = " + appuid);
					getApp(appuid);
				}
			});
		});
	});

	req.on('error', (e) => {
		console.error(e);
		connectionError();
	});
	req.end();
}



//getApps();
register("ls");

/*

launchEvent.watch((err, res) => {
	if (err) {
		console.log(`Erreur event ${err}`);
		return;
	}
	console.log(`Parse ${res.args.user} ${res.args.fonction} ${res.args.param1} ${res.args.param2}`);
	const params = `-P ${res.args.value}  1${res.args.param}`;
	console.log(`params send to submit task ${params}`);

});
 */
