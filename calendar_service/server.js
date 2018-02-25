 'use strict'
 //const https = require('https');
 const http = require('http');
 const url = require('url');
 const config = require('config');
 const body = require('body/json');
 require('m_database');

 const calendar = require('calendar');
 const mongoose = require('m_mongoose');

 //const Workstation = mongoose.models.Workstation;
 const QATasks = mongoose.models.QATasks;
 const CalTasks = mongoose.models.CalTasks;
 const Workstation = mongoose.models.Workstation;
 const SettingsNames = mongoose.models.SettingsNames;
 const CalendarCache = mongoose.models.CalendarCache;

 const {
     node_responce
 } = require('m_responce');

 const addTask = (results, task) => {
     let dateKey = calendar.getDateStr(new Date(task.date));
     let typeKey = task.type;

     if (!results[dateKey])
         results[dateKey] = {};

     if (!results[dateKey][typeKey])
         results[dateKey][typeKey] = [];

     results[dateKey][typeKey].push(task);

 };

 const promiseSequence = (arr, fn) => {
     let sequence = Promise.resolve();
     arr.forEach(item => {
         sequence = sequence.then(() => {
             return fn(item)
         });
     });
     return sequence;
 };

 const getNameByKey = (map, key) => {

     let res = map.find(item => item.key === key);
     if (res)
         return res.value;
     else
         return undefined;
 }

 const tasksTransfer = (tasks, type) => {
     let taskList = tasks;

     if (type === 'qa'){
         taskList = [];
         tasks.tasks.forEach(tlist=>{
             tlist.taskList.forEach(task=>{
                taskList.push({
                    _id: task._id,
                    workstationId: tasks.workstationId,
                    displayId: tlist.displayId
                });
             });
         })
     }

     let dfrom = new Date();
     dfrom.setDate(1);
     dfrom = calendar.dateMin(dfrom);

     let dto = new Date();
     dto = calendar.dateMax(dto);

     let today = calendar.dateMin(new Date());


     let sequence = promiseSequence(taskList, task=>{

         return CalendarCache.getTasksDates(task.workstationId, task._id, type, dfrom, dto)
             .then(dates => {

                 let tIndex = dates.findIndex(d => d.getTime() === today.getTime());

                 if (dates.length && tIndex === -1) {
                     return CalendarCache.updateTask(task.workstationId, task._id, type, dates[dates.length - 1], today)
                         .then(() => {
                             if (type === 'qa')
                                 return QATasks.addException(task.workstationId, task._id, task.displayId, dates[dates.length - 1].getTime(), today.getTime());
                             else
                                 return CalTasks.addException(task.workstationId, task._id, dates[dates.length - 1].getTime(), today.getTime());
                         })
                 } else
                     return Promise.resolve();
             });
     });

     return sequence
         .then(() => {
             return tasks;
         });
 }

 const removePastDates = (tasks, type) => {
     let sequence = promiseSequence(tasks, task => {
         return CalendarCache.removePastDates(task.workstationId, type);
     });

     return sequence;
 }

 const calcUserTaskDates = (task, dfrom, dto, results) => {
     let groupId;
     let plannedDate;
     return Workstation.findOne({
             _id: task.workstationId
         })
         .then(wst => {
             groupId = wst.group;
             return CalendarCache.getLastPlannedDate(task.workstationId, task._id, 'user')
                 .then(result => {
                     plannedDate = result;
                     return CalendarCache.getTasksDates(task.workstationId, task._id, 'user', dfrom, dto);
                 });
         })
         .then(dates => {
             if (dates.length) {
                 dates.forEach(date => {
                     addTask(results, {
                         taskId: task._id,
                         groupId: groupId,
                         workstationId: task.workstationId,
                         schtype: task.schtype.value,
                         type: task.type.value,
                         name: task.tname,
                         date: date
                     });
                 });
                 return;
             } else {
                 let cacheData = [];
                 let nextdate = new Date(task.nextrun.value);
                 let tasksDates = [];
                 let dmin = calendar.dateMin(Date.now());
                 task.plannedDate = plannedDate;

                 //console.log('dto - ', dto);
                 while (calendar.isLess(nextdate, new Date(dto))) {

                     calendar.calcUserNextRun(task);
                     nextdate = new Date(task.nextrun.value);

                     let idate = calendar.dateMin(nextdate.getTime()).getTime();
                     let exc = task.exceptions.find(exc => exc.from === idate);

                     let excnextdate = new Date(nextdate);
                     if (exc) {
                         excnextdate = new Date(exc.to);
                     }

                     if (calendar.isBetween(nextdate, new Date(dfrom) /*dmin*/ , new Date(dto))) {
                         addTask(results, {
                             taskId: task._id,
                             groupId: groupId,
                             workstationId: task.workstationId,
                             schtype: task.schtype.value,
                             type: task.type.value,
                             name: task.tname,
                             date: excnextdate
                         });
                         cacheData.push({
                             wstId: task.workstationId,
                             taskId: task._id,
                             type: 'user',
                             date: excnextdate
                         });
                     }

                     //console.log('nextdate - ', nextdate);
                     task.lastrun.value = nextdate.getTime();

                 };

                 let cacheSequence = promiseSequence(cacheData, item => {
                     return CalendarCache.addTask(item.wstId, item.taskId, item.type, item.date)
                 });

                 return cacheSequence;

                 return Promise.resolve();
             }
         });
 };

 const calcQATaskDates = (qatask, dfrom, dto, results) => {
     let wstId = qatask.workstationId;
     let groupId;
     let plannedDate;

     return Workstation.findOne({
             _id: qatask.workstationId
         })
         .then(wst => {
             groupId = wst.group;
         })
         .then(() => {
             return Promise.all(qatask.tasks.map(tasks => {
                 let displayId = tasks.displayId;
                 return Promise.all(tasks.taskList.map(task => {
                     //console.log('qa task  id 1 - ', task._id)
                     let excps;
                     let _tid = task._id;
                     return QATasks.getExceptions(wstId, displayId, task.taskKey.value)
                         .then(res => {
                             excps = res;
                             return CalendarCache.getLastPlannedDate(wstId, _tid, 'qa')
                                 .then(result => {
                                     plannedDate = result;
                                     return CalendarCache.getTasksDates(wstId, _tid, 'qa', dfrom, dto);
                                 });
                         })
                         .then(dates => {

                             if (dates.length) {
                                 dates.forEach(date => {
                                     addTask(results, {
                                         taskId: _tid,
                                         groupId: groupId,
                                         workstationId: wstId,
                                         displayId: displayId,
                                         schtype: task.freqCodes.value,
                                         type: 'qa',
                                         name: task.name.value,
                                         date: date
                                     });
                                 });

                                 return;
                             } else {
                                 let cacheData = [];
                                 let nextdate = new Date(task.nextdateFixed.value);
                                 let tasksDates = [];

                                 if(typeof(task.lastrundate.value) === 'string' && task.lastrundate.value !== "Never"){
                                     task.lastrundate.value = calendar.timeStampFromStr(task.lastrundate.value);
                                 }

                                 while (calendar.isLess(nextdate, new Date(dto))) {

                                     let idate = calendar.dateMin(nextdate.getTime()).getTime();
                                     let exc = excps.find(exc => exc.from === idate);

                                     calendar.calcQANextRun(task);
                                     nextdate = new Date(task.nextdate.value);
                                     task.plannedDate = plannedDate;

                                     let excnextdate = new Date(nextdate);
                                     if (exc) {
                                         excnextdate = new Date(exc.to);
                                     }

                                     if (calendar.isBetween(nextdate, new Date(dfrom), new Date(dto))) {

                                         addTask(results, {
                                             taskId: _tid,
                                             groupId: groupId,
                                             workstationId: wstId,
                                             displayId: displayId,
                                             schtype: task.freqCodes.value,
                                             type: 'qa',
                                             name: task.name.value,
                                             date: excnextdate
                                         });

                                         cacheData.push({
                                             wstId: wstId,
                                             taskId: _tid,
                                             type: 'qa',
                                             date: excnextdate
                                         });
                                     }

                                     task.lastrundate.value = nextdate.getTime();

                                     console.log('qa nextdate - ', nextdate);
                                 }

                                 //console.log('cacheData - ', cacheData);
                                 let cacheSequence = promiseSequence(cacheData, item => {
                                     return CalendarCache.addTask(item.wstId, item.taskId, item.type, item.date)
                                 });

                                 return cacheSequence;
                             }
                         });
                 }));
             }));
         });
 };

 let server = http.createServer((req, res) => {

     let pathname = decodeURI(url.parse(req.url).pathname);
     let filename = pathname.slice(1);

     //console.log('pathname - ', pathname);

     if (filename.includes('/') || filename.includes('..')) {
         ERR_404(res);
         return;
     }

     if (req.method === 'GET') {
         if (pathname === '/') {
             node_responce.sent(res, 'QUBYX calendar service.');
         } else
             node_responce.err_404(res);
     }

     if (req.method === 'POST') {
         if (pathname === '/workstations') {
             body(req, res, (err, body) => {
                 if (err)
                     return node_responce.err_500(res);

                 let results = {};
                 let dateBorders = calendar.getTimeBorders(new Date(body.date), body.view);

                 return CalTasks.find({
                         workstationId: {
                             $in: body.workstations
                         }
                     })
                     //usertasks-----------------------------------------------------------------------------
                     .then(utasks => {
                         return Promise.all(utasks.map(task => {
                                 return SettingsNames.findOne({
                                         workstationId: task.workstationId
                                     }).select('settings').exec()
                                     .then(result => {
                                         let names = result.settings.find(item => item.name === 'taskName');
                                         task.tname = getNameByKey(names.values, task.type.value);
                                     });
                             }))
                             .then(() => {
                                 return utasks;
                             });
                     })
                     .then(utasks => { //remove past dates
                         return tasksTransfer(utasks, 'user')
                             .then(tasks => {
                                 return removePastDates(tasks, 'user');
                             })
                             .then(res => {
                                 return Promise.all(utasks.map(task => {
                                         return CalTasks.removePastExceptions(task.workstationId, task._id);
                                     }))
                                     .then(() => {
                                         return utasks;
                                     });
                             })
                             .then(() => utasks);
                     })
                     .then(utasks => {
                         if (dateBorders.to.getTime() > Date.now())
                             return Promise.all(utasks.map(task => calcUserTaskDates(task, dateBorders.from, dateBorders.to, results)));
                     })
                     //qatasks-----------------------------------------------------------------------------
                     .then(() => {
                         return QATasks.find({
                             workstationId: {
                                 $in: body.workstations
                             }
                         });
                     })
                     .then(qatasks => {

                         let sequence = promiseSequence(qatasks, tasks=>{
                             return tasksTransfer(tasks, 'qa');
                         });

                         return sequence
                            .then(tasks => {
                                 return removePastDates(qatasks, 'qa');
                             })
                             .then(res => {
                                 return Promise.all(qatasks.map(tgroup => {
                                     tgroup.tasks.forEach(task => {
                                         task.exceptions = task.exceptions.filter(ex => ex.to > Date.now());
                                     });

                                     return tgroup.save();
                                 }));
                             })
                             .then(() => qatasks);
                     })
                     .then(qatasks => {
                         if (dateBorders.to.getTime() > Date.now())
                             return Promise.all(qatasks.map(qdata => calcQATaskDates(qdata, dateBorders.from, dateBorders.to, results)));
                     })
                     //------------------------------------------------------------------------------------
                     .then(() => {
                         //console.log('results - ', results);
                         node_responce.sent(res, {
                             result: true,
                             data: results
                         });
                     })
                     .catch(err => {
                         console.log('err - ', err);
                         node_responce.err_500(res);
                     });
             });
         } else {
             node_responce.err_404(res);
         }
     }

     if (req.method === 'PUT') {
         if (pathname === '/workstations') {
             console.log('task update!')
             body(req, res, (err, body) => {
                 if (err)
                     return node_responce.err_500(res);
                 let sequence = promiseSequence(body.data, task => {

                     let fdate = new Date(task.date);
                     let tdate = new Date(body.date);

                     let type = task.type === 'qa' ? 'qa' : 'user';

                     return CalendarCache.checkDate(task.workstationId, task.taskId, type, fdate, tdate)
                         .then(res => {
                             // console.log('check res - ', res);
                             // if (res) {
                             return CalendarCache.updateTask(task.workstationId, task.taskId, type, fdate, tdate)
                                 .then(() => {
                                     if (type === 'qa')
                                         return QATasks.addException(task.workstationId, task.taskId, task.displayId, fdate.getTime(), tdate.getTime());
                                     else
                                         return CalTasks.addException(task.workstationId, task.taskId, fdate.getTime(), tdate.getTime());
                                 });
                             /* } else
                                  return null;*/
                         })
                 });

                 return sequence
                     .then(result => {
                         //console.log('drag results - ', result);
                         node_responce.yesno(res, true);
                     });
             });
         } else {
             node_responce.err_404(res);
         }
     }

 });

 if (require.main === module) {
     // application run directly; start app server
     server.listen(config.get('port'));
 } else {
     // application imported as a module via "require": export function to create server
     module.exports = server;
 }
