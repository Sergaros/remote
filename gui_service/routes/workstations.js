//Workstations
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const Workstation = mongoose.models.Workstation;
const User = mongoose.models.User;
const Group = mongoose.models.Group;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);
//const {error, level: err_levels, type: err_types} = require('m_errors');

const {koa_responce} = require('m_responce');

module.exports = (router)=>{

    router.get('/api/workstations', async function(ctx) {
        try {
            // need separate function for this
            //-----------------------------------------------------------
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
            let user = await User.findOne({_id: ctx.session.passport.user});
            let grIds = [];

            let results  = await Promise.all(user.groups_ids.map((grId)=>{
                return Group.GetAncestorsIds(grId);
            }));

            results.forEach(ids=>{
                grIds = grIds.concat(ids);
            });

            grIds = grIds.concat(user.groups_ids);
            //-----------------------------------------------------------

            ctx.body = await Workstation.find({group: { $in: grIds }}).populate('group').exec();

        } catch(err) {
            throw err;
        }
    })
    .get('/api/workstations/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
            ctx.body = await Workstation.findOne({'_id': ctx.params.id}).populate('group').exec();
        } catch(err) {
            throw err;
        }
    })
    .delete('/api/workstations/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
            await Promise.all(Workstation.Models().map(model=>model.remove({'workstationId': ctx.params.id})));
            await Workstation.remove({'_id': ctx.params.id});

            koa_responce.yesno(ctx, true);
       } catch(err) {
           throw err;
       }
   })
   .get('/api/workstations/settings/:id', async function(ctx) {
       log.debug('Get all settings');
       await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
       let settings = {};

       await Promise.all(Workstation.Models().map(model=>{
           return model.find({'workstationId': ctx.params.id})
           .then(results=>{
               settings[model.modelName] = [];
               if(results.length){
                   if(results[0].getPublicFields){

                       if(model.modelName === 'CalTasks')
                           results = results.filter(task=>!task.deleted.value);

                       results.forEach(res=>settings[model.modelName].push(res.getPublicFields()));
                   } else {
                       settings[model.modelName] = results;
                   }
               }
           });
       }));

       koa_responce.sent(ctx, settings);
   })
   .post('/api/workstations/swapparent', async function(ctx) {
       try {
           await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_ADMIN);
           ctx.body = await Workstation.ReplaceGroupById(ctx.request.body.id, ctx.request.body.groupId);
       } catch(err) {
           throw err;
       }
   })
};
