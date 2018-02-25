'use strict'

/*const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {createDate} = require('Common');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const CalibrationTasks = mongoose.models.CalibrationTasks

class CalibrationTasksSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;
        let dispList = [];
        let results = {userTasks:[], serverTasks:[]};

        //Prepare data
        let data=CalibrationTasks.ConvertJsonToTasks(this.data);
        //console.log('Calibration tasks - ', this.data);
        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displays=>{
            dispList = displays.displays;
            return CalibrationTasks.findOne({workstationId: wstOId});
        })
        .then(calTasks=>{
            if(!calTasks){
                calTasks = new CalibrationTasks();
                calTasks.workstationId = wstOId;
                calTasks.tasks = [];

                for(let dispIdName in data.userTasks){
                    let disp = dispList.find(display=>display.id_name===dispIdName);
                    if(disp){
                        calTasks.tasks.push({
                            displayId: disp._id,
                            userTasks: data.userTasks[dispIdName]
                        });

                    } else {
                        console.log('Error: wrong display id (calibration user tasks 1)');
                    }
                }
            } else{
                for(let dispIdName in data.userTasks){
                    let disp = dispList.find(display=>display.id_name===dispIdName);
                    if(!disp){
                        console.log('Error: wrong display id (calibration user tasks 2)');
                    } else {
                        for(let i = 0; i < data.userTasks[dispIdName].length; i++){
                            let ntask = data.userTasks[dispIdName][i];
                            let taskIndex = calTasks.getUserTaskIndex(disp._id, ntask.taskId);

                            if(taskIndex!=-1){
                                let res = calTasks.updateUserTask(disp._id, ntask);
                                if(res)
                                    results.userTasks.push(res);
                            }
                            else{
                                calTasks.addUserTask(disp._id, ntask);
                            }
                        };

                        let taskIds = calTasks.getNewUserTasksIds(disp._id);
                        taskIds.forEach(taskId=>{
                            let task = calTasks.getUserTask(disp._id, taskId);
                            CalibrationTasks.IsTaskSynchronizeNeed(task, false);
                            results.userTasks.push(CalibrationTasks.TaskToJson(disp.id_name, task));
                        });
                    }
                };

                dispList.forEach(disp=>{
                    let taskIds = calTasks.getNewServerTasksIds(disp._id);
                    //console.log('getNewServerTasksIds taskIds - ', taskIds);

                    taskIds.forEach(taskId=>{
                        let task = calTasks.getServerTask(disp._id, taskId);
                        CalibrationTasks.IsTaskSynchronizeNeed(task, false);
                        results.serverTasks.push(CalibrationTasks.TaskToJson(disp.id_name, task));
                    });
                });
            }
            if(calTasks.tasks.length)
                return calTasks.save();
            else
                return null;
        })
        .then(result=>{
            if(result){
                if(results.userTasks.length || results.serverTasks.length){
                    console.log('results.serverTasks - ', results.serverTasks);
                    if(!results.serverTasks.length)
                        delete results.serverTasks;
                    if(!results.userTasks.length)
                        delete results.userTasks;

                    return results;
                }
                else
                    return {};
            } else
                return {};
        });
    }
};

module.exports = CalibrationTasksSynchronizer;*/
