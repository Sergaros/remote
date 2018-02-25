//Users
'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const User = mongoose.models.User;
const Group = mongoose.models.Group;
const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const path = require('path');
const log = require('m_log')(module);
const {koa_responce} = require('m_responce');


const getUserFields = (data)=>{
    let result = {};
    if(data.name) result.name = data.name;
    if(data.email) result.email = data.email;
    if(data.groups_ids) result.groups_ids = data.groups_ids;
    if(data.permissions) result.permissions = data.permissions;
    if(data.password) result.password = data.password;

    return result;
};

module.exports = (router)=>{
    router.get('/api/users', async function(ctx) {
        try {
            //log.info('Get users');
            let user = await User.findOne({_id: ctx.session.passport.user});

            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);
            let grIds = [];

            let results  = await Promise.all(user.groups_ids.map((grId)=>{
                return Group.GetAncestorsIds(grId);
            }));

            //console.log('results', results);
            results.forEach(ids=>{
                grIds = grIds.concat(ids);
            });

            grIds = grIds.concat(user.groups_ids);

            //console.log('grIds - ',grIds);
            let users = await User.find({groups_ids: { $in: grIds }});

            //remove self
            let selfIndex = users.findIndex(us=>us._id.equals(user._id));
            if(selfIndex !== -1){
                users.splice(selfIndex, 1);
            }

            //console.log('finded users groups_ids - ', users.forEach(usr=>console.log(usr.groups_ids)));

            koa_responce.sent(ctx, users.map(user=>user.getPublicFields()));
        } catch(err) {
            throw err;
        }
    })
    .post('/api/users', async function(ctx) {
        //console.log('api users post!!!!');
        try {
            //console.log('Save Users - ', ctx.request.body);
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);

            let user = await User.findOne({_id: ctx.session.passport.user});//temporary
            let data = getUserFields(ctx.request.body);

            //set default group_ids
            if(!data.groups_ids){
                data.groups_ids = [user.groups_ids[0]];
            }

            let res = await new User(data).save();

            koa_responce.yesno(ctx, res._id !== undefined);
       } catch(err) {
           throw err;
       }
    })
    .get('/api/users/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_VIEW);
            let res = await User.findOne({'_id': ctx.params.id});
            koa_responce.sent(ctx, res.getPublicFields());
        } catch(err) {
            throw err;
        }
    })
    .delete('/api/users/:id', async function(ctx) {
        try {
            await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);
           let res = await User.remove({'_id': ctx.params.id});
           koa_responce.yesno(ctx, res.result.ok === 1);
       } catch(err) {
           throw err;
       }
    })
    .patch('/api/users/:id', async function(ctx) {
        try {
           await prmChecker(ctx.session.passport.user, permissions.PERMISSION_ADMIN);
           let res = await User.update({'_id': ctx.params.id}, getUserFields(ctx.request.body));
           koa_responce.yesno(ctx, res.ok === 1);
       } catch(err) {
           throw err;
       }
    });
};
