'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const axios = require('axios');

const AppCommonSettings = mongoose.models.AppCommonSettings;

const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);

let resultMsg = (result) => {
    return {
        result: result
    };
};

module.exports = (router) => {
    router.get('/api/mailconfig', async function(ctx) {
        let mailconfig = await AppCommonSettings.findOne({name: 'mailconfig'});
        ctx.body = mailconfig.data?mailconfig.data:{};
    })
    .post('/api/mailconfig', async function(ctx) {
            try {
                //console.log('mailconfig 1');
                await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

                let mailconfig = await AppCommonSettings.findOne({name: 'mailconfig'});

                //console.log('mailconfig 2');
                let config = {};
                config.host = ctx.request.body.host;
                config.port = ctx.request.body.port;
                config.secure = ctx.request.body.secure;
                config.user = ctx.request.body.user;
                config.pass = ctx.request.body.pass;
                config.email = ctx.request.body.email;

                let res = await axios.post('http://mail:5503/config', config);

                //console.log('mailconfig 3');
                mailconfig.data = config;
                await mailconfig.save();

                //console.log('mailconfig 4', res.data);
                ctx.body = res.data;
            } catch (err) {
                throw err;
            }
        })
        .post('/api/mailconfig/test', async function(ctx) {

            let message = {
                to: ctx.request.body.to,
                subject: '<not reply> Remote Mail Service Test',
                text: 'This is text test mesaage from qubyx-remote.',
                html: '<p>This is html test mesaage from qubyx-remote.</p>'
            };

            let res = await axios.post('http://mail:5503/sent', message);
            ctx.body = res.data;
        });
}
