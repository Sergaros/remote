/*'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const <<>> = mongoose.models.<<>>;

class <<>>Synchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return <<>>.findOne({workstationId: workstation._id});
        })
        .then(res=>{
            if(!results){
                res =  new <<>>({
                    workstationId: wstOId,
                    ...
                });
            } else {

            }

            return <<>>.save();
        })
        .then(result=>{
            return {};
        });
    }
};

module.exports = <<>>Synchronizer;*/
