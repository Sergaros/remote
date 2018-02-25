const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Regulations = mongoose.models.Regulations;
const Workstation = mongoose.models.Workstation;

describe("Synchronizer Regulations", () => {
    let obj_regulations;

    let wsId;
    let login;
    let password

    beforeEach((done) => {

        fillDataBase()
        .then(result=>{
            login =  result.synchInfo.b.login;
            password =  result.synchInfo.b.password;
            wsId = result.workstations.b.wsId;

           obj_regulations = {
               "header":{
                   "action":"USERREGULATIONLIST",
                   "login":login,
                   "pwd":password,
                   "workstationid":wsId
               },
               "data": [
                    {
                        "name": "Reg1",
                        "id":"1",
                        "classifications": [
                            {
                                "name":"class1",
                                "id": "1"
                            },
                            {
                                "name":"class2",
                                "id": "2"
                            }
                        ]
                    },
                    {
                        "name": "Reg2",
                        "id":"2",
                        "classifications": [
                            {
                                "name":"class1",
                                "id": "1"
                            }
                        ]
                    },
                    {
                        "name": "Reg3",
                        "id":"3",
                        "classifications": [
                            {
                                "name":"class1",
                                "id": "1"
                            },
                            {
                                "name":"class2",
                                "id": "2"
                            },
                            {
                                "name":"class3",
                                "id": "3"
                            }
                        ]
                    }
                ]
           };

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


    it("Regulation List action", done=> {
        synchronizer.GetRequest(obj_regulations)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsId});
        })
        .then(workstation=>{
            return Regulations.findOne({workstationId: workstation._id});
        })
        .then(regList=>{
            expect(regList.regulations.length).equal(3);

            expect(regList.regulations[0].name).equal('Reg1');
            expect(regList.regulations[0].id_name).equal('1');
            expect(regList.regulations[0].classifications.length).equal(2);
            expect(regList.regulations[0].classifications[0].name).equal('class1');
            expect(regList.regulations[0].classifications[0].id_name).equal('1');

            expect(regList.regulations[1].name).equal('Reg2');
            expect(regList.regulations[1].id_name).equal('2');
            expect(regList.regulations[1].classifications.length).equal(1);
            expect(regList.regulations[1].classifications[0].name).equal('class1');
            expect(regList.regulations[1].classifications[0].id_name).equal('1');

            expect(regList.regulations[2].name).equal('Reg3');
            expect(regList.regulations[2].id_name).equal('3');
            expect(regList.regulations[2].classifications.length).equal(3);
            expect(regList.regulations[2].classifications[2].name).equal('class3');
            expect(regList.regulations[2].classifications[2].id_name).equal('3');

            done();
        });
    });
});
