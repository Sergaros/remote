'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');
const {createDate} = require('Common');

const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;
const QATasks = mongoose.models.QATasks;
const CalendarCache = mongoose.models.CalendarCache;

class QATasksSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let wstOId;
        let dispList = [];
        let result = [];
        let removeCahce = [];

        //Prepare data
        let data={};
        let excs_data={};
        for(let i = 0; i < this.data.length; i++){
            let task = this.data[i];

            if(!data[task.displayid])
                data[task.displayid]= [];

            if(!excs_data[task.displayid])
                excs_data[task.displayid]= [];


            //console.log('qa next date - ',task.nextdate);

            /*if(task.lastrundate==='Never')
                task.lastrundate = 0;

            if(task.nextdate==='Never')
                task.nextdate = 0;

            if(task.nextdateFixed==='Never')
                task.nextdateFixed = 0;*/

            //console.log('excpeptions 1 - ', task.exceptions);

            data[task.displayid].push({
                name            :{value: task.name},
    			freq            :{value: task.freq},
    			freqCodes       :{value: task.freqCodes},
    			lastrundate     :{value: task.lastrundate},
    			nextdate        :{value: task.nextdate*1000},
                nextdateFixed   :{value: task.nextdateFixed*1000},
                taskStatus      :{value: task.taskStatus},
                taskKey         :{value: task.taskKey},
                stepsIds        :task.stepsIds,
                exceptions      :task.exceptions
            });
        }

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displays=>{
            dispList = displays.displays;

            let proms = [];

            for(let dispIdName in data){

                let disp = dispList.find(display=>display.id_name===dispIdName);
                if(disp){

                        data[dispIdName].forEach(task=>{
                            proms.push(
                                QATasks.getExceptions(wstOId, disp._id, task.taskKey.value)
                                .then(excps=>{

                                    if(task.exceptions && excps){
                                        let res = QATasks.resolveExceptions(task.taskKey.value, task.exceptions, excps);
                                        if(res.length){
                                            //if(!result.exceptions) result.exceptions = [];
                                            res.forEach(exc=>{exc.from/=1000; exc.to/=1000;});
                                            result.push({taskKey: task.taskKey.value, displayid: dispIdName, exceptions: res});
                                        }

                                        if(!data[dispIdName].exceptions)
                                            data[dispIdName].exceptions = [];

                                        if(excps.length){
                                            excs_data[dispIdName].push(...excps.map(exc=>{
                                                exc.taskKey = task.taskKey.value;
                                                return exc;
                                            }));
                                        }
                                    }
                                })
                            );
                        })
                }
            }

            return Promise.all(proms)
            .then(()=>{
                //console.log('remove all');
                return QATasks.findOne({workstationId: wstOId});
            });
        })
        .then(qaTasks=>{

            if(qaTasks === null){
                qaTasks =  new QATasks();
                qaTasks.workstationId =  wstOId;
                qaTasks.tasks = [];

                for(let dispIdName in data){
                    let disp = dispList.find(display=>display.id_name===dispIdName);
                    if(disp){
                        qaTasks.tasks.push({
                            displayId: disp._id,
                            taskList: data[dispIdName],
                            exceptions: excs_data[dispIdName]
                        });
                    } else {
                        console.log('Error: wrong display id (qa tasks 1)');
                    }
                }
            } else {
                for(let dispIdName in data){
                    let disp = dispList.find(display=>display.id_name===dispIdName);
                    if(disp){
                        let tasks = qaTasks.tasks.find(ts=>ts.displayId.equals(disp._id));

                        if(tasks){
                            tasks.exceptions = excs_data[dispIdName];
                            data[dispIdName].forEach(ctask=>{

                                let sindex = tasks.taskList.findIndex(t=>t.taskKey.value===ctask.taskKey.value);
                                if(sindex!=-1){
                                    let stId = tasks.taskList[sindex]._id;
                                    tasks.taskList[sindex] = ctask;
                                    tasks.taskList[sindex]._id = stId;

                                    removeCahce.push(CalendarCache.findOneAndRemove({workstationId: wstOId, taskId: stId, taskType: 'qa'}));
                                } else {
                                    qaTasks.tasks.push({
                                        displayId: disp._id,
                                        taskList: data[dispIdName],
                                        exceptions: excs_data[dispIdName]
                                    });
                                }
                            });
                        }
                    }
                }
            }

            return Promise.all(removeCahce)
            .then(()=>{
                if(qaTasks.tasks.length)
                    return qaTasks.save();
                else
                    return;
            });
        })
        .then(()=>{
            console.log('qa result - ', JSON.stringify(result));
            console.log();
            return result;
        });
    }
};

module.exports = QATasksSynchronizer;
