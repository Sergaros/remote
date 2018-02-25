'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
//const {createDate} = require('Common');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const CalTasks = mongoose.models.CalTasks;

class CalTasksSynchronizer extends BaseSynchronizer {

    Synchronize(){
        let results = {};
        let wstId;

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstId = workstation._id;
            return workstation._id;
        })
        .then(wid=>{

            if(!this.data.tasks)
                return [];

            //console.log('CalTasksSynchronizer - ', this.data.tasks);
            return Promise.all(this.data.tasks.map(task=>{
                return Displays.getDisplayIdByIdName(wid, task.displayId)
                .then(displayId=>{
                    task.workstationId = wstId;
                    task.displayId = displayId;
                    task.nextrun = task.nextrun*1000;
                    task.lastrun = task.lastrun*1000;
                    return CalTasks.synchronizeTask(task);
                })
            }));
        })
        .then(results=>{
            return CalTasks.find({workstationId: wstId, synch: false})
            .then(tasks=>{
                return Promise.all(tasks.map(task=>{
                    return Displays.getDisplayIdByIdName(wstId, task.displayId.value)
                    .then(displayId=>{
                        let data = {};

                        data.workstationId = wstId;
                        data.displayId = displayId;
                        if(task.taskId) data.taskId = task.taskId.value;
                        if(task.serverTaskId) data.serverTaskId = task.serverTaskId;

                        if(!task.deleted.value){
                            let options = CalTasks.getOptionsNames();

                            options.forEach(option=>{
                                if(task[option].isChanged || task[option].isLocked){
                                    data[option] = task[option].value;
                                    task[option].isChanged = false;
                                }
                            });

                            if(data.nextrun) data.nextrun = data.nextrun/1000;
                            if(data.lastrun) data.lastrun = data.lastrun/1000;

                            let exceptions = CalTasks.resolveExceptions(task);
                            if(exceptions.length)
                                data.exceptions = exceptions;

                            task.synch = true;
                            return task.save()
                            .then(()=>{
                                return data;
                            });
                        } else {
                            data.deleted = true;
                            return task.remove()
                            .then(()=>{
                                return data;
                            });
                        }
                    })
                }));
            })
            .then(tasks=>{
                //console.log('Modified tasks - ', results);
                //console.log('Modified existing tasks - ', tasks);
                if(tasks.length){
                    results = results.concat(tasks);
                }

                return results;
            })

        })
        .then(results=>{
            //console.log('results - ',results);
            results = results.filter(task=>Object.keys(task).length);

            return Promise.all(results.map(task=>{
                if(task.displayId){
                    return Displays.getDisplayIdNameById(wstId, task.displayId)
                    .then(idName=>{
                        task.displayId = idName;
                    });
                }

                return Promise.resolve(true);
            }))
            .then(()=>{
                results.forEach(task=>{
                    if(task.nextrun) task.nextrun = task.nextrun/1000;
                    if(task.lastrun) task.lastrun = task.lastrun/1000;
                });

                return results;
            });
        });
    }
};

module.exports = CalTasksSynchronizer;
