'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {resolvePreferences} = require('Common');

const Displays = mongoose.models.Displays;
const DisplaysPreferences = mongoose.models.DisplaysPreferences;
const Workstation = mongoose.models.Workstation;

class DisplaysPreferencesSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;

        let dispList = [];
        let results = {};

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displays=>{
            dispList = displays.displays;
            return DisplaysPreferences.findOne({workstationId: wstOId});
        })
        .then(dispsPrefs=>{
            if(dispsPrefs){
                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        let displayPreferences = dispsPrefs.getPreferences(disp._id);//dispsPrefs.PreferencesList.find(dispPrefs=>dispPrefs.displayId.equals(disp._id));
                        if(displayPreferences){
                             let result = resolvePreferences(displayPreferences, this.data[dispId]);
                             if(Object.keys(result).length)
                                results[dispId] = result;
                        }
                    }
                };
            } else {
                dispsPrefs = new DisplaysPreferences();
                dispsPrefs.workstationId = wstOId;

                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        let preferences = [];

                        for(let prefName in  this.data[dispId]) {
                            preferences.push({
                                name: prefName,
                                value: this.data[dispId][prefName]
                            });
                        };

                        dispsPrefs.PreferencesList.push({
                            displayId:disp._id,
                            Preferences: preferences
                        });
                    }
                }
            }

            return dispsPrefs.save();
        })
        .then(()=>{
            return results;
        });

    }
};

module.exports = DisplaysPreferencesSynchronizer;
