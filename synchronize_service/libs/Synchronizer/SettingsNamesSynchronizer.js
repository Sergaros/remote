'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {createDate} = require('Common');

const Workstation = mongoose.models.Workstation;
const SettingsNames = mongoose.models.SettingsNames;

//const moment = require('moment');

class SettingsNamesSynchronizer extends BaseSynchronizer {
    Synchronize(){
        const settings = [];
        let wst;

        for(let name in this.data){
            let setting = {};
            setting.name = name;
            setting.values = [];
            const valuesArr = this.data[name].split('|');
            for(let i = 0; i < valuesArr.length; i+=2){
                setting.values.push({key:valuesArr[i+1], value: valuesArr[i]});
            }
            settings.push(setting);
        }

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wst = workstation;
            return SettingsNames.findOne({workstationId: wst._id});
        })
        .then(settingsNames=>{
            if(!settingsNames)
                settingsNames = new SettingsNames({workstationId: wst._id, settings: settings});
            else
                settingsNames.settings = settings;

            return settingsNames.save();
        })
        .then(results=>{
            return {};
        })
        .catch(err=>{
            throw err;
        });
    }
};

module.exports = SettingsNamesSynchronizer;
