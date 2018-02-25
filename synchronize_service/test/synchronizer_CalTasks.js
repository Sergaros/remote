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

xdescribe("Synchronizer CalTasks", () => {
    let obj_caltasksB;
    let obj_caltasksA;

    let wsIdb;
    let wsIda;
    let wsOIda;

    let disp1Id;
    let disp2Id;

    beforeEach((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_caltasksB = {
               "header":{
                   "action":"CALTASKS",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":  {
                   userTasks: [
                       {
                           taskId: "1",
                           displayId: "1",
                           type: "Calibration",
                           schtype: "1",
                           lastrun: "1490994000",
                           nextrun: "1491080400",
                           disabled: "false",
                           isDeleted: "false",
                           params: [
                               {name: "param1", value: "value1"},
                               {name: "param2", value: "value2"}
                           ]
                       },
                       {
                           taskId: "2",
                           displayId: "1",
                           type: "Calibration Whitelevel",
                           schtype: "2",
                           lastrun: "1490994000",
                           nextrun: "1491080400",
                           disabled: "true",
                           isDeleted: "false",
                           params: [
                               {name: "param3", value: "value3"},
                               {name: "param4", value: "value4"}
                           ]
                       }
                   ]
               }
           };

           obj_caltasksA = {
               "header":{
                   "action":"CALTASKS",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data": {
                   userTasks: [
                       {
                           taskId: "1",
                           displayId: "1",
                           type: "Calibration",
                           schtype: "1",
                           lastrun: "1491742375",
                           nextrun: "1491828775",
                           disabled: "true",
                           isDeleted: "false",
                           params: [
                               {name: "param1", value: "value1"},
                               {name: "param2", value: "value2"},
                               {name: "param3", value: "value3"}
                           ]
                       }
                   ]
               }
           };
       })
       .then(()=>{
           return Workstation.findOne({wsId: wsIdb});
       })
       .then(workstation=>{
           return Displays.create({
               workstationId: workstation._id,
               displays: [
                   {
                       "id_name": "1",
                       "serial": "CER2511DF",
                       "width": "1800",
                       "height": "1200",
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
           return Workstation.findOne({wsId: wsIda});
       })
       .then(workstation=>{
           wsOIda = workstation._id;
           return Displays.create({
               workstationId: workstation._id,
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
           disp2Id = displays.displays[0]._id;
       })
       .then(()=>{
           return CalTasks.create({
                workstationId: wsOIda,
                displayId: disp2Id,
                taskId: "1",
                taskType: 'user',
                type: {value: "Cal"}, //change
                schtype: {value: "3", isChanged: true}, //in result
                lastrun: {value: 1491051175000},
                nextrun: {value:1491137575000},
                TaskStatus: {value: "ok"},
                disabled: {value: true, isLocked: true}, //in result
                isDeleted: {value: false},
                params: [
                    {name: "param1", value: "value1", isChanged: true},
                    {name: "param2", value: "value22", isChanged: true}, //change
                    {name: "param4", value: "value4", isChanged: true}//new param
                ]
            })
            .then(()=>{
                return CalTasks.create({
                    workstationId: wsOIda,
                    displayId: disp2Id,
                    taskId:"5",
                    taskType: 'user',
                    type: {value: "Calibration Whitelevel"},
                    schtype: {value: "3"},
                    lastrun: {value: 1491051175000},
                    nextrun: {value: 1491137575000},
                    TaskStatus: {value: "ok"},
                    disabled: {value: false},
                    isDeleted: {value: false},
                    isSynchronize: false,
                    params: [
                        {name: "param1", value: "value1"},
                        {name: "param2", value: "value2"},
                        {name: "param3", value: "value3"}
                    ]
                });
            });
       })
       .then(()=>{
           done();
       })
       .catch(err=>{
           console.log(err);
           done();
       });
    });

    afterEach(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Simple CalTasks request", done=> {
        synchronizer.GetRequest(obj_caltasksB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return CalTasks.find({workstationId: workstation._id});
        })
        .then(calTasks=>{
            expect(calTasks.length).equal(2);

            let task2 = calTasks.find(task=>task.type.value === 'Calibration Whitelevel');
            let task1 = calTasks.find(task=>task.type.value === 'Calibration');

            task1 = task1.getPublicFields();
            task2 = task2.getPublicFields();

            expect(task2.type.value).equal('Calibration Whitelevel');
            expect(task2.schtype.value).equal('2');
            expect(task2.nextrun.value).equal(1491080400000);
            expect(task2.lastrun.value).equal(1490994000000);

            expect(task2.params.length).equal(2);
            expect(task2.params[0].name).equal('param3');
            expect(task2.params[0].value).equal('value3');
            expect(task2.params[1].name).equal('param4');
            expect(task2.params[1].value).equal('value4');

            expect(task1.displayId.equals(disp1Id)).true;
            expect(task1.type.value).equal('Calibration');
            expect(task1.schtype.value).equal('1');
            expect(task1.nextrun.value).equal(1491080400000);
            expect(task1.lastrun.value).equal(1490994000000);

            expect(task1.params.length).equal(2);
            expect(task1.params[0].name).equal('param1');
            expect(task1.params[0].value).equal('value1');
            expect(task1.params[1].name).equal('param2');
            expect(task1.params[1].value).equal('value2');

            done();
        });
    });

    it("Complex CalTasks request", done=> {
        synchronizer.GetRequest(obj_caltasksA)
        .then(results=>{
            //console.log('Complex CalTasks Result - ', results.data.userTasks[0]);
            //expect(results.data.userTasks.length).equal(3);

            let data = results.data.userTasks[0];
            expect(data.schtype).equal('3');
            expect(data.disabled).true;
            expect(data.params.length).equal(3);
            expect(data.params[0].value).equal('value22');
            expect(data.params[1].value).equal('value1');
            expect(data.params[2].value).equal('value4');

            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return CalTasks.findOne({workstationId: workstation._id, displayId: disp2Id, taskId: '1'});
        })
        .then(result=>{
            let task = result.getPublicFields();
            expect(task.schtype.value).equal('3');
            expect(task.type.value).equal('Calibration');
            expect(task.lastrun.value).equal(1491742375000);
            expect(task.nextrun.value).equal(1491828775000);
            expect(task.params.length).equal(4);
            done();
        });
    });

});
