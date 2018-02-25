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

describe("Synchronizer QASteps", () => {
    let obj_qatasksB;

    let wsIdb;
    let wsOIdb;
    let disp1Id;


    before((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;

           obj_qatasksB = {
               "header":{
                   "action":"QASTEPS",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data": {}
           };

       })
       .then(()=>{
           return Workstation.findOne({wsId: wsIdb});
       })
       .then(workstation=>{
           wsOIdb = workstation._id;
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
           return QATasks.create({
               workstationId: wsOIdb,
               tasks: [
                        {
                            displayId: disp1Id,
                            taskList:[
                                        {
                                          name:{
                                             value: 'TestQA'
                                          },
                                          freq:{
                                              value: '33'
                                          },
                                          freqCodes:{
                                               value: '33'
                                          },
                                          lastrundate:{
                                               value: 1490994000000
                                          },
                                          nextdate:{
                                               value: 1490994000000,
                                               isChanged: true
                                          },
                                          nextdateFixed:{
                                               value: 1490994000000
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

    it("Simple QASTEPS request", done=> {
        synchronizer.GetRequest(obj_qatasksB)
        .then(results=>{
            //console.log('QASteps result - ', results);
            expect(results.header.result).equal(4);

            expect(results.data.length).equal(4);

            expect(results.data[0].displayId).equal('1');
            expect(results.data[0].stepId).equal('2');
            expect(results.data[0].nextTime).equal('1490994000');

            expect(results.data[3].displayId).equal('1');
            expect(results.data[3].stepId).equal('5');
            expect(results.data[3].nextTime).equal('1490994000');

            done();
        })
    });
});
