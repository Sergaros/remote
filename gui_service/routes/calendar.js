'use strict'

require('m_database');
const mongoose = require('m_mongoose');
const axios = require('axios');

const Workstation = mongoose.models.Workstation;
const User = mongoose.models.User;
const Group = mongoose.models.Group;

const prmChecker = require('permissions_checker');
const {permissions} = require('Common');
const {koa_responce} = require('m_responce');

const path = require('path');
const log = require('m_log')(module);


module.exports = (router) => {
    router.post('/api/calendar', async function(ctx) {
            try {
                //console.log('Calendar get tasks - ', ctx.request.body.date, ctx.request.body.view);

                await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);

                //find workstations
                let user = await User.findOne({
                    _id: ctx.session.passport.user
                });
                let grIds = [];

                let results = await Promise.all(user.groups_ids.map((grId) => {
                    return Group.GetAncestorsIds(grId);
                }));

                results.forEach(ids => {
                    grIds = grIds.concat(ids);
                });

                grIds = grIds.concat(user.groups_ids);

                let workstations = await Workstation.find({
                    group: {
                        $in: grIds
                    }
                }).select('_id').exec();

                let res = await axios.post('http://calendar:5502/workstations', {
                    date: ctx.request.body.date,
                    view: ctx.request.body.view,
                    workstations: workstations.map(wst => wst._id)
                });

                koa_responce.sent(ctx, res.data);
            } catch (err) {
                //console.log('Error - ', err);
                throw err;
            }
        })
        .put('/api/calendar', async function(ctx) {
            try {
                await prmChecker(ctx.session.passport.user, permissions.PERMISSION_WST_VIEW);
                let res = await axios.put('http://calendar:5502/workstations', ctx.request.body);
                koa_responce.sent(ctx, res.data);
            } catch (err) {
                //console.log('Error - ', err);
                throw err;
            }
        });
}
