'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {toMD5} = require('Common');

const Group = mongoose.models.Group;
const Workstation = mongoose.models.Workstation;

class GroupsSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let rootGroupId;
        let workst = null;
        return this.GetRootGroupId()
        .then(groupId=>{
            rootGroupId = groupId;
            return Workstation.findOne({wsId: this.workstationId});
        })
        .then(workstation=>{
            if(!workstation){
                workstation = new Workstation({
                    name: this.data.name,
                    application: this.data.app,
                    wsId: this.workstationId/*,
                    group: rootGroupId*/
                });
                return workstation.save();
            } else
                return workstation;
        })
        .then(workstation=>{
            workst = workstation;
            return Group.find({});
        })
        .then(groups=>{
            let result = null;

            for(let i =0; i < groups.length; i++){
                if(groups[i].sync_login === this.login && groups[i].sync_password === this.password){
                    result = groups[i];
                    if(!workst.group){
                        workst.group = groups[i]._id;
                    }
                    break;
                }
            }
            return workst.save()
            .then(()=>{
                return result;
            });
        })
        .then(group=>{
            return Group.GetAncestorsIds(group._id)
            .then(results=>{
                return [group._id].concat(results);
            })
        })
        .then(grIds=>{
            return Promise.all(grIds.map((grId)=>{
                return Group.findOne({_id: grId});
            }));
        })
        .then(groups=>{
            let result = [];

            groups.forEach(group=>{
                result.push({id: group._id, name: group.name});
            });

            return result;
        })
        .catch(err=>{
            console.log('Error: ', err);
            return [];
        })
    }
};

module.exports = GroupsSynchronizer;
