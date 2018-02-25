'use strict'

const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const randObjId = require('./help_methods/common.js').randObjId;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

describe("Synchronizer get Groups", () => {
    let obj_groups;
    let obj_groups_undef_workstation;

    let workstationId;
    let login;
    let password

    before((done) => {

        fillDataBase()
        .then(result=>{

            login =  result.synchInfo.b.login;
            password =  result.synchInfo.b.password;
            workstationId = result.workstations.b.wsId;


           obj_groups = {
               "header":{
                   "action":"GROUPS",
                   "login":login,
                   "pwd":password,
                   "workstationid":workstationId
               },
               "data":{
                   name: 'Test_workstation',
                   app: 'Test App'
               }
           };

           obj_groups_undef_workstation = {
                "header":{
                    "action":"GROUPS",
                    "login":login,
                    "pwd":password,
                    "workstationid":randObjId()
                },
                "data":{
                    name: 'Test_workstation',
                    app: 'Test App'
                }
            };

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

    it("Get Groups request", done=> {
        synchronizer.GetRequest(obj_groups)
        .then(results=>{
            expect(results.data.length).equal(2);
            expect(results.data[0].name).equal('B Group');
            expect(results.header.result).equal(4);
            done();
        }, err=>{
            done(err);
        });
    });

    it("Get Groups request with new workstation", done=> {
        synchronizer.GetRequest(obj_groups_undef_workstation)
        .then(results=>{
            expect(results.data.length).equal(2);
            expect(results.data[0].name).equal('B Group');
            expect(results.header.result).equal(4);
            done();
        }, err=>{
            done(err);
        });
    });

});
