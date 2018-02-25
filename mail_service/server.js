'use strict'
//const https = require('https');
const http = require('http');
const url = require('url');
const config = require('config');
const jsonBody = require("body/json");
const {node_responce} = require('m_responce');
const mailer = require('mailer');


/*let data1 = {
    protocol: 'SMTP',
    host: 'smtp.qubyx.com',
    secure: false,
    port: 587,
    user: 'qcsergiy',
    pass: 'fgrehzpe46ht'
};

let data2 = {
    protocol: 'SMTP',
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    user: 'darkbrother2@gmail.com',
    pass: 'rxlbmyjbadnlxfiq'
};


mailer.createTransport(data2);*/

let server = http.createServer((req, res) => {

    let pathname = decodeURI(url.parse(req.url).pathname);
    let filename = pathname.slice(1);

    //console.log('pathname - ', pathname);

    if (filename.includes('/') || filename.includes('..')) {
        node_responce.err_404(res);
        return;
    }

    if (req.method === 'GET') {
        if (pathname === '/') {
            node_responce.sent(res, 'QUBYX mail service.');
        } else
            node_responce.err_404(res);
    }

    if (req.method === 'POST') {
        if (pathname === '/sent') {
            jsonBody(req, res, (err, message)=>{
                if(err)
                    node_responce.err_500(res);

                /* //if you want to send a file
                attachments: [
                    {   // file on disk as an attachment
                        filename: 'text3.txt',
                        path: '/path/to/file.txt' // stream this file
                    }
                ]
                */

                mailer.sendMail(message)
                .then(result=>{
                    node_responce.sent(res, result);
                })
                .catch(err=>{
                    console.log('err - ', err);
                    return node_responce.err_500(res);
                });
            });

        } else if(pathname === '/config'){
            jsonBody(req, res, (err, config)=>{
                if(err)
                    return node_responce.err_500(res);

                mailer.createTransport(config);
                node_responce.yesno(res, true);
            });
        } else {
            node_responce.err_404(res);
        }
    }
});

if (require.main === module) {
    // application run directly; start app server
    server.listen(config.get('port'));
} else {
    // application imported as a module via "require": export function to create server
    module.exports = server;
}
