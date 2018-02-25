const synchronizer = require('Synchronizer');

const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Displays = mongoose.models.Displays;
const Workstation = mongoose.models.Workstation;

describe("Synchronizer Displays", () => {
    let obj_displays;

    let wsIdb;
    let wsIda;

    before((done) => {

        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_displaysB = {
               "header":{
                   "action":"DISPLAY",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data": [
                   {
                       "id": "1",
                       "serial": "SME11dkl56",
                       "width": "1080",
                       "height": "900",
                       "commode": "2",
                       "isactive": "true"
                   },
                   {
                       "id": "2",
                       "serial": "SME13dkt77",
                       "width": "1600",
                       "height": "900",
                       "commode": "1",
                       "isactive": "false"
                   }
               ]
           };

           obj_displaysA = {
               "header":{
                   "action":"DISPLAY",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data": [
                   {
                       "id": "1",
                       "serial": "SME11dkl56",
                       "width": "1080",
                       "height": "900",
                       "commode": "2",
                       "isactive": "true"
                   },
                   {
                       "id": "2",
                       "serial": "SME13dkt77",
                       "width": "1600",
                       "height": "900",
                       "commode": "1",
                       "isactive": "false"
                   },
                   {
                       "id": "3",
                       "serial": "SNE25dkt77",
                       "width": "2600",
                       "height": "1800",
                       "commode": "3",
                       "isactive": "true"
                   }
               ]
           };
       })
       .then(()=>{
           return Workstation.findOne({wsId: wsIda});
       })
       .then(workstation=>{
           return Displays.create({
               workstationId: workstation._id,
               displays: [
                   {
                       "id_name": "3",
                       "serial": "CNE25dkt78",
                       "width": "1600",
                       "height": "900",
                       "commode": "2",
                       "isactive": "false"
                    }
                ]
           });
       })
       .then(displaysList=>{
           done();
       })
       .catch(err=>{
           console.log(err);
           done();
       });
    });

    /*after(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });*/

    it("Dsiplays new request", done=> {
        synchronizer.GetRequest(obj_displaysB)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displaysList=>{
            expect(displaysList.displays.length).equal(2);
            expect(displaysList.displays[0].id_name).equal('1');
            expect(displaysList.displays[0].serial).equal('SME11dkl56');
            expect(displaysList.displays[1].width).equal(1600);
            expect(displaysList.displays[1].isactive).false;
            done();
        });
    });
    it("Dsiplays complex request with exist displays", done=> {
        synchronizer.GetRequest(obj_displaysA)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return Displays.findOne({workstationId: workstation._id});
        })
        .then(displaysList=>{
            expect(displaysList.displays.length).equal(3);
            expect(displaysList.displays[0].id_name).equal('3');
            expect(displaysList.displays[0].serial).equal('CNE25dkt78');
            expect(displaysList.displays[0].commode).equal(2);
            expect(displaysList.displays[0].isactive).false;
            expect(displaysList.displays[1].id_name).equal('1');
            expect(displaysList.displays[1].serial).equal('SME11dkl56');
            expect(displaysList.displays[2].width).equal(1600);
            expect(displaysList.displays[2].isactive).false;
            done();
        });
    });
});
