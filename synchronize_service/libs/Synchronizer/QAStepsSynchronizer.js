'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {States} = require('./BaseSynchronizer.js');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const QATasks = mongoose.models.QATasks;

class QAStepsSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;
        let dispList = [];

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displays=>{
            dispList = displays.displays;
            return QATasks.find({workstationId: wstOId});
        })
        .then(qaTasks=>{
            if(QAStepsSynchronizer.GetState(States.STATE_REGULATION_CHANGED))
                return [];

            let result = [];
            qaTasks.forEach(qaTask=>{
                qaTask.tasks.forEach(task=>{
                    let disp = dispList.find(display=>display._id.equals(task.displayId));
                    if(disp){
                        task.taskList.forEach(group=>{
                            if(group.nextdate.isChanged){
                                group.stepsIds.forEach(stepId=>{
                                    result.push({
                                                    displayId: disp.id_name,
                                                    stepId: stepId.toString(),
                                                    nextTime: (group.nextdate.value/1000).toString()
                                                });
                                });
                            }
                        });
                    }else
                        console.log('Error cannot find display (QA Steps)');
                });
            });

            return result;
        })
        .then(result=>{
            return result;
        });
    }
};

module.exports = QAStepsSynchronizer;
