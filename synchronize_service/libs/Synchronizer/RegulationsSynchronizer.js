'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Regulations = mongoose.models.Regulations;
const Workstation = mongoose.models.Workstation;

class RegulationsSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let regulations = [];
        let wstOId;
        this.data.forEach(regulation=>{
            let reg = {};
            reg.name = regulation.name;
            reg.id_name = regulation.id;

            reg.classifications = [];
            regulation.classifications.forEach(classification=>{
                reg.classifications.push({ name: classification.name, id_name: classification.id});
            });
            regulations.push(reg);
        });

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Regulations.findOne({workstationId: workstation._id});
        })
        .then(regList=>{
            if(!regList){
                regList =  new Regulations({
                    workstationId: wstOId,
                    regulations: regulations
                });
            } else
                regList.regulations = regulations;

            return regList.save();
        })
        .then(result=>{
            return {};
        });
    }
};

module.exports = RegulationsSynchronizer;
