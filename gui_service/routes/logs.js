//Groups
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const Log = mongoose.models.Log;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
//const {error, level: err_levels, type: err_types} = require('m_errors');

let resultMsg = (result)=>{return {result: result};};

module.exports = (router)=>{

    router.get('/api/logs', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);
            ctx.body = await Log.find({});
        } catch(err) {
            throw err;
        }
    });
};
