//Groups
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;
const User = mongoose.models.User;
const Workstation = mongoose.models.Workstation;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
//const {error, level: err_levels, type: err_types} = require('m_errors');

let resultMsg = (result)=>{return {result: result};};

module.exports = (router)=>{

    router.get('/api/groups', async function(ctx) {
        try {
            let user = await User.findOne({_id: ctx.session.passport.user});
            //console.log('Group find user - ', user.permissions);

            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);
            let grIds = [];

            let results  = await Promise.all(user.groups_ids.map((grId)=>{
                return Group.GetAncestorsIds(grId);
            }));

            //console.log('results ancestors - ', results);
            results.forEach(ids=>{
                grIds = grIds.concat(ids);
            });

            grIds = grIds.concat(user.groups_ids);

            //console.log('get groups ids - ', grIds,user.groups_ids);
            ctx.body = await Promise.all(grIds.map(grId=>Group.findOne({_id: grId})
                                                            .populate('ancestors')
                                                            .populate('parent_id')
                                                            .exec()
                                                            .then(group=>group.getPublicFields())
                                                    ));

        } catch(err) {
            throw err;
        }
    })
    .post('/api/groups', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

            //set default group if needed
            if(!ctx.request.body.parent_id){
                let user = await User.findOne({_id: ctx.session.passport.user});
                ctx.request.body.parent_id = user.groups_ids[0];
            }

            let group = await Group.Create(ctx.request.body);
            //console.log('Group saved - ',group);
            //{result: group._id !== undefined, id: group._id};
            ctx.body = resultMsg(group._id !== undefined);
       } catch(err) {
           throw err;
       }
    })
    .get('/api/groups/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);

            ctx.body = await Group.findOne({'_id': ctx.params.id}).populate('ancestors').populate('parent_id').exec().then(group=>group.getPublicFields());
        } catch(err) {
            throw err;
        }
    })
    .get('/api/groups/dependencies/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

            let users = await User.find({groups_ids: { $in: [ctx.params.id]}});
            let grIds = await Group.GetAncestorsIds(ctx.params.id);
            let groups = await Promise.all(grIds.map(id=>{
                return Group.findOne({_id: id})
                .then(group=>group.getPublicFields());
            }));
            users = users.map(user=>user.getPublicFields());

            ctx.body = {users, groups};

        } catch(err) {
            throw err;
        }
    })
    .post('/api/groups/parentswap', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

            let {oldid, newid} = ctx.request.body;
            await Group.ReplaceGroup(oldid, newid);
            await User.ReplaceGroup(oldid, newid);
            await Workstation.ReplaceGroup(oldid, newid);
            ctx.body = resultMsg(true);
       } catch(err) {
           throw err;
       }
    })
    .delete('/api/groups/:id', async function(ctx) {
        try {
           await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

           //exclude root group
           let grRootId = await Group.GetRootGroupId();
           if(grRootId.equals(ctx.params.id)){
               ctx.body = {result: false, msg: 'Root group cannot be deleted!'}
           } else {
               let res = await Group.Delete({'_id': ctx.params.id});
               ctx.body = {ok: res};//resultMsg(res.result.ok === 1);
           }
       } catch(err) {
           throw err;
       }
    })
    .patch('/api/groups/:id', async function(ctx) {
        try {
           await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

           console.log(' ctx.request.body - ',  ctx.request.body);

           let group = await Group.findOne({'_id': ctx.params.id});
           if(!group.parent_id.equals(ctx.request.body.parent_id)){
               await Group.ReplaceGroup(group.parent_id, ctx.request.body.parent_id);
               await User.ReplaceGroup(group.parent_id, ctx.request.body.parent_id);
               //await Workstation.ReplaceGroup(group.parent_id, ctx.request.body.parent_id);
           }

           let res = await Group.Update({'_id': ctx.params.id}, ctx.request.body);
           ctx.body = {ok: res};//resultMsg(res._id !== undefined);
       } catch(err) {
           throw err;
       }
   });
};
