'use strict'

const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const QATasks = mongoose.models.QATasks;
const Workstation = mongoose.models.Workstation;
const Displays = mongoose.models.Displays;

describe("Synchronizer QATasks", () => {
    let obj_qatasksB;
    let obj_qatasksA;

    let wsIdb;
    let wsIda;
    let wsOIda;

    let disp1Id;
    let disp2Id;

    before((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_qatasksB = {
               "header":{
                   "action":"QATASKS",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":  [
            		{
            			"displayid":"1",
            			"name":"QATask1",
            			"freq":"1",
            			"freqCodes":"1",
            			"lastrundate":"Never",
            			"nextdate":"1491080400",
                        "nextdateFixed":"1491080400",
                        "taskStatus":"1",
                        "taskKey":"1",
            			"stepsIds": [1,2,3]
            		},
                    {
            			"displayid":"1",
            			"name":"QATask2",
            			"freq":"2",
            			"freqCodes":"2",
                        "lastrundate":"2017.10.2",
            			"nextdate":"1491080400",
                        "nextdateFixed":"1491080400",
                        "taskStatus":"2",
                        "taskKey":"2",
            			"stepsIds": [1,2,3,4]
            		}
                ]
           };

           obj_qatasksA = {
               "header":{
                   "action":"QATASKS",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data":  [
                   {
                       "displayid":"1",
                       "name":"QATask3",
                       "freq":"3",
                       "freqCodes":"3",
                       "lastrundate":"Never",
                       "nextdate":"1491080400",
                        "nextdateFixed":"1491080400",
                        "taskStatus":"2",
                        "taskKey":"3",
                       "stepsIds": [1,2]
                   }
                ]
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
           return QATasks.create({
               workstationId: wsOIda,
               tasks: [
                        {
                            displayId: disp2Id,
                            taskList:[
                                        {
                                          name:{
                                             value: 'SomeQATask'
                                          },
                                          freq:{
                                              value: '33'
                                          },
                                          freqCodes:{
                                               value: '33'
                                          },
                                          lastrundate:{
                                               value: 'Never'
                                          },
                                          nextdate:{
                                               value: 1490994000
                                          },
                                          nextdateFixed:{
                                               value: 1490994000
                                          },
                                          taskStatus:{
                                               value: '33'
                                          },
                                          taskKey:{
                                             value: 'taskKey'
                                          },

                                          stepsIds: [2,3,4,5]
                                       }
                                   ]
                        }
                    ]
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

    after(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Simple QATask request", done=> {
        synchronizer.GetRequest(obj_qatasksB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return QATasks.findOne({workstationId: workstation._id});
        })
        .then(qaTasks=>{
            //console.log('QATasks - ', qaTasks.tasks[0].taskList[0]);

            expect(qaTasks.tasks.length).equal(1);
            expect(qaTasks.tasks[0].displayId.equals(disp1Id)).true;
            expect(qaTasks.tasks[0].taskList.length).equals(2);

            expect(qaTasks.tasks[0].taskList[0].name.value).equals('QATask1');
            expect(qaTasks.tasks[0].taskList[0].stepsIds.toString()).equals('1,2,3');
            expect(qaTasks.tasks[0].taskList[0].nextdate.value).equals(1491080400000);

            expect(qaTasks.tasks[0].taskList[1].name.value).equals('QATask2');
            expect(qaTasks.tasks[0].taskList[1].stepsIds.toString()).equals('1,2,3,4');
            expect(qaTasks.tasks[0].taskList[1].nextdate.value).equals(1491080400000);

            done();
        })
        .catch(err=>{
            console.log(err);
            done();
        });
    });

    it("Complex QATask request", done=> {
        synchronizer.GetRequest(obj_qatasksA)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return QATasks.findOne({workstationId: workstation._id});
        })
        .then(qaTasks=>{
            //console.log('QATasks - ', qaTasks.tasks[0].taskList[0]);

            expect(qaTasks.tasks.length).equal(1);
            expect(qaTasks.tasks[0].displayId.equals(disp2Id)).true;
            expect(qaTasks.tasks[0].taskList.length).equals(1);

            expect(qaTasks.tasks[0].taskList[0].name.value).equals('QATask3');
            expect(qaTasks.tasks[0].taskList[0].stepsIds.toString()).equals('1,2');
            expect(qaTasks.tasks[0].taskList[0].nextdate.value).equals(1491080400000);

            done();
        })
        .catch(err=>{
            console.log(err);
            done();
        });
    });

});
