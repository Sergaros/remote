'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {resolvePreferences} = require('Common');
const {States} = require('./BaseSynchronizer.js');

const Preferences = mongoose.models.Preferences;
const Workstation = mongoose.models.Workstation;

class PreferencesSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let resultData = {};
        let wstOId;
        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Preferences.findOne({workstationId: workstation._id});
        })
        .then(preferences=>{
            if(preferences){

                let regulation = preferences.findByName('UsedRegulation');
                if(regulation){
                    if(regulation.isChanged)
                        PreferencesSynchronizer.SetState(States.STATE_REGULATION_CHANGED, true);
                }

                let result = resolvePreferences(preferences.preferences, this.data);
                if(Object.keys(result).length)
                   resultData = result;

            } else {
                preferences = new Preferences();
                preferences.workstationId = wstOId;
                for(let prefName in this.data){
                    preferences.preferences.push({name: prefName, value: this.data[prefName]});
                }
            }

            return preferences.save();
        })
        .then(result=>{
            return resultData;
        })
        .catch(err=>{
            console.log('Mongoose PreferencesSynchronizer Error: ', err);
        });
    };
};

module.exports = PreferencesSynchronizer;
