'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {createDate} = require('Common');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const DisplaysHours = mongoose.models.DisplaysHours;

const moment = require('moment');

class DisplaysHoursSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;

        let dispList = [];
        let results = {};

        for(let dispId in this.data){
            for(let dateEl in this.data[dispId]){
                this.data[dispId][dateEl].date = createDate(this.data[dispId][dateEl].date);
                /*let timeStamp = Number(this.data[dispId][dateEl].date);
                if(timeStamp != timeStamp)
                    this.data[dispId][dateEl].date = new Date(this.data[dispId][dateEl].date);
                else
                    this.data[dispId][dateEl].date = new Date(timeStamp);*/
            }
        }

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displays=>{
            dispList = displays.displays;
            return DisplaysHours.findOne({workstationId: wstOId});
        })
        .then(dispsHours=>{
            if(dispsHours){
                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        let dispHours = dispsHours.displays.find(dispH=>dispH.displayId.equals(disp._id));
                        if(dispHours){
                            DisplaysHours.setHours(dispHours, this.data[dispId]);
                        } else {
                            console.log('Error: wrong display id (display hours 1)');
                        }
                    } else {
                        console.log('Error: not found display by id (display hours)');
                    }
                }
            } else {
                dispsHours = new DisplaysHours();
                dispsHours.workstationId = wstOId;

                for(let dispId in this.data){
                    let disp = dispList.find(disp=>disp.id_name===dispId);
                    if(disp){
                        dispsHours.displays.push({
                            displayId:  disp._id,
                            hoursData: this.data[dispId]
                        });
                    } else {
                        console.log('Error: wrond display id (display hours 2)');
                    }
                }
            }

            return dispsHours.save();
        })
        .then(result=>{
            return {};
        })
        .catch(err=>{
            console.log('Mongoose DisplaysHoursSynchronizer Error: ', err);
        });
    }
};

module.exports = DisplaysHoursSynchronizer;
