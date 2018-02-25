'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Group = mongoose.models.Group;
const Workstation = mongoose.models.Workstation;

class SetGroupSynchronizer extends BaseSynchronizer {
    Synchronize(){
        const groupId = this.data.id;

        return Group.findOne({_id: groupId})
        .then(group=>{
            return Workstation.findOne({wsId: this.workstationId})
        })
        .then(workstation=>{
            if(!workstation)
                return {};

            if(workstation.groupId !== groupId){
                workstation.groupId = groupId;
                return workstation.save();
            } else
                return {};
        })
        .then(result=>{
            return {};
        })
        .catch(err=>{
            console.log('Error: ',err);
        });
    }
};

module.exports = SetGroupSynchronizer;
