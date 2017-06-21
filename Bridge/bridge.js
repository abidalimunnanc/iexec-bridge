#!/usr/bin/env node
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

import https from 'https';
import { parseString } from 'xml2js';
import fs from 'fs';
import uuidV4 from 'uuid/v4';
import request from 'request';
import json2xml from 'json2xml';
// const util = require('util');


/**
 * This are the local XWHEP server informations, for testing only
 */
const LOCALHOSTNAME = 'localhost';
const LOCALHOSTPORT = 4430;
// var LOCALHOSTURI  = "https://" + LOCALHOSTNAME + ":" + LOCALHOSTPORT;
const LOCALHOSTURI = `https://${LOCALHOSTNAME}:${LOCALHOSTPORT}`;

/**
 * This are the iExec server informations
 */
const IEXECHOSTNAME = 'iexec';
const IEXECPORT = 443;
const IEXECURI = `https://${IEXECHOSTNAME}:${IEXECPORT}`;

/**
 * These are the used configuration
 */
const SERVERNAME = LOCALHOSTNAME;
const SERVERPORT = LOCALHOSTPORT;
const SERVERURI = LOCALHOSTURI;

/*
var SERVERNAME = IEXECHOSTNAME;
var SERVERPORT = IEXECPORT;
var SERVERURI = IEXECURI;
 */

/*
 * This is the delay between between two get status calls
 * This is in milliseconds
 */
const WAITSTATUSDELAY = 1000

/**
 * API PATH
 */
const PATH_GETAPPS = '/getapps';
const PATH_GET = '/get';
const PATH_SENDWORK = '/sendwork';
const PATH_REMOVE = '/remove';
const PATH_DOWNLOADDATA = '/downloaddata';

/**
 * API URI
 */
const URI_GETAPPS = SERVERURI + PATH_GETAPPS;
const URI_GET = SERVERURI + PATH_GET;
const URI_SENDWORK = SERVERURI + PATH_SENDWORK;
const URI_REMOVE = SERVERURI + PATH_REMOVE;
const URI_DOWNLOADDATA = SERVERURI + PATH_DOWNLOADDATA;

/**
 * Credentials
 */
const LOGIN = 'admin';
const PASSWD = 'adminp';
const CREDENTIALS = `?XWLOGIN=${LOGIN}&XWPASSWD=${PASSWD}`;


/**
 * This is the XML tag of the element returned by the server on error
 */
const XMLRPCRESULTTAG = 'xmlrpcresult';
/**
 * This is the XMLRPCRESULT return code
 */
const XMLRPCRESULTRETURNCODE = 'RETURNCODE';
/**
 * This is the XMLRPCRESULT return code
 */
const XMLRPCRESULTMESSAGE = 'MESSAGE';

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
const workAvailableParameters = {
  uid: false,
  owneruid: false,
  accessrights: true,
  errormsg: true,
  mtime: false,
  userproxy: true,
  sessionuid: true,
  groupuid: true,
  sgid: true,
  expectedhostuid: true,
  isservice: false,
  label: true,
  appuid: true,
  returncode: false,
  server: false,
  listenport: true,
  smartsocketaddr: true,
  smartsocketclient: true,
  envvars: true,
  cmdline: true,
  stdinuri: true,
  dirinuri: true,
  resulturi: false,
  arrivaldate: false,
  completeddate: false,
  readydate: false,
  datareadydate: false,
  compstartdate: false,
  compenddate: false,
  sendtoclient: false,
  local: false,
  active: true,
  replications: true,
  totalr: true,
  sizer: true,
  replicateduid: true,
  datadrivenuri: true,
  maxretry: true,
  retry: false,
  maxwallclocktime: true,
  diskspace: true,
  minmemory: true,
  mincpuspeed: true,
  status: false,
  minfreemassstorage: true,
}
/**
 * This contains all known application names
 */
const hashtableAppNames = {};


/**
 * This throws "Connection error"
 */
function connectionError() {
  throw new Error('Connection error');
}

/**
 * This checks if there is an remote call error
 * @param xmldoc contains the server answer
 * @exception is throw if xmldoc represents an error
 */
function rpcError(xmldoc) {
  const rpcErr = xmldoc.getElementsByTagName(XMLRPCRESULTTAG)[0];
  if (rpcErr != null) {
    const msg = rpcErr.getAttribute(XMLRPCRESULTMESSAGE);
    throw msg;
  }
}

/**
 * This sends the work to server
 * This is a private method not implemented in the smart contract
 * @param xmlWork is an XML description of the work
 * @return a new Promise
 * @resolve undefined
 */
function sendWork(xmlWork) {
  return new Promise((resolve, reject) => {
    const sendWorkPath = `${PATH_SENDWORK}?XMLDESC=${xmlWork}`;
    const options = {
      hostname: SERVERNAME,
      port: SERVERPORT,
      path: `${PATH_SENDWORK + CREDENTIALS}&XMLDESC=${xmlWork}`,
      method: 'GET',
      rejectUnauthorized: false,
    };
    console.debug(`${options.hostname}:${options.port}${sendWorkPath}`);

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        const strd = String.fromCharCode.apply(null, new Uint16Array(d));
        console.debug(strd);
      });

      res.on('end', () => {
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
 * This is a public method implemented in the smart contract
 * @param uid is the uid of the object to retrieve
 * @return a Promise
 * @resolve a String containing the XML representation of the retrieved object
 */
function get(uid) {
  return new Promise((resolve, reject) => {
    let getResponse = '';

    const getPath = `${PATH_GET}/${uid}`;
    const options = {
      hostname: SERVERNAME,
      port: SERVERPORT,
      path: getPath + CREDENTIALS,
      method: 'GET',
      rejectUnauthorized: false,
    };
    console.debug(`get() : ${options.hostname}:${options.port}${getPath}`);

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        const strd = String.fromCharCode.apply(null, new Uint16Array(d));
        getResponse += strd;
      });

      res.on('end', () => {
        console.debug(`get() : ${getResponse}`);
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
 * This retrieves an application
 * This is a private method not implemented in the smart contract
 * @param appUid is the uid of the application to retrieve
 * @return a new Promise
 * @resolve a String containing the XML representation of the retrieved object
 * @see get(uid)
 */
function getApp(appUid) {
  return new Promise((resolve, reject) => {
    get(appUid).then((getResponse) => {
      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });

      console.debug(JSON.stringify(jsonObject));

      if (jsonObject.xwhep.app === undefined) {
        reject(`getApp() : Not an application : ${appUid}`);
      }

      const appName = jsonObject.xwhep.app[0].name;
      console.debug(`${appUid} ; ${appName}`);

      if (!(appName in hashtableAppNames)) {
        hashtableAppNames[appName] = appUid;
      }

      console.debug(`hashtableAppNames[${appName}] = ${hashtableAppNames[appName]}`)

      resolve(getResponse);
    }).catch((e) => {
      reject(`getApp() : Application not found (${appUid}) : ${e}`);
    });
  });
}

/**
 * This retrieves registered applications uid
 * This is a private method not implemented in the smart contract
 * @return a new Promise
 * @resolve undefined
 * @see getApp(appUid)
 */
function getApps() {
  return new Promise((resolve, reject) => {
    let getAppsResponse = '';

    const options = {
      hostname: SERVERNAME,
      port: SERVERPORT,
      path: PATH_GETAPPS + CREDENTIALS,
      method: 'GET',
      rejectUnauthorized: false,
    };

    console.debug(`${options.hostname}:${options.port}${PATH_GETAPPS}`);

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        const strd = String.fromCharCode.apply(null, new Uint16Array(d));
        getAppsResponse += strd;
      });

      res.on('end', () => {
        parseString(getAppsResponse, (err, result) => {
          const jsonData = JSON.parse(JSON.stringify(result));
          const appsCount = jsonData.xwhep.XMLVector[0].XMLVALUE.length;
          const appuids = [];
          console.debug(`appsCount ${appsCount}`);
          for (let i = 0; i < appsCount; i += 1) {
            const appuid = JSON.stringify(jsonData.xwhep.XMLVector[0].XMLVALUE[i].$.value).replace(/"/g, '');
            appuids[i] = appuid;
          }
          const apppUidPromises = appuids.map(getApp);
          Promise.all(apppUidPromises).then((xmlStr) => {
            console.debug(xmlStr);
            resolve();
          }).catch((e) => {
            reject(`getApps() : ${e}`)
          });
        });
      });
    });

    req.on('error', (e) => {
      reject(`getApps() : ${e}`);
    });
    req.end();
  });
}

/**
 * This registers a new UNAVAILABLE work for the provided application.
 * Since the status is set to UNAVAILABLE, this new work is not candidate for scheduling.
 * This lets a chance to sets some parameters.
 * To make this work candidate for scheduling, setPending() must be called
 * This is a public method implemented in the smart contract
 * @param appName is the application name
 * @return a new Promise
 * @resolve the new work uid
 * @exception is thrown if application is not found
 * @see #setPending(uid)
 */
function register(appName) {
  console.debug(`register ; ${appName}`);

  return new Promise((resolve, reject) => {
    if (!(appName in hashtableAppNames)) {
      getApps().then(() => {
        if (!(appName in hashtableAppNames)) {
          throw new Error(`Application not found ${appName}`);
        }

        const workUid = uuidV4();
        console.debug(`work uid = ${workUid}`);

        const appUid = hashtableAppNames[appName];
        console.debug(`${appName} = ${appUid}`);

        const workDescription = `<work><uid>${workUid}</uid><accessrights>0x755</accessrights><appuid>${
appUid}</appuid><status>UNAVAILABLE</status></work>`;
        sendWork(workDescription).then(() => {
          sendWork(workDescription).then(() => {  // a 2nd time to force status to UNAVAILABLE
            resolve(workUid);
          }).catch((err) => {
            reject(`register() sendWork 2 error : ${err}`);
          });
        }).catch((err) => {
          reject(`register() sendWork 1 error : ${err}`);
        });
      }).catch((err) => {
        reject(`register() getApps error : ${err}`);
      });
    }
  });
}

/**
 * This sets a parameter for the provided work.
 * This is a public method implemented in the smart contract
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
  if (!(paramName in workAvailableParameters)) {
    throw new Error(`Invalid parameter ${paramName}`);
  }
  if (workAvailableParameters[paramName] === false) {
    throw new Error(`Read only parameter ${paramName}`);
  }

  return new Promise((resolve, reject) => {
    get(uid).then((getResponse) => {
      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });

      if (jsonObject.xwhep.work === undefined) {
        reject(`setParam(): Not a work : ${uid}`);
      }
      if (jsonObject.xwhep.work[0].status.toString() !== 'UNAVAILABLE') {
        reject(`setParam(): Invalid status : ${jsonObject.xwhep.work[0].status}`);
      }

      jsonObject.xwhep.work[0][paramName] = paramValue;

      sendWork(json2xml(jsonObject, false)).then(() => {
        resolve();
      }).catch((err) => {
        reject(`setParam() error : ${err}`);
      });
    }).catch((e) => {
      reject(`setParam(): Work not found (${uid}) : ${e}`);
    });
  });
}

/**
 * This retrieves a parameter for the provided work.
 * This is a public method implemented in the smart contract
 * @param uid is the work unique identifier
 * @param paramName contains the name of the work parameter to modify
 * @return a new Promise
 * @resolve a String containing the parameter value
 * @exception is thrown if work is not found
 * @exception is thrown if paramName does not represent a valid work parameter
 */
function getParam(uid, paramName) {
  return new Promise((resolve, reject) => {
    get(uid).then((getResponse) => {
      console.debug(`getParam (${uid}, ${paramName}) = ${getResponse}`);

      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });

      console.debug(`getParam ${JSON.stringify(jsonObject)}`);

      if (jsonObject.xwhep.work === undefined) {
        reject(`getParam(): Not a work : ${uid}`);
      }

      const paramValue = jsonObject.xwhep.work[0][paramName];
      if (paramValue === undefined) {
        reject(`getParam() : Invalid work parameter : ${paramName}`);
      }
      console.debug(`getParam ${paramValue}`);

      resolve(paramValue);
    }).catch((e) => {
      reject(`getParam(): Work not found (${uid}) : ${e}`);
    });
  });
}

/**
 * This retrieves the status for the provided work.
 * This is a public method implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a new Promise
 * @resolve a String containing the parameter value
 * @exception is thrown if work is not found
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only
 * @see #getParam(uid, paramName)
 */
function getStatus(uid) {
  return getParam(uid, 'status');
}

/**
 * This sets the status of the provided work to PENDING
 * We don't call setParam() since STATUS is supposed to be read only
 * This is a public method implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a new Promise
 * @resolve undefined
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not UNAVAILABLE
 * @exception is thrown if paramName does not represent a valid work parameter
 * @exception is thrown if parameter is read only (e.g. status, return code, etc.)
 */
function setPending(uid) {
  return new Promise((resolve, reject) => {
    get(uid).then((getResponse) => {
      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });

      if (jsonObject.xwhep.work === undefined) {
        reject(`setPending(): Not a work : ${uid}`);
      }

      if (jsonObject.xwhep.work[0].status.toString() !== 'UNAVAILABLE') {
        reject(`setPending(): Invalid status : ${jsonObject.xwhep.work[0].status}`);
      }

      jsonObject.xwhep.work[0].status = 'PENDING';
      console.debug(`setPending() : ${JSON.stringify(jsonObject)}`);

      sendWork(json2xml(jsonObject, false)).then(() => {
        resolve();
      }).catch((err) => {
        reject(`setPending() error : ${err}`);
      });
    }).catch((e) => {
      reject(`setPending(): Work not found (${uid}) : ${e}`);
    });
  });
}

/**
 * This registers a new PENDING work for the provided application.
 * Since the status is set to PENDING, this new work candidate for scheduling.
 * This is a public method implemented in the smart contract
 * @param appName is the application name
 * @param cmdLineParam is the command line parameter. This may be ""
 * @return a new Promise
 * @resolve the new work uid
 * @exception is thrown if application is not found
 */
function submit(appName, cmdLineParam) {
  return new Promise((resolve, reject) => {
    register('ls').then((uid) => {
      setParam(uid, 'cmdline', cmdLineParam).then(() => {
        setPending(uid).then(() => {
          resolve(uid);
        }).catch((msg) => {
          reject(msg);
        });
      }).catch((msg) => {
        reject(msg);
      });
    }).catch((msg) => {
      reject(msg);
    });
  });
}
/**
 * This downloads a data
 * This is a private method not implemented in the smart contract
 * @param uri is the data uri
 * @param downloadedPath denotes a file in local fs
 * @return a new Promise
 * @resolve undefined
 * @exception is thrown if work is not found
 * @exception is thrown if work result is not set
 */
function download(uri, downloadedPath) {
  return new Promise((resolve, reject) => {
    const uid = uri.substring(uri.lastIndexOf('/') + 1);

    const downloadPath = `${PATH_DOWNLOADDATA}/${uid}`;

    const options = {
      hostname: SERVERNAME,
      port: SERVERPORT,
      path: downloadPath + CREDENTIALS,
      method: 'GET',
      rejectUnauthorized: false,
    };

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    console.debug(`https://${options.hostname}:${options.port}${options.path}`)
    request.get(`https://${options.hostname}:${options.port}${options.path}`)
      .on('response', () => {
      })
      .on('error', (response) => {
        console.error(`download() : request error ${response}`);
        reject(`download() : request error ${response}`);
      })
      .pipe(fs.createWriteStream(downloadedPath))
      .on('error', (response) => {
        console.error(`download(${uri}, ${downloadedPath}) : pipe error ${response}`);
        reject(response);
      })
      .on('end', () => {
        resolve();
      })
  });
}

/**
 * This retrieves the result of the work
 * This is a private method not implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a new Promise
 * @resolve a string containing xml representation of the result metadata or undefined, if not set
 * @exception is thrown if work is not found
 * @exception is thrown if work status is not COMPLETED
 */
function getResult(uid) {
  return new Promise((resolve, reject) => {
    get(uid).then((getResponse) => {
      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });
      if (jsonObject.xwhep.work === undefined) {
        reject(`getResult(): Not a work : ${uid}`);
      }

      if (jsonObject.xwhep.work[0].status.toString() !== 'COMPLETED') {
        reject(`getRestult(): Invalid status : ${jsonObject.xwhep.work[0].status}`);
      }

      if (jsonObject.xwhep.work[0].resulturi === undefined) {
        resolve(undefined);
      }
      const uri = jsonObject.xwhep.work[0].resulturi.toString();
      const resultUid = uri.substring(uri.lastIndexOf('/') + 1);

      resolve(get(resultUid));
    }).catch((err) => {
      reject(`getResult() error : ${err}`);
    });
  });
}

/**
 * This downloads the result of the work
 * This is a private method not implemented in the smart contract
 * @param uid is the work uid
 * @return a new Promise
 * @resolve a string containing the path of the downloaded result
 * @exception is thrown if work is not found
 * @exception is thrown if work result is not set
 */
function downloadResult(uid) {
  return new Promise((resolve, reject) => {
    getResult(uid).then((getResponse) => {
      let jsonObject;
      parseString(getResponse, (err, result) => {
        jsonObject = JSON.parse(JSON.stringify(result));
      });
      if (jsonObject.xwhep.data === undefined) {
        reject(`downloadResult(): Not a data : ${uid}`);
      }

      if (jsonObject.xwhep.data[0].status.toString() !== 'AVAILABLE') {
        reject(`downloadResult(): Invalid status : ${jsonObject.xwhep.data[0].status}`);
      }

      let resultPath = `result.${uid}`;
      const dataName = jsonObject.xwhep.data[0].name;
      if (dataName !== undefined) {
        resultPath += `.${dataName.toString().toLowerCase()}`;
      }
      const dataType = jsonObject.xwhep.data[0].type;
      if (dataType !== undefined) {
        resultPath += `.${dataType.toString().toLowerCase()}`;
      } else {
        resultPath += '.txt';
      }
      const dataUri = jsonObject.xwhep.data[0].uri;
      if (dataUri === undefined) {
        reject(`downloadResult(): data uri not found : ${uid}`);
      }
      console.log(`downloadResult() calling download(${dataUri.toString()}, ${resultPath})`);
      download(dataUri.toString(), resultPath).then(() => {
        resolve(resultPath);
      }).catch((msg) => {
        console.error(msg);
      });
    }).catch((msg) => {
      console.error(msg);
    });
  });
}


/**
 * This retrieves the result path
 * This is a private method not implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a new Promise
 * @resolve the work result path on local file system; undefined if work has no result
 * @exception is thrown on local fs error, or if there is no result file for the provided work
 */
function getResultPath(uid) {
  return new Promise((resolve, reject) => {
    fs.readdir('.', (ferr, files) => { // '/' denotes the root folder
      if (ferr) {
        reject(ferr);
      }

      files.forEach((file) => {
        if (file.indexOf(uid) !== -1) {
          resolve(file);
        }
      });
      reject(`getResultPath() : file not found ${uid}`);
    });
  });
}

/**
 * This the content of the work stdout file
 * This is a public method implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a String
 * @exception is thrown if work is not found
 * @exception is thrown if stdout file is not found
 */
// eslint-disable-next-line
function getStdout(uid) {
}

/**
 * This removes the work
 * This is a public method implemented in the smart contract
 * @param uid is the uid of the object to retrieve
 * @return a Promise
 * @resolve undefined
 */
// eslint-disable-next-line
function remove(uid) {
  return new Promise((resolve, reject) => {
    let getResponse = '';

    const getPath = `${PATH_REMOVE}/${uid}`;
    const options = {
      hostname: SERVERNAME,
      port: SERVERPORT,
      path: getPath + CREDENTIALS,
      method: 'GET',
      rejectUnauthorized: false,
    };
    console.debug(`${options.hostname}:${options.port}${getPath}`);

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        const strd = String.fromCharCode.apply(null, new Uint16Array(d));
        getResponse += strd;
      });

      res.on('end', () => {
        console.debug(getResponse);
        resolve();
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}

/*
* This is a private method not implemented in the smart contract
*/
// eslint-disable-next-line
function patternFromFile(path, pattern) {
  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(path);
    let data = '';

    readableStream.on('error', (err) => {
      reject(err);
    });
    readableStream.on('data', (chunk) => {
      data += chunk;
    });

    readableStream.on('end', () => {
      resolve(data);
    });
  });
}

/**
 * This waits the work completion
 * This is a private method not implemented in the smart contract
 * @param uid is the work unique identifier
 * @return a new Promise
 * @resolve undefined
 * @exception is thrown if work is not found
 * @exception is thrown if work status is ERROR
 */
function waitCompleted(uid) {
  return new Promise((resolve, reject) => {
    const theInterval = setInterval(() => {
      getStatus(uid).then((newStatus) => {
        console.debug(`waitCompleted ${newStatus}`);

        if (newStatus.toString() === 'ERROR') {
          clearInterval(theInterval);
          reject(`waitCompleted() : work ERROR (${uid})`);
        }
        if (newStatus.toString() === 'COMPLETED') {
          clearInterval(theInterval);
          resolve();
          return;
        }
        console.log(`waitCompleted sleeping ${WAITSTATUSDELAY}ms : ${uid} (${newStatus})`);
      }).catch((e) => {
        clearInterval(theInterval);
        reject(`waitCompleted() : ${e}`);
      });
    }, WAITSTATUSDELAY);
  });
}

/**
 * This submits a work for the provided application and waits for its completion
 * This is a public method implemented in the smart contract
 * @param appName is the application name
 * @param cmdLineParam is the command line parameter. This may be ""
 * @return a new Promise
 * @resolve the result path
 * @exception is thrown on submission error
 * @exception is thrown if work status is ERROR
 */
function submitAndWait(appName, cmdLineParam) {
  return new Promise((resolve, reject) => {
    let workuid;
    submit(appName, cmdLineParam).then((uid) => {
      workuid = uid;
      console.log('submitAndWait() submission done');
      waitCompleted(uid).then(() => {
        console.log(`submitAndWait() submission done ${workuid}`);
        downloadResult(workuid).then(() => {
          console.log(`submitAndWait() download done ${workuid}`);
          getResultPath(workuid).then((resultPath) => {
            resolve(resultPath);
          }).catch((msg) => {
            reject(`submitAndWait() : ${msg}`);
          });
        }).catch((msg) => {
          reject(`submitAndWait() : ${msg}`);
        });
      }).catch((e) => {
        reject(`submitAndWait() : ${e}`);
      });
    }).catch((e) => {
      reject(`submitAndWait() : ${e}`);
    });
  });
}


/** *******************************
 * main
 *********************************/


const filename = 'result.ff0d47e5-30f4-46bb-9c85-5371c1012fce.stdout.txt.text';
patternFromFile(filename, /pouet/).then((resultValue) => {
  console.log(`patternFromFile = ${resultValue}`);
},
).catch((e) => {
  console.log(`ERROR : ${e}`);
});


submitAndWait('ls', '-Rals').then((resultPath) => {
  console.log(`resultPath = ${resultPath}`);
  patternFromFile(resultPath, /pouet/).then((resultValue) => {
    console.log(`patternFromFile = ${resultValue}`);
  }).catch((e) => {
    console.log(`ERROR : ${e}`);
  });
}).catch((msg) => {
  console.log(`ERROR = ${msg}`);
});


downloadResult('9ef2d4e9-ad2a-4453-a704-f6c0bdf529d2').then(() => {
  getResultPath('9ef2d4e9-ad2a-4453-a704-f6c0bdf529d2').then((path) => { // result text file
    console.log(`Result path = ${path}`);
  }).catch((msg) => {
    console.log(msg);
  });
}).catch((msg) => {
  console.log(msg);
});

downloadResult('0e6e4541-0dd7-4762-8ec1-0482a71a7021').then(() => {
  getResultPath('0e6e4541-0dd7-4762-8ec1-0482a71a7021').then((path) => { // result zip file
    console.log(`Result path = ${path}`);
  }).catch((msg) => {
    console.log(msg);
  });
}).catch((msg) => {
  console.log(msg);
});
