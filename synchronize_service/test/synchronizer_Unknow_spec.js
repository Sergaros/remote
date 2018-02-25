const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;

describe("Synchronizer UNKNOW_ACTION", () => {
    let obj_undefine;

    before((done) => {

        clearBD()
        .then(result=>{
            obj_undefine = {
               "header":{
                   "action":"UNKNOW_ACTION",
                   "login":"login",
                   "pwd":"password",
                   "workstationid":"workstationId"
               },
               "data":{}
           };
           done();
       });
   });

   after(done => {
       clearBD()
       .then(results=>{
           done();
       });
   });

   it("Get request with Undefine action", done=> {
       synchronizer.GetRequest(obj_undefine)
       .then(results=>{
           expect(results.header.result).equal(5);
           done();
       }, err=>{
           done(err);
       });
   });

});
