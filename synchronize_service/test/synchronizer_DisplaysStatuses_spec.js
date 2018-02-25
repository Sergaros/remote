const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Displays = mongoose.models.Displays;
const DisplaysStatuses = mongoose.models.DisplaysStatuses;
const Workstation = mongoose.models.Workstation;

const synchronizer = require('Synchronizer');

describe("Synchronizer DisplayStatuses", () => {

    let obj_dispStatsB;
    let obj_dispStatsA;
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

           obj_dispStatsB = {
               "header":{
                   "action":"DISPLAYSTATUSES",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":{
                   "1":{
                           "status1d1": "value1",
                           "status2d1": "value2",
                           "status3d1": "value3"
                       },
                   "2":{
                           "status1d2": "value1",
                           "status2d2": "value2",
                           "status3d2": "value3",
                           "status4d2": "value4",
                           "status5d2": "value5",
                   }
               }
           };

           obj_dispStatsA = {
               "header":{
                   "action":"DISPLAYSTATUSES",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data":{
                   "3":{
                           "status1d3": "value1",
                           "status2d3": "value2",
                           "status3d3": "value3"
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

               return DisplaysStatuses.create({
                   workstationId: workstation._id,
                   StatusesList: [
                       {
                           displayId: disp3Id,
                           Statuses: [
                               { //same pref
                                   name: "status1d3",
                                   value: "value1"
                               },
                               {//must be changed
                                   name: "status2d3",
                                   value: "valueOther"
                               }
                           ]
                       }
                   ]
               })
           });
       })
       .then(dispsStatsList=>{
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

    it("Simple DisplaysStatuses request", done=> {
        synchronizer.GetRequest(obj_dispStatsB)
        .then(results=>{
            //console.log('Simple results - ', results);
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return DisplaysStatuses.findOne({workstationId: workstation._id});
        })
        .then(dispsPrefs=>{
            //console.log('dispsPrefs.PreferencesList - ', dispsPrefs);
            expect(dispsPrefs.StatusesList.length).equal(2);

            expect(dispsPrefs.StatusesList[0].displayId.equals(disp1Id)).true;
            expect(dispsPrefs.StatusesList[0].Statuses.length).equal(3);
            expect(dispsPrefs.StatusesList[0].Statuses[0].name).equal('status1d1');
            expect(dispsPrefs.StatusesList[0].Statuses[0].value).equal('value1');
            expect(dispsPrefs.StatusesList[0].Statuses[2].name).equal('status3d1');
            expect(dispsPrefs.StatusesList[0].Statuses[2].value).equal('value3');

            expect(dispsPrefs.StatusesList[1].displayId.equals(disp2Id)).true;
            expect(dispsPrefs.StatusesList[1].Statuses.length).equal(5);
            expect(dispsPrefs.StatusesList[1].Statuses[0].name).equal('status1d2');
            expect(dispsPrefs.StatusesList[1].Statuses[0].value).equal('value1');
            expect(dispsPrefs.StatusesList[1].Statuses[4].name).equal('status5d2');
            expect(dispsPrefs.StatusesList[1].Statuses[4].value).equal('value5');

            done();
        });
    });

    it("Complex DisplaysStatuses request", done=> {
        synchronizer.GetRequest(obj_dispStatsA)
        .then(results=>{
            //console.log('Complex results - ', results);
            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return DisplaysStatuses.findOne({workstationId: workstation._id});
        })
        .then(dispsPrefs=>{
            //console.log('dispsPrefs - ', dispsPrefs);
            expect(dispsPrefs.StatusesList.length).equal(1);

            expect(dispsPrefs.StatusesList[0].displayId.equals(disp3Id)).true;
            expect(dispsPrefs.StatusesList[0].Statuses.length).equal(3);
            expect(dispsPrefs.StatusesList[0].Statuses[0].name).equal('status1d3');
            expect(dispsPrefs.StatusesList[0].Statuses[0].value).equal('value1');
            expect(dispsPrefs.StatusesList[0].Statuses[1].name).equal('status2d3');
            expect(dispsPrefs.StatusesList[0].Statuses[1].value).equal('value2');
            expect(dispsPrefs.StatusesList[0].Statuses[2].name).equal('status3d3');
            expect(dispsPrefs.StatusesList[0].Statuses[2].value).equal('value3');

            done();
        });
    });
});
