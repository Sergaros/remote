'use strict'

const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;
const Workstation = mongoose.models.Workstation;
const synchronizeStates = {};

const States = {
    STATE_REGULATION_CHANGED: 'regChanged'
}

class BaseSynchronizer {
    constructor(data){
        this.data = data.data;
        this.header = data.header;
        this.workstationId = data.header.workstationid;
        this.login = data.header.login;
        this.password = data.header.pwd;
    }

    Synchronize(){
        return Promise.resolve({});
    }

    GetRootGroupId(){
        let ancestorsIds;
        let rootGroupId;
        return Group.find({})
        .then(groups=>{
            if(groups.length === 0)
                return undefined;

            let result = undefined;

            for(let i =0; i < groups.length; i++){
                if(groups[i].sync_login === this.login && groups[i].sync_password === this.password){
                    result = groups[i]._id;
                    break;
                }
            };

            return result;
        })
    }

    CheckAccess(){
        let wst = null;
        let result = false;

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            if(!workstation)
                return null;
            else {
                wst = workstation;
                return workstation.group;
            }

            return null;
        })
        .then(groupId=>{
            if(!groupId)
                return null;

             return Group.findOne({_id: groupId});
        })
        .then(group=>{
            if(!group)
                return [];
            if(group.sync_login === this.login && group.sync_password === this.password){
                result = true;
                return [];
            } else {
                return Group.GetParentsIds(group._id);
            }
        })
        .then(parentIds=>{
            if(result)
                return [];
            else {
                return Promise.all(parentIds.map(grId=>{
                     return Group.findOne({_id: grId});
                }));
            }
        })
        .then(groups=>{
            if(result)
                return result;
            else {
                groups.forEach(group=>{
                    if(group.sync_login === this.login && group.sync_password === this.password)
                        result = true;
                });
            }

            return result;
        })
        .catch(err=>{
            console.log('Error ', err);
        });
    }

    static GetState(state){
        return synchronizeStates[state];
    }

    static SetState(state, value){
        synchronizeStates[state] = value;
    }
};

module.exports = {BaseSynchronizer, States};
