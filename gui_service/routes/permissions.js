//Users
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const User = mongoose.models.User;

const log = require('m_log')(module);
//const {error, level: err_levels, type: err_types} = require('m_errors');

module.exports = (router)=>{
    router.get('/permissions', async function(ctx) {
        try {
            ctx.body = User.permissionsList();
        } catch(err) {
            console.log('error - ', err);
            throw err;
        }
    });
};
