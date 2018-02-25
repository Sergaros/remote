'use strict'

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const toMD5 = require('./help_methods/common.js').toMD5;
const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const {BaseSynchronizer} = require('../libs/Synchronizer/BaseSynchronizer.js');

describe("Synchronize access", () => {
        let synchDataA;
        let synchDataB;
        let synchDataC
        let synchDataRoot;

        before(done=>{

            fillDataBase()
            .then(result=>{

                synchDataRoot = {
                    "header":{
                        "action":"PREFERENCES",
                        "login":result.synchInfo.root.login,
                        "pwd":result.synchInfo.root.password,
                        "workstationid":result.workstations.c.wsId
                    },
                    "data":{}
                };

                synchDataA = {
                    "header":{
                        "action":"PREFERENCES",
                        "login":result.synchInfo.a.login,
                        "pwd":result.synchInfo.a.password,
                        "workstationid":result.workstations.a.wsId
                    },
                    "data":{}
                };

                synchDataB = {
                    "header":{
                        "action":"PREFERENCES",
                        "login":result.synchInfo.b.login,
                        "pwd":result.synchInfo.b.password,
                        "workstationid":result.workstations.b.wsId
                    },
                    "data":{}
                };

                synchDataC = {
                    "header":{
                        "action":"PREFERENCES",
                        "login":result.synchInfo.a.login,
                        "pwd":result.synchInfo.a.password,
                        "workstationid":result.workstations.c.wsId
                    },
                    "data":{}
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

    it("Synchronize access test Direct", done=> {
        const synchrB = new BaseSynchronizer(synchDataB);
        const synchrA = new BaseSynchronizer(synchDataA);

        synchrB.CheckAccess()
        .then(result=>{
            expect(result).true;
        })
        .then(()=>{
            return synchrA.CheckAccess();
        })
        .then(result=>{
            expect(result).true;
            done();
        });
    });

    it("Synchronize access test with wrong login/password", done=> {
        const synchrC = new BaseSynchronizer(synchDataC);

        synchrC.CheckAccess()
        .then(result=>{
            expect(result).false;
            done();
        });
    });

    it("Synchronize access test with root login/password", done=> {
        const synchrRoot = new BaseSynchronizer(synchDataRoot);

        synchrRoot.CheckAccess()
        .then(result=>{
            expect(result).true;
            done();
        });
    });
});
