//#!/usr/bin/env node
/*
 * Promises introduction:
 * http://www.javascriptkit.com/javatutors/javascriptpromises.shtml

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
var PATH_SENDWORK = "/sendwork";
var PATH_REMOVE = "/remove";

/**
 * API URI
 */
var URI_GETAPPS = SERVERURI + PATH_GETAPPS;
var URI_GET = SERVERURI + PATH_GET;
var URI_SENDWORK = SERVERURI + PATH_SENDWORK;
var URI_REMOVE = SERVERURI + PATH_REMOVE;

/**
 * Credentials
 */
var LOGIN="admin";
var PASSWD="adminp";
var CREDENTIALS="?XWLOGIN=" + LOGIN + "&XWPASSWD=" + PASSWD;



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

/*
var workAvailableParameters = {"uid":false, "owneruid":false, "pouet":true};
var uid = "uid";
if(uid in workAvailableParameters){
	document.getElementById("demo2").innerHTML += "uid est modifiable : " + workAvailableParameters['uid'] + "<br>";
}
var pouet = "pouet";
if(pouet in workAvailableParameters){
	document.getElementById("demo2").innerHTML += "pouet est modifiable : " + workAvailableParameters['pouet'] + "<br>";
}
var qwerty = "qwerty";
if(!(qwerty in workAvailableParameters)){
	document.getElementById("demo2").innerHTML += "qwerty n'y est pas";
}
 */

/**
 * This object contains work parameters write access.
 * Key is the work parameter name
 * Value describes the write access
 */
var workAvailableParameters = {
		"uid" : false,
		"owneruid" : false,
		"accessrights" : true, 
		"errormsg" : true,
		"mtime" : false,
		"userproxy" : true,
		"sessionuid" : true,
		"groupuid" : true, 
		"sgid" : true,
		"expectedhostuid" : true,
		"isservice" : false,
		"label" : true,
		"appuid": true,
		"returncode" : false,
		"server" : false,
		"listenport" : true,
		"smartsocketaddr" : true,
		"smartsocketclient" : true,
		"envvars" : true,
		"cmdline" : true,
		"stdinuri" : true,
		"dirinuri" : true,
		"resulturi" : false,
		"arrivaldate" : false,
		"completeddate" : false,
		"readydate" : false,
		"datareadydate" : false,
		"compstartdate" : false,
		"compenddate" : false,
		"sendtoclient" : false,
		"local" : false,
		"active" : true,
		"replications" : true,
		"totalr" : true,
		"sizer" : true,
		"replicateduid" : true,
		"datadrivenuri" : true,
		"maxretry" : true,
		"retry" : false,
		"maxwallclocktime" : true,
		"diskspace" : true,
		"minmemory" : true,
		"mincpuspeed" : true,
		"status" : false,
		"minfreemassstorage" : true
}
/**
 * This contains all known application names
 */
var hashtableAppNames = {};

/*	This function 'json2xml()' is licensed under Creative Commons GNU LGPL License.

License: http://creativecommons.org/licenses/LGPL/2.1/
Version: 0.9
Author:  Stefan Goessner/2006
Web:     http://goessner.net/ 
 */
function json2xml(o, tab) {
	var toXml = function(v, name, ind) {
		var xml = "";
		if (v instanceof Array) {
			for (var i=0, n=v.length; i<n; i++)
				xml += ind + toXml(v[i], name, ind+"\t") + "\n";
		}
		else if (typeof(v) == "object") {
			var hasChild = false;
			xml += ind + "<" + name;
			for (var m in v) {
				if (m.charAt(0) == "@")
					xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
				else
					hasChild = true;
			}
			xml += hasChild ? ">" : "/>";
			if (hasChild) {
				for (var m in v) {
					if (m == "#text")
						xml += v[m];
					else if (m == "#cdata")
						xml += "<![CDATA[" + v[m] + "]]>";
					else if (m.charAt(0) != "@")
						xml += toXml(v[m], m, ind+"\t");
				}
				xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
			}
		}
		else {
			xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
		}
		return xml;
	}, xml="";
	for (var m in o)
		xml += toXml(o[m], m, "");
	return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}



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
 * This sends the work to server
 * @param xmlWork is an XML description of the work
 * @return a new Promise
 * @resolve undefined
 */
function sendWork(xmlWork) {

	return new Promise(function(resolve, reject){
		var sendWorkPath = PATH_SENDWORK + "?XMLDESC=" + xmlWork;
		const options = {
				hostname: SERVERNAME,
				port: SERVERPORT,
				path: PATH_SENDWORK + CREDENTIALS + "&XMLDESC=" + xmlWork,
				method: 'GET',
				rejectUnauthorized: false
		};
		console.debug(options.hostname + ":" + options.port + sendWorkPath);

		const req = https.request(options, (res) => {

			res.on('data', (d) => {
				var strd = String.fromCharCode.apply(null, new Uint16Array(d));
				console.debug(strd);
			});

			res.on('end', (d) => {
				resolve();
			});
		});

		req.on('error', (e) => {
			reject(e);
		});
		req.end();
	});
}

/**
 * This retrieves an object from server
 * @param uid is the uid of the object to retrieve
 * @return a Promise
 * @resolve a String containing the XML representation of the retrieved object 
 */
function get(uid) {
	return new Promise(function(resolve, reject){
		var getResponse = "";

		var getPath = PATH_GET + "/" + uid;
		const options = {
				hostname: SERVERNAME,
				port: SERVERPORT,
				path: getPath + CREDENTIALS,
				method: 'GET',
				rejectUnauthorized: false
		};
		console.debug(options.hostname + ":" + options.port + getPath);

		const req = https.request(options, (res) => {

			res.on('data', (d) => {
				var strd = String.fromCharCode.apply(null, new Uint16Array(d));
				getResponse += strd;
			});

			res.on('end', (d) => {
				console.debug(getResponse);
				resolve(getResponse);
			});
		});

		req.on('error', (e) => {
			reject(e);
		});
		req.end();
	});
}

/**
 * This registers a new UNAVAILABLE work for the provided application.
 * Since the status is set to UNAVAILABLE, this new work is not candidate for scheduling.
 * This lets a chance to sets some parameters. 
 * To make this work candidate for scheduling, setPending() must be called
 * @param appName is the application name 
 * @return a new Promise
 * @resolve the new work uid
 * @exception is thrown if application is not found
 * @see #setPending(uid) 
 */
function register(appName) {
	console.debug("register ; " + appName);

	return new Promise(function(resolve, reject){
		if(!(appName in hashtableAppNames)){
			getApps().then(function (success) {
				if(!(appName in hashtableAppNames)){
					throw "Application not found " + appName;
				}

				const workUid = uuidV4();
				console.debug("work uid = " + workUid);

				var appUid =  hashtableAppNames[appName];
				console.debug(appName + " = " + appUid);

				var workDescription = "<work><uid>" + workUid +
				"</uid><accessrights>0x755</accessrights><appuid>" + 
				appUid + "</appuid><status>UNAVAILABLE</status></work>";
				sendWork(workDescription).then(function (){
					sendWork(workDescription).then(function (){  // a 2nd time to force status to UNAVAILABLE
						resolve(workUid);
					}).catch(function (err){
						reject("register() sendWork 2 error : " + err);
					});
				}).catch(function (err){
					reject("register() sendWork 1 error : " + err);
				});
			}).catch(function (err){
				reject("register() getApps error : " + err);
			});
		}
	});
}

/**
 * This registers a new PENDING work for the provided application.
 * Since the status is set to PENDING, this new work candidate for scheduling.
 * @param appName is the application name 
 * @param cmdLineParam is the command line parameter. This may be ""
 * @return a new Promise
 * @resolve the new work uid
 * @exception is thrown if application is not found
 */
function submit(appName, cmdLineParam) {
	return new Promise(function(resolve, reject){
		register("ls").then(function (uid) {
			setParam(uid, "cmdline", cmdLineParam).then(function () {
				setPending(uid).then(function () {
					resolve(uid);
				}).catch(function (msg) {
					console.error(msg);
				});
			}).catch(function (msg) {
				console.error(msg);
			});
		}).catch(function (msg) {
			console.error(msg);
		});
	});
}

/**
 * This sets a parameter for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @param paramName contains the name of the work parameter to modify
 * @param paramValue contains the value of the work parameter
 * @return a new Promise
 * @resolve undefined
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not UNAVAILABLE
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only (e.g. status, return code, etc.)
 */
function setParam(uid, paramName, paramValue) {
	if(!(paramName in workAvailableParameters)){
		throw "Invalid parameter "+ paramName;
	}
	if(workAvailableParameters[paramName] === false){
		throw "Read only parameter "+ paramName;
	}

	return new Promise(function(resolve, reject){
		get(uid).then(function(getResponse){
			var jsonObject;
			parseString(getResponse, function (err, result) {
				jsonObject = JSON.parse(JSON.stringify(result));
			});

			if (jsonObject['xwhep']['work'] === undefined) {
				reject("setParam(): Not a work : " + uid);
			}

			if (jsonObject['xwhep']['work'][0]['status'] != "UNAVAILABLE") {
				reject("setParam(): Invalid status : " + jsonObject['xwhep']['work'][0]['status']);
			}

			jsonObject['xwhep']['work'][0][paramName] = paramValue;

			sendWork(json2xml(jsonObject, false)).then(function () {
				resolve();
			}).catch(function (err){
				reject("register() error : " + err);
			});
		}).catch(function(e){
			reject("setParam(): Work not found (" + uid + ") : " + e);
		});
	});
}

/**
 * This retrieves a parameter for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @param paramName contains the name of the work parameter to modify
 * @return a new Promise
 * @resolve a String containing the parameter value 
 * @exception is thrown if work is not found
 * @exception is thrown if paramName does not represent a valid work parameter
 */
function getParam(uid, paramName) {

	return new Promise(function(resolve, reject){
		get(uid).then(function(getResponse){

			var jsonObject;
			parseString(getResponse, function (err, result) {
				jsonObject = JSON.parse(JSON.stringify(result));
			});

			if (jsonObject['xwhep']['work'] === undefined) {
				reject("getParam(): Not a work : " + uid);
			}

			var paramValue =  jsonObject['xwhep']['work'][0][paramName];
			if (paramValue == undefined) {
				reject("getParam() : Invalid work parameter : " + paramName);
			}

			resolve(paramValue);

		}).catch(function(e){
			reject("getParam(): Work not found (" + uid + ") : " + e);
		});
	});
}

/**
 * This retrieves the status for the provided work.
 * 
 * @param uid is the work unique identifier 
 * @return a new Promise
 * @resolve a String containing the parameter value 
 * @exception is thrown if work is not found
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only
 * @see #getParam(uid, paramName) 
 */
function getStatus(uid) {
	return getParam(uid, "status");
}

/**
 * This sets the status of the provided work to PENDING
 * We don't call setParam() since STATUS is supposed to be read only
 * @param uid is the work unique identifier 
 * @return a new Promise
 * @resolve undefined 
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not UNAVAILABLE
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only (e.g. status, return code, etc.)
 */
function setPending(uid) {
	return new Promise(function(resolve, reject){
		get(uid).then(function(getResponse){
			var jsonObject;
			parseString(getResponse, function (err, result) {
				jsonObject = JSON.parse(JSON.stringify(result));
			});

			if (jsonObject['xwhep']['work'] === undefined) {
				reject("setPending(): Not a work : " + uid);
			}

			jsonObject['xwhep']['work'][0]['status'] = "PENDING";
			console.debug("setPending() : " + JSON.stringify(jsonObject));

			sendWork(json2xml(jsonObject, false)).then(function () {
				resolve();
			}).catch(function (err){
				reject("register() error : " + err);
			});
		}).catch(function(e){
			reject("setPending(): Work not found (" + uid + ") : " + e);
		});
	});
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
 * @return a new Promise
 * @resolve a String containing the XML representation of the retrieved object 
 * @see get(uid)
 */
function getApp(appUid) {
	return new Promise(function(resolve, reject){
		get(appUid).then(function(getResponse){

			var jsonObject;
			parseString(getResponse, function (err, result) {
				jsonObject = JSON.parse(JSON.stringify(result));
			});

			console.debug(JSON.stringify(jsonObject));

			if (jsonObject['xwhep']['app'] == undefined) {
				reject("getApp() : Not an application : " + appUid);
			}

			var appName =  jsonObject['xwhep']['app'][0]['name'];
			console.debug(appUid + " ; " + appName);

			if(!(appName in hashtableAppNames)){
				hashtableAppNames[appName] = appUid;
			}

			console.debug("hashtableAppNames[" + appName + "] = " + hashtableAppNames[appName])

			resolve(getResponse);
		}).catch(function(e){
			reject("getApp() : Application not found (" + appUid + ") : " + e);
		});
	});
}

/**
 * This retrieves registered applications uid
 * @return a new Promise
 * @resolve undefined
 * @see getApp(appUid)
 */
function getApps() {
	return new Promise(function(resolve, reject){
		var getAppsResponse = "";

		const options = {
				hostname: SERVERNAME,
				port: SERVERPORT,
				path: PATH_GETAPPS + CREDENTIALS,
				method: 'GET',
				rejectUnauthorized: false
		};

		console.debug(options.hostname + ":" + options.port + PATH_GETAPPS);

		const req = https.request(options, (res) => {

			res.on('data', (d) => {
				var strd = String.fromCharCode.apply(null, new Uint16Array(d));
				getAppsResponse += strd;
			});

			res.on('end', (d) => {

				parseString(getAppsResponse, function (err, result) {
					var jsonData = JSON.parse(JSON.stringify(result));
					var appsCount = jsonData['xwhep']['XMLVector'][0]['XMLVALUE'].length;
					var appuids = [];
					console.debug("appsCount " + appsCount);
					for (var i = 0; i < appsCount; i++) {
						var appuid = JSON.stringify(jsonData['xwhep']['XMLVector'][0]['XMLVALUE'][i]['$']['value']).replace(/\"/g, "");
						appuids[i] = appuid;
					}
					var apppUidPromises = appuids.map(getApp);
					Promise.all(apppUidPromises).then(function(xmlStr){
						console.debug(xmlStr);
						resolve();
					}).catch(function(urls){
						console.error("Error fetching some images: " + urls)
					});
				});
			});
		});

		req.on('error', (e) => {
			reject("getApps() : " + e);
		});
		req.end();
	});

}

//register("ls").then(function (uid) {
//console.log("uid = " + uid);
//getStatus(uid).then(function (status) {
//setParam(uid, "cmdline", "pouet").then(function () {
//setPending(uid).then(function () {
//getStatus(uid).then(function (status) {
//console.log("status = " + status);
//});
//}).catch(function (msg) {
//console.error(msg);
//});
//}).catch(function (msg) {
//console.error(msg);
//});
//}).catch(function (msg) {
//console.error(msg);
//});
//}).catch(function (msg) {
//console.error(msg);
//});


submit("ls", "-Rals").then(function (uid) {
	get(uid).then(function (xml) {
		console.log(xml);
	})
}).catch(function (msg) {
	console.error(msg);
});


