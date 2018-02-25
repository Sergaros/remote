'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const AppCommonSettingsSchema = new Schema({
    name:{
        type: String,
        require: true
    },

    data:{
        type: Schema.Types.Mixed
    }
});


module.exports = mongoose.model('AppCommonSettings', AppCommonSettingsSchema);
