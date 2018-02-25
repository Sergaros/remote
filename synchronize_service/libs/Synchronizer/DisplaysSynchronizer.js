'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;

const GetDisplayData = (obj)=>{
    let res = {};
    if(obj.id) res.id_name = obj.id;
    if(obj.serial) res.serial = obj.serial;
    if(obj.width) res.width = obj.width;
    if(obj.height) res.height = obj.height;
    if(obj.commode) res.commode = obj.commode;
    if(obj.isactive !== undefined) res.isactive = obj.isactive;

    return res;
}

class DisplaysSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let languages = [];
        let wstOId;

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displaysList=>{
             this.data.forEach(display=>{
                 if(displaysList){
                     let index = displaysList.displays.findIndex(disp=>disp.id_name===display.id);

                     if(index !== -1){
                         let id = displaysList.displays[index]._id;
                         displaysList.displays[index] = GetDisplayData(display);
                         displaysList.displays[index]._id = id;
                     } else {
                         displaysList.displays.push(GetDisplayData(display));
                     }
                } else {
                    displaysList = new Displays();
                    displaysList.workstationId = wstOId;
                    displaysList.displays = [];
                    this.data.forEach(display=>{
                        displaysList.displays.push(GetDisplayData(display));
                    });
                }
             });

            return displaysList.save();
        })
        .then(result=>{
            return {};
        });
    }
};

module.exports = DisplaysSynchronizer;
