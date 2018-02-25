'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {resolvePreferences} = require('Common');

const Displays = mongoose.models.Displays;
const DisplaysStatuses = mongoose.models.DisplaysStatuses;
const Workstation = mongoose.models.Workstation;

class DisplaysStatusesSynchronizer extends BaseSynchronizer {
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
            return DisplaysStatuses.findOne({workstationId: wstOId});
        })
        .then(dispsStats=>{
            if(dispsStats){
                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        let displayStatuses = dispsStats.getStatuses(disp._id);
                        if(displayStatuses){
                             let result = resolvePreferences(displayStatuses, this.data[dispId]);
                             if(Object.keys(result).length)
                                results[dispId] = result;
                        }
                    }
                };
            } else {
                dispsStats = new DisplaysStatuses();
                dispsStats.workstationId = wstOId;

                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        let statuses = [];

                        for(let statusName in  this.data[dispId]) {
                            statuses.push({
                                name: statusName,
                                value: this.data[dispId][statusName]
                            });
                        };

                        dispsStats.StatusesList.push({
                            displayId:disp._id,
                            Statuses: statuses
                        });
                    }
                }
            }

            return dispsStats.save();
        })
        .then(()=>{
            return results;
        });

    }
};

module.exports = DisplaysStatusesSynchronizer;
