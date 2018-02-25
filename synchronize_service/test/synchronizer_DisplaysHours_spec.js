const chai = require('chai');
//chai.config.showDiff = false;
const expect = chai.expect;
const moment = require('moment');

const clearBD = require('./help_methods/dataBase.js').clearBD;
const fillDataBase = require('./help_methods/dataBase.js').fillDataBase;

const mongoose = require('m_mongoose');
const Displays = mongoose.models.Displays;
const DisplaysHours = mongoose.models.DisplaysHours;
const Workstation = mongoose.models.Workstation;

const synchronizer = require('Synchronizer');


describe("Synchronizer DisplaysHours", () => {
    let obj_dispsHoursB;

    let wsIdb;
    let wsIda;
    let disp1Id;
    let disp2Id;
    let disp3Id;

    before(done => {
        fillDataBase()
        .then(result=>{
            wsIdb = result.workstations.b.wsId;
            wsIda = result.workstations.a.wsId;

           obj_dispsHoursB = {
               "header":{
                   "action":"DISPLAYHOURS",
                   "login":result.synchInfo.b.login,
                   "pwd":result.synchInfo.b.password,
                   "workstationid":wsIdb
               },
               "data":{
                   "1":[
                       {"date":"2017.04.01", "hours" : "2"},
                       {"date":"2017.04.02", "hours": "3.4"},
                       {"date":"2017.04.03", "hours": "4"}
                   ],
                   "2":[
                       {"date":"2017.04.01", "hours": "2.5"},
                       {"date":"2017.04.02", "hours": "4"},
                       {"date":"2017.04.03", "hours": "1"}
                   ]
               }
           };

           obj_dispsHoursA = {
               "header":{
                   "action":"DISPLAYHOURS",
                   "login":result.synchInfo.a.login,
                   "pwd":result.synchInfo.a.password,
                   "workstationid":wsIda
               },
               "data":{
                   "3":[
                       {"date":"2017.04.01", "hours" : "7"},
                       {"date":"2017.04.02", "hours": "2"},
                       {"date":"2017.04.03", "hours": "4"}
                   ]
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
                return DisplaysHours.create({
                    workstationId: workstation._id,
                    displays:[
                        {
                            displayId: disp3Id,
                            hoursData:[
                                {
                                    date: new Date('2017.04.01'),
                                    hours: 5
                                },
                                {
                                    date: new Date('2017.04.02'),
                                    hours: 3
                                }
                            ]
                        }
                    ]
                });
            });
        })
        .then(()=>{
            done();
        });
    });

    after(done => {
        clearBD()
        .then(results=>{
            done();
        });
    });

    it("Simple DisplaysHours request", done=> {
        synchronizer.GetRequest(obj_dispsHoursB)
        .then(results=>{
            //console.log('Simple results - ', results);
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIdb});
        })
        .then(workstation=>{
            return DisplaysHours.findOne({workstationId: workstation._id});
        })
        .then(dispsHours=>{
            //console.log('dispsHours - ', dispsHours.displays[0]);
            expect(dispsHours.displays.length).equal(2);

            let date = new Date(dispsHours.displays[0].hoursData[0].date);
            let qDate = new Date('2017.04.01').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[0].hoursData[1].date);
            qDate = new Date('2017.04.02').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[0].hoursData[2].date);
            qDate = new Date('2017.04.03').getTime();
            expect(date.getTime()).equal(qDate);

            expect(dispsHours.displays[0].hoursData[0].hours).equal(2);
            expect(dispsHours.displays[0].hoursData[1].hours).equal(3.4);
            expect(dispsHours.displays[0].hoursData[2].hours).equal(4);

            date = new Date(dispsHours.displays[1].hoursData[0].date);
            qDate = new Date('2017.04.01').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[1].hoursData[1].date);
            qDate = new Date('2017.04.02').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[1].hoursData[2].date);
            qDate = new Date('2017.04.03').getTime();
            expect(date.getTime()).equal(qDate);

            expect(dispsHours.displays[1].hoursData[0].hours).equal(2.5);
            expect(dispsHours.displays[1].hoursData[1].hours).equal(4);
            expect(dispsHours.displays[1].hoursData[2].hours).equal(1);

            done();
        })
    });

    it("Complex DisplaysHours request", done=> {
        synchronizer.GetRequest(obj_dispsHoursA)
        .then(results=>{
            expect(results.header.result).equal(4);
            return Workstation.findOne({wsId: wsIda});
        })
        .then(workstation=>{
            return DisplaysHours.findOne({workstationId: workstation._id});
        })
        .then(dispsHours=>{
            //console.log('dispsHours - ', dispsHours.displays[0]);
            expect(dispsHours.displays[0].hoursData[0].hours).equal(7);
            expect(dispsHours.displays[0].hoursData[1].hours).equal(3);
            expect(dispsHours.displays[0].hoursData[2].hours).equal(4);

            date = new Date(dispsHours.displays[0].hoursData[0].date);
            qDate = new Date('2017.04.01').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[0].hoursData[1].date);
            qDate = new Date('2017.04.02').getTime();
            expect(date.getTime()).equal(qDate);

            date = new Date(dispsHours.displays[0].hoursData[2].date);
            qDate = new Date('2017.04.03').getTime();
            expect(date.getTime()).equal(qDate);
            done();
        })
    });
});
