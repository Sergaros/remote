const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Languages = mongoose.models.Languages;
const Workstation = mongoose.models.Workstation;

describe("Synchronizer Languages", () => {
    let obj_languagesB;

    let wsIdb;
    let wsIda;

    beforeEach((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_languagesB = {
               "header":{
                   "action":"USERLANGUAGES",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data": [
                    {
                        "name": "Lang1",
                        "id":"1"
                    },
                    {
                        "name": "Lang2",
                        "id":"2"
                    },
                    {
                        "name": "Lang3",
                        "id":"3"
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


    it("Languages List request", done=> {
        synchronizer.GetRequest(obj_languagesB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return Languages.findOne({workstationId: workstation._id});
        })
        .then(langList=>{
            expect(langList.languages.length).equal(3);
            expect(langList.languages[0].name).equal('Lang1');
            expect(langList.languages[0].id_name).equal('1');
            expect(langList.languages[1].name).equal('Lang2');
            expect(langList.languages[1].id_name).equal('2');
            expect(langList.languages[2].name).equal('Lang3');
            expect(langList.languages[2].id_name).equal('3');
            done();
        });
    });
});
