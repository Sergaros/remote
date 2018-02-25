'use strict'
const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const ValuesMapSchema = new Schema({
    key: {
        type: String,
        require: true
    },
    value:{
        type: String,
        required: true
    }
});

const SettingsData = new Schema({
    name:{
        type: String,
        //unique: true,
        required: true
    },

    values:{
        type: [ValuesMapSchema]
    }
});

const SettingsNamesSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    settings:{
        type: [SettingsData]
    }
});

module.exports = mongoose.model('SettingsNames', SettingsNamesSchema);
