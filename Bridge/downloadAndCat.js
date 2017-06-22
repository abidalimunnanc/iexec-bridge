#!/usr/bin/env node

import https from 'https';
import { parseString } from 'xml2js';
import fs from 'fs';
import uuidV4 from 'uuid/v4';
import request from 'request';
import json2xml from 'json2xml';

function downloadURL(url, downloadedPath) {
  return new Promise((resolve, reject) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    console.log(`${url}:${downloadedPath}`);

    const outputStream = fs.createWriteStream(downloadedPath);
    outputStream.on('error', (e) => {
      reject(`download() : pipe error ${e}`);
    }).on('data', (d) => {
      console.log(d);
    }).on('end', () => {
      resolve(downloadedPath);
    });

    request.get(url)
       .on('response', () => {
       })
       .on('error', (response) => {
         console.error(`download() : request error ${response}`);
         reject(`download() : request error ${response}`);
       })
       .pipe(outputStream);
  });
}

/*
* This is a private method not implemented in the smart contract
*/
// eslint-disable-next-line
function catStdout(path) {
  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(path);
//    console.log(`catStdout length ${readableStream}`);
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


/** *******************************
 * main
 *********************************/


const filename = 'package.json';
catStdout(filename).then((resultValue) => {
  console.log(`package.json = ${resultValue}`);
},
).catch((e) => {
  console.log(`ERROR : ${e}`);
});

downloadURL('http://www.liberation.fr/index.html', 'index.html').then(() => {
  catStdout('index.html').then((resultValue) => {
    console.log(`index.html = ${resultValue}`);
  }).catch((e) => {
    console.log(`ERROR : ${e}`);
  });
}).catch((msg) => {
  console.log(msg);
});
