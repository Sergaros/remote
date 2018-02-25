const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Displays = mongoose.models.Displays;
const DisplaysPreferences = mongoose.models.DisplaysPreferences;
const Workstation = mongoose.models.Workstation;

const synchronizer = require('Synchronizer');

describe("Synchronizer DisplayPreferences", () => {

    let obj_dispPrefsB;
    let obj_dispPrefsA;
    let wsIdb;
    let wsIda;
    let disp1Id;
    let disp2Id;
    let disp3Id;

    before((done) => {
        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_dispPrefsB = {
               "header":{
                   "action":"DISPLAYPREFS",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":{
                   "1":{
                           "pref1d1": "value1",
                           "pref2d1": "value2",
                           "pref3d1": "value3",
                           "pref4d1": "value4"
                       },
                   "2":{
                           "pref1d2": "value1",
                           "pref2d2": "value2",
                           "pref3d2": "value3",
                           "pref4d2": "value4",
                           "pref5d2": "value5",
                   }
               }
           };

           obj_dispPrefsA = {
               "header":{
                   "action":"DISPLAYPREFS",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data":{
                   "3":{
                           "pref1d3": "value1",
                           "pref2d3": "value2",
                           "pref3d3": "value3",
                           "pref4d3": "value4",
                           "pref5d3": "value5"
                       }
               }
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
                   },
                   {
                       "id_name": "2",
                       "serial": "CNE25dkt78",
                       "width": "1600",
                       "height": "900",
                       "commode": "2",
                       "isactive": "false"
                   }
                ]
           });
       })
       .then(displays=>{
           //console.log('Displays - ', displays);
           disp1Id = displays.displays[0]._id;
           disp2Id = displays.displays[1]._id;
       })
       .then(()=>{
           return Workstation.findOne({wsId: wsIda});
       })
       .then((workstation)=>{
           return Displays.create({
               workstationId: workstation._id,
               displays: [
                   {
                       "id_name": "3",
                       "serial": "CDE27dki79",
                       "width": "1024",
                       "height": "1080",
                       "commode": "3",
                       "isactive": "true"
                   }
                ]
           })
           .then(displays=>{
               disp3Id = displays.displays[0]._id;

               return DisplaysPreferences.create({
                   workstationId: workstation._id,
                   PreferencesList: [
                       {
                           displayId: disp3Id,
                           Preferences: [
                               { //same pref
                                   name: "pref1d3",
                                   value: "value3"
                               },
                               {//must be changed
                                   name: "pref2d3",
                                   value: "valueOther"
                               },
                               {//must be return in result
                                   name: "pref3d3",
                                   value: "value3_new",
                                   isChanged: true
                               },
                               {//must be return in result
                                   name: "pref4d3",
                                   value: "value4_new",
                                   isLocked: true
                               },
                               {//must be not return in result
                                   name: "pref5d3",
                                   value: "value5",
                                   isChanged: true
                               },
                           ]
                       }
                   ]
               })
           });
       })
       .then(dispsPrefsList=>{
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

    it("Simple DisplaysPreferences request", done=> {
        synchronizer.GetRequest(obj_dispPrefsB)
        .then(results=>{
            //console.log('Simple results - ', results);
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return DisplaysPreferences.findOne({workstationId: workstation._id});
        })
        .then(dispsPrefs=>{
            //console.log('dispsPrefs.PreferencesList - ', dispsPrefs);
            expect(dispsPrefs.PreferencesList.length).equal(2);

            expect(dispsPrefs.PreferencesList[0].displayId.equals(disp1Id)).true;
            expect(dispsPrefs.PreferencesList[0].Preferences.length).equal(4);
            expect(dispsPrefs.PreferencesList[0].Preferences[0].name).equal('pref1d1');
            expect(dispsPrefs.PreferencesList[0].Preferences[0].value).equal('value1');
            expect(dispsPrefs.PreferencesList[0].Preferences[3].name).equal('pref4d1');
            expect(dispsPrefs.PreferencesList[0].Preferences[3].value).equal('value4');

            expect(dispsPrefs.PreferencesList[1].displayId.equals(disp2Id)).true;
            expect(dispsPrefs.PreferencesList[1].Preferences.length).equal(5);
            expect(dispsPrefs.PreferencesList[1].Preferences[0].name).equal('pref1d2');
            expect(dispsPrefs.PreferencesList[1].Preferences[0].value).equal('value1');
            expect(dispsPrefs.PreferencesList[1].Preferences[4].name).equal('pref5d2');
            expect(dispsPrefs.PreferencesList[1].Preferences[4].value).equal('value5');

            done();
        });
    });

    it("Complex DisplaysPreferences request", done=> {
        synchronizer.GetRequest(obj_dispPrefsA)
        .then(results=>{
            //console.log('Complex results - ', results);
            expect(results.header.result).equal(4);
            expect(results.data['3']['pref3d3']).equal('value3_new');
            expect(results.data['3']['pref4d3']).equal('value4_new');
            expect(results.data['3']['pref5d3']).not.exist;
            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return DisplaysPreferences.findOne({workstationId: workstation._id});
        })
        .then(dispsPrefs=>{
            //console.log('dispsPrefs - ', dispsPrefs);
            expect(dispsPrefs.PreferencesList.length).equal(1);

            expect(dispsPrefs.PreferencesList[0].displayId.equals(disp3Id)).true;
            expect(dispsPrefs.PreferencesList[0].Preferences.length).equal(5);
            expect(dispsPrefs.PreferencesList[0].Preferences[0].name).equal('pref1d3');
            expect(dispsPrefs.PreferencesList[0].Preferences[0].value).equal('value1');
            expect(dispsPrefs.PreferencesList[0].Preferences[1].name).equal('pref2d3');
            expect(dispsPrefs.PreferencesList[0].Preferences[1].value).equal('value2');
            expect(dispsPrefs.PreferencesList[0].Preferences[2].name).equal('pref3d3');
            expect(dispsPrefs.PreferencesList[0].Preferences[2].value).equal('value3_new');
            expect(dispsPrefs.PreferencesList[0].Preferences[3].name).equal('pref4d3');
            expect(dispsPrefs.PreferencesList[0].Preferences[3].value).equal('value4_new');

            done();
        });
    });
});
