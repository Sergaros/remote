//Group Manager
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;
const Workstation = mongoose.models.Workstation;
const User = mongoose.models.User;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
//const {error, level: err_levels, type: err_types} = require('m_errors');
const {koa_responce} = require('m_responce');

module.exports = (router)=>{

    router.get('/api/group_manager', async function(ctx) {
        try {
            let user = await User.findOne({_id: ctx.session.passport.user});
            //console.log('Group find user - ', user.permissions);

            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);

            let groups = await Promise.all(user.groups_ids.map(grId=>Group.findOne({_id: grId})
                                                            .exec()
                                                            .then(group=>group.getPublicFields())
                                                    ));

            /*let workstations = [];
            await Promise.all(user.groups_ids.map(grId=>{
                return Workstation.find({group: grId})
                .then(wst=>{
                    if(wst.length)
                        workstations.push(...wst);
                });
            }));

            ctx.body = {items: groups.concat(workstations)};*/

            ctx.body = {items: groups};
        } catch(err) {
            throw err;
        }
    })
    .get('/api/group_manager/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);

            let group = await Group.findOne({_id: ctx.params.id});

            let groups = [];
            if(group && group.ancestors)
                groups = await Promise.all(group.ancestors.map(grId=>Group.findOne({_id: grId})
                                                                .exec()
                                                                .then(group=>group.getPublicFields())
                                                        ));

            let workstations = await Workstation.find({group: ctx.params.id});

            ctx.body = {items: groups.concat(workstations)};
        } catch(err) {
            throw err;
        }
    })
    .delete('/api/group_manager/:id', async function(ctx) {
        try {
           await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

           //exclude root group
           let grRootId = await Group.GetRootGroupId();
           if(grRootId.equals(ctx.params.id)){
               ctx.body = {result: false, msg: 'Root group cannot be deleted!'}
           } else {
               await Group.Delete({'_id': ctx.params.id});

               let workstations = await Workstation.find({'group': ctx.params.id});
               await Promise.all(workstations.map(wst=>{
                   return Promise.all(Workstation.Models().map(model=>model.remove({'workstationId': wst._id})))
                   .then(()=>{
                         return Workstation.remove({'_id': wst._id});
                    });
               }));

               koa_responce.yesno(ctx, true);
           }
       } catch(err) {
           throw err;
       }
    });
};
