//Displays
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const CalTasks = mongoose.models.CalTasks;
const Displays = mongoose.models.Displays;
const CalendarCache = mongoose.models.CalendarCache;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const log = require('m_log')(module);
//const {error, level: err_levels, type: err_types} = require('m_errors');
const {koa_responce} = require('m_responce');

let resultMsg = (result)=>{return {result: result};};

module.exports = (router)=>{

    router.post('/api/usertasks/', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            let nTask = ctx.request.body;
            let id = await CalTasks.getFreeServerTaskId(nTask.workstationId);
            nTask.serverTaskId = id;
            let result = await CalTasks.create(nTask);
            koa_responce.sent(ctx, result);

        } catch(err) {
            throw err;
        }
    })
    .get('/api/usertasks/:wstId', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
            let tasks = await CalTasks.find({workstationId: ctx.params.wstId});
            tasks = tasks.filter(task=>!task.deleted.value);
            koa_responce.sent(ctx, tasks.map(task=>task.getPublicFields()));
        } catch(err) {
            throw err;
        }
    })
    .delete('/api/usertasks/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            //console.log('_id - ', ctx.params.id);
            let task = await CalTasks.findOne({_id: ctx.params.id});

            let result = null;
            /*if(!task.taskid && !task.sync){
                result = await task.remove();
            } else*/ {
                task.deleted.value = true;
                task.synch = false;
                result = await task.save();
            }

            koa_responce.sent(ctx, result);
        } catch(err) {
            throw err;
        }
    })
    .patch('/api/usertasks/', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            let nTask = ctx.request.body;
            nTask.synch = false;
            nTask.exceptions = [];//clear exceptions;
            let result = await CalTasks.findByIdAndUpdate(nTask._id, nTask);
            await CalendarCache.findOneAndRemove({workstationId: result.workstationId, taskId: result._id, taskType: 'user'});
            ctx.body = result;
        } catch(err) {
            throw err;
        }
    });
};
