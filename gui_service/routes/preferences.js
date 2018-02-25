//Preferences
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const Preferences = mongoose.models.Preferences;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);
const {koa_responce} = require('m_responce');
//const {error, level: err_levels, type: err_types} = require('m_errors');

let resultMsg = (result)=>{return {result: result};};

module.exports = (router)=>{

    router.get('/api/preferences/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
            ctx.body = await Preferences.findOne({'workstationId': ctx.params.id});
        } catch(err) {
            throw err;
        }
    })
    .post('/api/preferences/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            let preferences = await Preferences.findOne({'workstationId': ctx.params.id});
            console.log('body - ', ctx.request.body);
            ctx.request.body.forEach(pref=>{
                if(!preferences.setByName(pref.name, pref.value, pref.isLocked))
                    log.warning(`Warning /api/preferences/:id preference with name ${pref.name} is not exist in db!`);
            })
            await preferences.save();
            koa_responce.yesno(ctx, true);
        } catch(err) {
            throw err;
        }
    });
};
