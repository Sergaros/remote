'use strict'
//const https = require('https');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
require('m_database');

const config = require('config');
const version = {'version' : config.get("synch_version")};

const {requestDataParser} = require('DataParser');
const synchronizer = require('Synchronizer');

const {node_responce} = require('m_responce');

/*const SynchronizeHandler = async function(req){
    let data = await requestDataParser(req);
    return await synchronizer(data);
}*/


let server = http.createServer((req, res) => {

  let pathname = decodeURI(url.parse(req.url).pathname);
  let filename = pathname.slice(1);

  //console.log('pathname - ', pathname);

  if (filename.includes('/') || filename.includes('..')) {
    node_responce.err_404(res);
    return;
  }

  if (req.method === 'GET') {
    console.log('synch 1');
    if (pathname === '/') {
        node_responce.sent(res, 'QUBYX synchronize service.');
    } else if (pathname === '/version') {
        node_responce.sent(res, version);
    }
    else
      node_responce.err_404(res);
  }

  if (req.method === 'POST') {
      console.log('synch 2');
      if (pathname === '/synchronize2.php') {
        requestDataParser(req)
        .then(data=>synchronizer.GetRequest(data))
        .then(results=>{
            console.log('Synchronize results:', results);
            node_responce.sent(res, results);
        })
        .catch((err)=>{
            console.log('Error: ', err);
            node_responce.err_500(res);
        });

      } else{
        node_responce.err_404(res);
      }
  }

});

if(require.main === module){
    // application run directly; start app server
    server.listen(config.get('port'));
} else {
    // application imported as a module via "require": export function to create server
    module.exports = server;
}
