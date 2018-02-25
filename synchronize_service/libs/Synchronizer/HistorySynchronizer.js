'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Workstation = mongoose.models.Workstation;
const History = mongoose.models.History;

class HistorySynchronizer extends BaseSynchronizer {
    Synchronize(){

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            return workstation._id;
        })
        .then(wstId=>{
            return Promise.all(this.data.map(item=>{
                return History.findOne({workstationId: wstId, historyid: item.historyid})
                .then(result=>{
                    if(!result){
                        item.runtime*=1000;
                        item.workstationId = wstId;
                        console.log('History - ', item);
                        return History.create(item);
                    }
                });
            }))
        })
        .then(()=>{
            return [];
        });
    }
};

module.exports = HistorySynchronizer;
