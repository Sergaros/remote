const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;
const toMD5 = require('./help_methods/common.js').toMD5;

const mongoose = require('m_mongoose');
const Regulations = mongoose.models.Regulations;

describe("Synchronizer set Group", () => {

    let obj_group;

    let workstationId;
    let grId;
    let login;
    let password

    before((done) => {

        fillDataBase()
        .then(result=>{
            grId = result.root;
            login =  result.synchInfo.b.login;
            password =  result.synchInfo.b.password;
            workstationId = result.workstations.b.wsId;

           obj_group = {
               "header":{
                   "action":"SELECTGROUP",
                   "login":login,
                   "pwd":password,
                   "workstationid":workstationId
               },
               "data":{
                   id: grId
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

    it("Set Group request", done=> {
        synchronizer.GetRequest(obj_group)
        .then(results=>{
            expect(results.header.result).equal(4);
            done();
        }, err=>{
            done(err);
        });
    });

});
