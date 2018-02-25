'use strict'

const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const CalTasks = mongoose.models.CalTasks;
const Workstation = mongoose.models.Workstation;
const Displays = mongoose.models.Displays;

//const {createDate} = require('../../libs/Common/index.js');

xdescribe("CalTasks task methods tests", () => {
    let obj_newUserTask;
    let obj_newServerTask;
    let obj_updateUserTask;
    let obj_updateServerTask;

    let wsIda;
    let workstationId;

    let disp1Id;

    beforeEach((done) => {

        fillDataBase()
        .then(result=>{
           wsIda = result.workstations.a.wsId;
           return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            workstationId = workstation._id;
       })
       .then(()=>{
           return Displays.create({
               workstationId: workstationId,
               displays: [
                   {
                       "id_name": "1",
                       "serial": "AER2511DF",
                       "width": "1024",
                       "height": "1080",
                       "commode": "1",
                       "isactive": "true"
                   }
                ]
           });
       })
       .then(displays=>{
           disp1Id = displays.displays[0]._id;
       })
       .then(()=>{
           obj_updateUserTask = {
               workstationId: workstationId,
               taskId: "1",
               displayId: disp1Id,
               taskType: "user",
               type: "Calibration Whitelevel",
               schtype: "1",
               lastrun: "1491828775000",
               nextrun: "1491915175000",
               TasksStatus: 'ok',
               disabled: false,
               isDeleted: false,
               params: [
                   {name: "param1", value: "value1"},
                   {name: "param2", value: "value22"},
                   {name: "param3", value: "value3"},
                   {name: "param4", value: "value4"}
               ]
           };

           obj_updateServerTask = {
               workstationId: workstationId,
               displayId: disp1Id,
               taskType: "server",
               taskId: "3",
               lastrun: "1491828775000",
               nextrun: "1491915175000",
           };
       })
       .then(()=>{
           return CalTasks.create({
                                    workstationId: workstationId,
                                    displayId: disp1Id,
                                    taskId: "1",
                                    taskType: 'user',
                                    type: {value: "Cal"}, //change
                                    schtype: {value: "3", isChanged: true}, //in result
                                    lastrun: {value: 1491051175000},
                                    nextrun: {value: 1491137575000},
                                    TaskStatus: {value: "ok"},
                                    disabled: {value: true, isLocked: true}, //in result
                                    isDeleted: {value: false},
                                    params: [
                                        {name: "param1", value: "value2", isChanged: true},
                                        {name: "param2", value: "value3"}, //change
                                        {name: "param6", value: "value6", isChanged: true}//new param
                                    ]
                                })
                                .then(()=>{
                                    return CalTasks.create({
                                        workstationId: workstationId,
                                        displayId: disp1Id,
                                        taskType: 'user',
                                        taskId:"5",
                                        type: {value: "Calibration Whitelevel"},
                                        schtype: {value: "3"},
                                        lastrun: {value: 1491051175000},
                                        nextrun: {value: 1491137575000},
                                        TaskStatus: {value: "ok"},
                                        disabled: {value: false},
                                        isDeleted: {value: false},
                                        params: [
                                            {name: "param1", value: "value1"},
                                            {name: "param2", value: "value2"},
                                            {name: "param3", value: "value3"}
                                        ]
                                    });
                                })
                                .then(()=>{
                                        return CalTasks.create({
                                        workstationId: workstationId,
                                        displayId: disp1Id,
                                        taskType: 'server',
                                        taskId: "3",
                                        type: {value: "Calibration"},
                                        schtype: {value: "3", isChanged: true}, //in result
                                        lastrun: {value: 1491051175000},
                                        nextrun: {value: 1491137575000, isChanged: true},
                                        TaskStatus: {value: "ok"},
                                        disabled: {value: true}, //in result
                                        isDeleted: {value: false},
                                        params: [
                                            {name: "param1", value: "value1"},
                                            {name: "param2", value: "value3", isChanged: true}, //vhange
                                            {name: "param4", value: "value4", isChanged: true} //new param
                                        ]
                                    });
                                });
       })
       .then(()=>{
           done();
       })
       .catch(err=>{
          throw err;
       });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it('Get user tasks test',done=>{
        CalTasks.getTasks(workstationId, disp1Id, 'user')
        .then(tasks=>{
            expect(tasks.length).equal(2);
            done();
        })
    });

    it('Get server tasks test',done=>{
        CalTasks.getTasks(workstationId, disp1Id, 'server')
        .then(tasks=>{
            expect(tasks.length).equal(1);
            done();
        })
    });

    it("updateUserTask test", done=> {

        CalTasks.synchronizeTask(obj_updateUserTask)
        .then(result=>{
            expect(result.params.length).equal(2);
            expect(result.params[0].name).equal('param1');
            expect(result.params[0].value).equal('value2');
        })
        .then(()=>{
            return CalTasks.getTasks(workstationId, disp1Id, 'user')
            .then(tasks=>{
                //console.log('tasks - ', tasks);
                return tasks.find(task=>task.taskId==='1');
            });
        })
        .then(task=>{
            expect(task.disabled.value).true;
            expect(task.isDeleted.value).false;
            expect(task.type.value).equal('Calibration Whitelevel');
            expect(task.nextrun.value).equal(1491915175000);
            expect(task.lastrun.value).equal(1491828775000);
            expect(task.params.length).equal(5);
            expect(task.params[0].name).equal('param1');
            expect(task.params[0].value).equal('value2');
            expect(task.params[1].name).equal('param2');
            expect(task.params[1].value).equal('value22');
            expect(task.params[2].name).equal('param6');
            expect(task.params[2].value).equal('value6');
            expect(task.params[4].name).equal('param4');
            expect(task.params[4].value).equal('value4');
            done();
        })
        .catch(err=>{
            console.log('updateUserTask test error: ', err);
        });
    });

    it("updateServerTask test", (done)=> {
        CalTasks.synchronizeTask(obj_updateServerTask)
        .then(result=>{
            //console.log('updateServerTask - ', result);
            return CalTasks.getTasks(workstationId, disp1Id, 'server');
            done();
        })
        .then(tasks=>{
            expect(tasks.length).equal(1);
            expect(tasks[0].schtype.value).equal('3');
            expect(tasks[0].nextrun.value).equal(1491137575000);
            expect(tasks[0].params.length).equal(3);
            expect(tasks[0].params[0].value).equal('value1');
            expect(tasks[0].params[1].value).equal('value3');
            expect(tasks[0].params[2].value).equal('value4');
            done();
        })
        .catch(err=>{
            console.log('updateUserTask test error: ', err);
        });
    });
});
