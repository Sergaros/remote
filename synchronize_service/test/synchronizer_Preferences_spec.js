const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Preferences = mongoose.models.Preferences;
const Workstation = mongoose.models.Workstation;

describe("Synchronizer Preferences", () => {
    let obj_preferenceB;
    let obj_preferenceA;
    let preferencesLocked;

    let wsIdb;
    let wsIda;

    before((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_preferenceB = {
               "header":{
                   "action":"PREFERENCES",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":{
                   "email": "sergiy@qubyx.com",
                   "prefs1": "false",
                   "prefs2": "0",
                   "prefs3": "0.3"
               }
           };

           obj_preferenceA = {
               "header":{
                   "action":"PREFERENCES",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data":{
                   "email": "sergiy@qubyx.com",
                   "prefs0": "0",
                   "prefs1": "true",
                   "prefs2": "5",
                   "prefs3": "0.3",
                   "prefs4": "1",
                   "prefs5": "5"
               }
           };

       })
       .then(()=>{
           return Workstation.findOne({wsId: wsIda});
       })
       .then(workstation=>{
           return Preferences.create({
               workstationId: workstation._id,
               preferences: [
                   {
                       "name": "email",
                       "value":"john@qubyx.com",
                       "isLocked": "true"
                   },
                   {
                       "name": "prefs0",
                       "value":"0"
                   },
                   {
                       "name": "prefs1",
                       "value":"false"
                   },
                   {
                       "name": "prefs2",
                       "value":"0",
                       "isChanged": "true"
                   },
                   {
                       "name": "prefs3",
                       "value":"7.3",
                       "isLocked": "true"
                   },
                   {
                       "name": "prefs4",
                       "value":"1",
                       "isChanged": "true"
                   },
                   {
                       "name": "prefs5",
                       "value":"5",
                       "isLocked": "true"
                   },
               ]
           });
       })
       .then(preferences=>{
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

    it("Simple Preferences request", done=> {
        synchronizer.GetRequest(obj_preferenceB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return Preferences.findOne({workstationId: workstation._id});
        })
        .then(preferences=>{
            expect(preferences.findByName('email').value).equal('sergiy@qubyx.com');
            expect(preferences.findByName('prefs1').value).equal('false');
            expect(preferences.findByName('prefs2').value).equal('0');
            expect(preferences.findByName('prefs3').value).equal('0.3');

            done();
        });
    });

    it("Preferences request with locked preferences", done=> {
        synchronizer.GetRequest(obj_preferenceA)
        .then(results=>{
            expect(results.header.result).equal(4);
            expect(results.data.email).equal('john@qubyx.com');
            expect(results.data.prefs3).equal('7.3');
            expect(results.data.prefs2).equal('0');
            expect(results.data.prefs0).not.exist;
            expect(results.data.prefs4).not.exist;
            expect(results.data.prefs5).not.exist;

            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return Preferences.findOne({workstationId: workstation._id});
        })
        .then(preferences=>{

            expect(preferences.findByName('email').value).equal('john@qubyx.com');
            expect(preferences.findByName('prefs0').value).equal('0');
            expect(preferences.findByName('prefs1').value).equal('true');
            expect(preferences.findByName('prefs2').value).equal('0');
            expect(preferences.findByName('prefs3').value).equal('7.3');
            expect(preferences.findByName('prefs4').isChanged).false;

            done();
        });
    });

});
