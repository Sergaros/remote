//Displays
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const DisplaysPreferences = mongoose.models.DisplaysPreferences;
const Displays = mongoose.models.Displays;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);
//const {error, level: err_levels, type: err_types} = require('m_errors');
const {koa_responce} = require('m_responce');

module.exports = (router)=>{

    router.post('/api/displays/:wstid/:dispid', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            let preferences = await DisplaysPreferences.findOne({'workstationId': ctx.params.wstid});
            let dispPrefs = preferences.getPreferences(ctx.params.dispid);

            ctx.request.body.result.forEach(item=>{
                let dbitem = dispPrefs.find(pref=>pref.name===item.name);
                if(dbitem){
                    dbitem.isLocked = item.isLocked;
                    if(dbitem.value !== item.value){
                        dbitem.value = item.value;
                        dbitem.isChanged = true;
                    }
                }
            })

            await preferences.save();

            let displaysList = await Displays.findOne({'workstationId': ctx.params.wstid});
            let display = displaysList.displays.find(display=>display._id.equals(ctx.params.dispid));
            if(display)
                display.isactive = ctx.request.body.isactive;

            await displaysList.save();

            koa_responce.yesno(ctx, true);
        } catch(err) {
            throw err;
        }
    });
};
