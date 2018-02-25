'use strict'

const mongoose = require('m_mongoose');
const User = mongoose.models.User;

module.exports = (userId, permission)=>{
    return User.findOne({_id: userId})
    .then(user=>{
        if(user.permissions.findIndex(p=>permission===p) === -1)
            throw new Error(`Permission denied ${permission}.`);
    })
}
