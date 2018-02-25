const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Workstation = mongoose.models.Workstation;
const SettingsNames = mongoose.models.SettingsNames;

describe("Synchronizer SettingsNames", () => {
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
                   "action":"SETTINGSNAMES",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data": {
                    Settings1: "key11|value11|key12|value12",
                    Settings2: "key21|value21|key22|value22|key23|value23",
                    Settings3: "key31|value31"
                }
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


    it("synchronize request", done=> {
        synchronizer.GetRequest(obj_languagesB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return SettingsNames.findOne({workstationId: workstation._id});
        })
        .then(settingsNames=>{

            expect(settingsNames.settings.length).equal(3);
            expect(settingsNames.settings[0].name).equal('Settings1');
            expect(settingsNames.settings[0].values.length).equal(2);
            expect(settingsNames.settings[0].values[0].key).equal('value11');
            expect(settingsNames.settings[0].values[0].value).equal('key11');
            expect(settingsNames.settings[0].values[1].key).equal('value12');
            expect(settingsNames.settings[0].values[1].value).equal('key12');

            expect(settingsNames.settings[1].name).equal('Settings2');
            expect(settingsNames.settings[1].values.length).equal(3);
            expect(settingsNames.settings[1].values[0].key).equal('value21');
            expect(settingsNames.settings[1].values[0].value).equal('key21');
            expect(settingsNames.settings[1].values[1].key).equal('value22');
            expect(settingsNames.settings[1].values[1].value).equal('key22');
            expect(settingsNames.settings[1].values[2].key).equal('value23');
            expect(settingsNames.settings[1].values[2].value).equal('key23');

            expect(settingsNames.settings[2].name).equal('Settings3');
            expect(settingsNames.settings[2].values.length).equal(1);
            expect(settingsNames.settings[2].values[0].key).equal('value31');
            expect(settingsNames.settings[2].values[0].value).equal('key31');

            done();
        })
        .catch(err=>{
            console.log(err);
            done();
        });
    });
});
