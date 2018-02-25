'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const {koa_responce} = require('m_responce');

const User = mongoose.models.User;


module.exports = (router)=>{
    router.get('/userinfo', async function(ctx) {
        try {
            let res = await User.findOne({'_id': ctx.session.passport.user});
            ctx.body = res.getPublicFields();
        } catch(err) {
            throw err;
        }
    });

    router.post('/userinfo', async function(ctx) {
        try {
           let updata = {
               name: ctx.request.body.name,
               email: ctx.request.body.email,
           };

           let res = await User.update({'_id': ctx.session.passport.user}, updata);
           koa_responce.yesno(ctx, res.ok === 1);
       } catch(err) {
           throw err;
       }
    });
}
