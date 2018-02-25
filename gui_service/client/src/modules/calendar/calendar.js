'use strict'

angular.module('remoteGuiApp')
    .component('calendar', {
        /*bindings: {
        },*/
        controller: function($http, MLog, calendarConfig, dialog) {

            calendarConfig.templates.calendarSlideBox = '/src/modules/calendar/slideBox.html';
            calendarConfig.templates.calendarMonthCell = '/src/modules/calendar/monthCell.html';
            calendarConfig.templates.calendarMonthCellEvents = '/src/modules/calendar/eventView.html';

            let $ctrl = this;

            $ctrl.filterExist = false;
            $ctrl.filter = {
                type: 'all',
                frequencies: [
                    'daily',
                    'weekly',
                    'monthly',
                    'quaoterly',
                    'semiannually',
                    'annually'
                ]
            };
            $ctrl.days = {};

            $ctrl.addFilter = ()=>{
                console.log('add filter');

                return dialog.open({
                    title: "Calendar Filter",
                    contentUrl: "/src/modules/calendar/calendar-filter.dialog.html",
                    result: $ctrl.filter
                    })
                    .then(result=>{
                        //console.log('filter - ', $ctrl.filter);
                        $ctrl.events = $ctrl.allEvents.slice(0);
                        $ctrl.filterExist = true;

                        //filters
                        $ctrl.events = $ctrl.events.filter(ev=>$ctrl.checkByFilter(ev.data));
                        //
                    }, ()=>null);
            };

            $ctrl.removeFilter = ()=>{
                console.log('remove filter');
                $ctrl.filterExist = false;
                $ctrl.filter = {
                    type: 'all',
                    frequencies: [
                        'daily',
                        'weekly',
                        'monthly',
                        'quaoterly',
                        'semiannually',
                        'annually'
                    ]
                };
                $ctrl.filter.groups = $ctrl.groups.slice(0);
                $ctrl.filter.groups_ids = [];
                $ctrl.filter.groups.forEach(gr=>{
                    $ctrl.filter.groups_ids.push({id: gr.id, name: gr.name});
                });
                $ctrl.events = $ctrl.allEvents.slice(0);
            };

            $ctrl.checkByFilter = (data) => {
                let type = data[0].type;
                let schtype = data[0].schtype;

                data = data.filter(task=>{
                    return $ctrl.filter.groups_ids.find(item=>item.id===task.groupId);

                    /*console.log('filter new- ', task.groupId, $ctrl.filter.groups_ids);
                    return true;*/
                });

                if(!data.length)
                    return false;

                //console.log('checkByFilter - ', type, schtype);
                if(($ctrl.filter.type === 'all' || $ctrl.filter.type === 'qa') && type === 'qa' ) {//qa
                    if(schtype == 0)
                        return $ctrl.filter.frequencies.find(el=>el==='daily') != null;
                    else if(schtype == 1)
                        return $ctrl.filter.frequencies.find(el=>el==='weekly') != null;
                    else if(schtype == 2)
                        return $ctrl.filter.frequencies.find(el=>el==='monthly') != null;
                    else if(schtype == 3)
                        return $ctrl.filter.frequencies.find(el=>el==='quaoterly') != null;
                    else if(schtype == 4)
                        return $ctrl.filter.frequencies.find(el=>el==='semiannually') != null;
                    else if(schtype == 5)
                        return $ctrl.filter.frequencies.find(el=>el==='annually') != null;
                    else
                        return false;
                } else if(($ctrl.filter.type === 'all' || $ctrl.filter.type === 'user') && type !== 'qa' ) {//user
                    if(schtype == 2)
                        return $ctrl.filter.frequencies.find(el=>el==='daily') != null;
                    else if(schtype == 3)
                        return $ctrl.filter.frequencies.find(el=>el==='weekly') != null;
                    else if(schtype == 4)
                        return $ctrl.filter.frequencies.find(el=>el==='monthly') != null;
                    else if(schtype == 5)
                        return $ctrl.filter.frequencies.find(el=>el==='quaoterly') != null;
                    else if(schtype == 6)
                        return $ctrl.filter.frequencies.find(el=>el==='semiannually') != null;
                    else if(schtype == 7)
                        return $ctrl.filter.frequencies.find(el=>el==='annually') != null;
                    else
                        return false;
                }
            };

            $ctrl.cellScope = {
                addCell: (day) => {
                    //console.log('day - ', day);
                    if (!$ctrl.days[day.label])
                        $ctrl.days[day.label] = {
                            date: day.date._d.getTime(),
                            value: true
                        };
                    else
                        $ctrl.days[day.label].date = day.date._d.getTime();

                    return $ctrl.days[day.label];
                }
            };

            const getColor = (type, name, schtype) => {
                let result = {};

                if(type === 'qa'){
                    if (name.lastIndexOf('visual') !== -1){
                        if(schtype == 0){
                            result.primary = '#46C846';
                            result.secondary = '#46C846';
                        } else if(schtype == 1){
                            result.primary = '#46AA46';
                            result.secondary = '#46AA46';
                        } else if(schtype == 2){
                            result.primary = '#468C46';
                            result.secondary = '#468C46';
                        } else if(schtype == 3 || schtype == 4){
                            result.primary = '#3C6E3C';
                            result.secondary = '#3C6E3C';
                        } else if(schtype == 5){
                            result.primary = '#3C503C';
                            result.secondary = '#3C503C';
                        }
                    } else {
                        if(schtype == 0){
                            result.primary = '#4646C8';
                            result.secondary = '#4646C8';
                        } else if(schtype == 1){
                            result.primary = '#4141B4';
                            result.secondary = '#4141B4';
                        } else if(schtype == 2){
                            result.primary = '#3C3CA0';
                            result.secondary = '#3C3CA0';
                        } else if(schtype == 3 || schtype == 4){
                            result.primary = '#37378C';
                            result.secondary = '#37378C';
                        } else if(schtype == 5){
                            result.primary = '#323278';
                            result.secondary = '#323278';
                        }
                    }
                } else if(type==='cal'){
                    if(schtype == 2){
                        result.primary = '#E6963C';
                        result.secondary = '#E6963C';
                    } else if(schtype == 3){
                        result.primary = '#D28C1E';
                        result.secondary = '#D28C1E';
                    } else if(schtype == 4){
                        result.primary = '#BE8232';
                        result.secondary = '#BE8232';
                    } else if(schtype == 5 || schtype == 6){
                        result.primary = '#AA7832';
                        result.secondary = '#AA7832';
                    } else if(schtype == 7){
                        result.primary = '#966E32';
                        result.secondary = '#966E32';
                    }
                } else if(type==='con'){
                    if(schtype == 2){
                        result.primary = '#E650E6';
                        result.secondary = '#E650E6';
                    } else if(schtype == 3){
                        result.primary = '#D246DC';
                        result.secondary = '#D246DC';
                    } else if(schtype == 4){
                        result.primary = '#BE46D2';
                        result.secondary = '#BE46D2';
                    } else if(schtype == 5 || schtype == 6){
                        result.primary = '#AA41C8';
                        result.secondary = '#AA41C8';
                    } else if(schtype == 7){
                        result.primary = '#9641BE';
                        result.secondary = '#9641BE';
                    }
                } else if(type==='dtp'){
                    if(schtype == 2){
                        result.primary = '#C83232';
                        result.secondary = '#C83232';
                    } else if(schtype == 3){
                        result.primary = '#B43232';
                        result.secondary = '#B43232';
                    } else if(schtype == 4){
                        result.primary = '#A03232';
                        result.secondary = '#A03232';
                    } else if(schtype == 5 || schtype == 6){
                        result.primary = '#8C3232';
                        result.secondary = '#8C3232';
                    } else if(schtype == 7){
                        result.primary = '#783232';
                        result.secondary = '#783232';
                    }
                }
                return result;
            };

            $ctrl.currentEvent = null;

            const showDays = (from, to) => {
                let keys = Object.keys($ctrl.days);
                keys.forEach(k => {

                    let date = new Date($ctrl.days[k].date);
                    let today = new Date();

                    if(today.getMonth()===date.getMonth() && today.getDate()>date.getDate())
                        $ctrl.days[k].value = false; //do not show past
                    else
                        $ctrl.days[k].value = date.getDate() > from && date.getDate() < to;
                });
            };

            const showAllDays = () => {
                let keys = Object.keys($ctrl.days);
                keys.forEach(k => $ctrl.days[k].value = true);
            };

            const lastDateInCurrentMonth = () => {
                let date = new Date();
                return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            };

            const getEnableDays = (ids, currentDate)=>{
                let mas = $ctrl.events.filter(e => {
                    return ids.find(id => id === e.data[0].taskId);
                });

                mas.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

                let index = mas.findIndex(el => el.startsAt.getTime() === currentDate);

                let lborder = index - 1 > 0 ? index - 1 : 0;
                let rborder = index + 1 < mas.length - 1 ? index + 1 : mas.length - 1;

                let nmas = mas.slice(lborder, rborder + 1);

                return {from: index - 1 < 0 ? 0 : nmas[0].startsAt.getDate(),
                        to: index + 1 > mas.length - 1 ? lastDateInCurrentMonth() + 1: nmas[nmas.length - 1].startsAt.getDate()};
            };

            const updateTask = (data)=>{
                return $http.put('/api/calendar', data)
                .then(result=>{
                    console.log('Task was updated - ', result);
                })
                .catch(MLog.error);
            };

            const getDates = (data, taskId, type)=>{
                let keys = Object.keys(data);

                let results = [];
                keys.forEach(key=>{

                    if(data[key][type]){
                        if(data[key][type].find(t=>t.taskId === taskId))
                             results.push(new Date(key));
                    }
                });

                if(results.length){
                    results.sort((a, b)=>a.getTime()-b.getTime());
                }

                return results;
            };

            $ctrl.catchEvent = (event) => {

                let currentDate = new Date(event.data[0].date).getTime();
                let ids = event.data.map(e => e.taskId);

                let dates = getEnableDays(ids, currentDate);

                showDays(dates.from, dates.to);
                $ctrl.currentEvent = event;
            };

            $ctrl.calendarView = 'month';
            $ctrl.viewDate = new Date();

            $ctrl.events = [];

            const addEvent = (type, schtype, name, date, length, data) => {

                data[0].actions = [{
                 label: '<i class="fa fa-pencil" aria-hidden="true"></i>',
                 onClick: function(args) {
                   alert.show('Edited', args.calendarEvent);
                 }
                }];

                $ctrl.events.push({
                    title: name,
                    color: getColor(type, name, schtype),
                    startsAt: new Date(date),
                    endsAt: new Date(date),
                    draggable: true,
                    resizable: true,
                    number: length,
                    cssClass: 'badge',
                    incrementsBadgeTotal: false,
                    data: data,
                    catchEvent: $ctrl.catchEvent,
                    actions: [{
                         class: 'fa fa-pencil',
                         onClick: function(task) {
                           //console.log('Edited - ', task);

                           let currentDate = new Date(task.date).getTime();
                           let ids = [task.taskId];

                           let dates = getEnableDays(ids, currentDate);
                           //console.log('Edited - ', dates);

                           let dfrom = new Date(currentDate);

                           if(dates.from<dfrom.getDate())
                                dfrom.setDate(dates.from+1);

                           let dto = new Date(currentDate);
                           dto.setDate(dates.to-1);

                           let promise = Promise.resolve();

                           if(dates.from === 0){
                               const prevMonth = new Date(currentDate);
                               prevMonth.setDate(1);
                               prevMonth.setMonth(prevMonth.getMonth()-1);

                               promise = promise.then(()=>{
                                   return   $http.post('/api/calendar', {
                                             date: prevMonth,
                                             view: $ctrl.calendarView
                                     });
                               })
                               .then(result=>{
                                   let prevDates = getDates(result.data.data, task.taskId, task.type);

                                   if(prevDates.length){
                                      dfrom = prevDates[prevDates.length-1];
                                   } else {
                                       dfrom = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
                                   }

                               });
                           }

                           if(lastDateInCurrentMonth() === dates.to-1){
                               const nextMonth = new Date(currentDate);
                               nextMonth.setDate(1);
                               nextMonth.setMonth(nextMonth.getMonth()+1);

                               promise = promise.then(()=>{
                                   return   $http.post('/api/calendar', {
                                             date: nextMonth,
                                             view: $ctrl.calendarView
                                     });
                               })
                               .then(result=>{
                                   let nextDates = getDates(result.data.data, task.taskId, task.type);

                                   if(nextDates.length){
                                       if(nextMonth.getTime()<=nextDates[0]){
                                            dto = nextDates[0];
                                            dto.setDate(dto.getDate()-1);
                                        }else
                                            dto = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);

                                   } else {
                                       dto = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
                                   }

                               });
                           }

                           return promise
                           .then(()=>{

                               return dialog.open({
                                   title: "Edit Task",
                                   contentUrl: "/src/modules/calendar/calendar-edit-task.dialog.html",
                                   result: {
                                       date: new Date(task.date),
                                       from: dfrom,
                                       to: dto
                                   }
                               })
                               .then(result=>{
                                   //console.log('result - ', result);

                                   return updateTask({date: result.date, data: [task]})
                                   .then(()=>{
                                       $ctrl.refreshTasks();
                                   });
                               }, ()=>null);
                           })
                       }
                    }]
               });
            };

            const getFrequencies = (tasks) => {
                let set = new Set();
                tasks.forEach(task => set.add(task.schtype));
                return set;
            };

            $ctrl.refreshTasks = () => {
                //console.log('refreshTasks');
                $ctrl.cellIsOpen = false;

                const getDate = (date) => {
                    if (date)
                        return `${date.getFullYear()}.${date.getMonth()}.${date.getDate()}`;
                    else
                        return undefined;
                };

                /*if (getDate($ctrl.viewDatePrev) === getDate($ctrl.viewDate) &&
                    $ctrl.calendarViewPrev === $ctrl.calendarView)
                    return;*/

                $ctrl.viewDatePrev = $ctrl.viewDate;
                $ctrl.calendarViewPrev = $ctrl.calendarView;

                //console.log('Get month request');
                return $http.post('/api/calendar', {
                        date: $ctrl.viewDate,
                        view: $ctrl.calendarView
                    })
                    .then(result => {

                        console.log('Get month response ', result.data);

                        $ctrl.events = [];
                        let data = result.data.data;

                        for (let item in data) {
                            for (let tasks in data[item]) {
                                if (data[item][tasks].length === 1) {
                                    addEvent(data[item][tasks][0].type, data[item][tasks][0].schtype, data[item][tasks][0].name, data[item][tasks][0].date, data[item][tasks].length, data[item][tasks]);
                                } else {
                                    let freqSet = getFrequencies(data[item][tasks]);
                                    freqSet.forEach(freq => {
                                        let ftasks = data[item][tasks].filter(task => task.schtype === freq);

                                        if (ftasks.length){
                                            addEvent(ftasks[0].type, ftasks[0].schtype, ftasks[0].name, ftasks[0].date, ftasks.length, ftasks);
                                        }
                                    })
                                }
                            }
                        };
                        $ctrl.allEvents = $ctrl.events.slice(0);

                        //console.log('events - ', $ctrl.allEvents);
                    })
                    .catch(MLog.error);
            };

            $ctrl.$onInit = () => {
                $ctrl.refreshTasks();

                $http.get('api/groups/')
                .then(result=>{
                    //console.log('groups - ', result.data);
                    $ctrl.groups = [];
                    result.data.forEach(gr=>{
                        $ctrl.groups.push({name: gr.name, id: gr._id});
                    });

                    $ctrl.filter.groups = $ctrl.groups.slice(0);
                    $ctrl.filter.groups_ids = [];
                    $ctrl.filter.groups.forEach(gr=>{
                        $ctrl.filter.groups_ids.push({id: gr.id, name: gr.name});
                    });

                })
                .catch(MLog.error);
            };

            $ctrl.cellIsOpen = true;

            $ctrl.eventClicked = function(event) {
                console.log('Clicked', event);
                $ctrl.refreshTasks()
                .then(()=>{
                    showAllDays();
                });
            };

            /*$ctrl.eventEdited = function(event) {
                console.log('Edited', event);
            };

            $ctrl.eventDeleted = function(event) {
                console.log('Deleted', event);
            };*/

            $ctrl.eventTimesChanged = function(event) {
                console.log('Dropped or resized', arguments);

                let data = {
                    date: event.endsAt,//event.startsAt,
                    data: event.data
                };

                return updateTask(data)
                .then(()=>{
                    return $ctrl.refreshTasks()
                    .then(()=>{
                        showAllDays();
                    });
                });
            };

            /*$ctrl.toggle = function($event, field, event) {
                $event.preventDefault();
                $event.stopPropagation();
                event[field] = !event[field];
            };*/

            $ctrl.timespanClicked = function(date, cell) {
                if ($ctrl.calendarView === 'month') {
                    if (($ctrl.cellIsOpen && moment(date).startOf('day').isSame(moment($ctrl.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
                        $ctrl.cellIsOpen = false;
                    } else {
                        $ctrl.cellIsOpen = true;
                        $ctrl.viewDate = date;
                    }
                } else if ($ctrl.calendarView === 'year') {
                    if (($ctrl.cellIsOpen && moment(date).startOf('month').isSame(moment($ctrl.viewDate).startOf('month'))) || cell.events.length === 0) {
                        $ctrl.cellIsOpen = false;
                    } else {
                        $ctrl.cellIsOpen = true;
                        $ctrl.viewDate = date;
                    }
                }
            };

            /*$ctrl.modifyCell = (calendarCell)=>{
                console.log('Modify cell - ', calendarCell);
            };*/

        },
        templateUrl: '/src/modules/calendar/calendar.html'
    });
