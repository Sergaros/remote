//Displays
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const QATasks = mongoose.models.QATasks;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);
const {koa_responce} = require('m_responce');
const CalendarCache = mongoose.models.CalendarCache;
//const {error, level: err_levels, type: err_types} = require('m_errors');

module.exports = (router)=>{

    router.post('/api/qatasks/:wstid/:dispid/:taskid', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            /*console.log('workstationId - ', ctx.params.wstid);
            console.log('displayId - ', ctx.params.dispid);
            console.log('taskId - ', ctx.params.taskid);*/

            console.log('qa body - ', ctx.request.body);

            let result = await QATasks.setNextDate(ctx.params.wstid, ctx.params.dispid, ctx.params.taskid, ctx.request.body);
            await CalendarCache.findOneAndRemove({workstationId: ctx.params.wstid, taskId: ctx.params.taskid, taskType: 'qa'});
            //await QATasks.addException = function(ctx.params.wstid, ctx.params.taskid, ctx.params.dispid, dfrom, dto)

            koa_responce.yesno(ctx, result!==null);
        } catch(err) {
            throw err;
        }
    });
};
