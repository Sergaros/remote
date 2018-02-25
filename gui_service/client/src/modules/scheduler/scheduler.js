'use strict'

angular.module('remoteGuiApp')
.component('scheduler', {
    bindings: {
      qaTasks: '<',
      calTasks: '<',
      displays: '<',
      wid: '<',
      map: '<?settingsMap'
    },
    controller: function ($http, $log, dialog, SettingsCore, UserTaskData, $state) {
        const $ctrl = this;
        $ctrl.qaData = [];
        $ctrl.calTableData = [];
        $ctrl.calData = [];

        $ctrl.options = {};
        $ctrl.isActive = $state.is('manage.scheduler');

        $ctrl.getDisplayNameById = (id)=>{
            let display = $ctrl.displays.find(disp=>{
                return disp.displayId.toString()===id;
            });
            if(!display) return '';

            return `${display.Preferences.find(pref=>pref.name === 'Model').value} ${display.Preferences.find(pref=>pref.name === 'SerialNumber').value}`;
        };

        $ctrl.qaFillData = ()=>{
            $ctrl.qaData = [];
            $ctrl.qaData.tasks = [];
            let i = 0;

            $ctrl.qaTasks.tasks.forEach(disp=>{
                disp.taskList.forEach(task=>{
                    $ctrl.qaData.push(new Task(task.name.value,
                                                $ctrl.getDisplayNameById(disp.displayId),
                                                UserTask.getDate(task.nextdate.value),
                                                task.lastrundate.value,
                                                task.freq.value,
                                                i));
                    task.displayId = disp.displayId;
                    $ctrl.qaData.tasks.push(task);
                    i++;
                });
            });
            $ctrl.totalItemsQA = $ctrl.qaData.length;
            //console.log('$ctrl.qaData - ', $ctrl.qaData);
        };

        $ctrl.$onChanges = function (changesObj) {
            if (changesObj.displays && changesObj.displays.currentValue){
                //console.log('!!!displays - ', $ctrl.displays);
            }

            if (changesObj.map && changesObj.map.currentValue) {
                $ctrl.options.frequencies = SettingsCore.getOptions('schedtype', $ctrl.map.settings);
                $ctrl.options.taskNames =  SettingsCore.getOptions('taskName', $ctrl.map.settings);
                $ctrl.options.DaysOfWeek = SettingsCore.getOptions('DaysOfWeek', $ctrl.map.settings);
                $ctrl.options.Monthes = SettingsCore.getOptions('Monthes', $ctrl.map.settings);
                $ctrl.options.WeekOfMonth = SettingsCore.getOptions('WeekOfMonth', $ctrl.map.settings);
            }

            if (changesObj.qaTasks && changesObj.qaTasks.currentValue) {
                //console.log('QA tasks start', $ctrl.qaTasks);
                $ctrl.qaFillData();
            }

            if (changesObj.calTasks && changesObj.calTasks.currentValue) {
                $ctrl.calFillData();
            }

        };

        $ctrl.qaTaskEdit = (id)=>{
            let task = $ctrl.qaData.find(qatask=>qatask.id === id);
            let qatask = $ctrl.qaData.tasks[id];
            let ndate;
            return dialog.open({title: "Edit Task",
                        contentUrl: "/src/modules/scheduler/qa-edit-dialog.html",
                        result: {display: task.device, task: task.name, date: new Date(qatask.nextdate.value)}
                    })
            .then((result)=>{
                let data = {isLocked: false};
                data.date = result.date.getTime();
                ndate = result.date.toJSON();
                return $http.post(`api/qatasks/${$ctrl.wid}/${qatask.displayId}/${qatask._id}`, data)
            }, ()=>null)
            .then(result=>{
                if(!result)
                    return;

                if(result.data.result){
                    qatask.nextdate.value = ndate;
                    $ctrl.qaFillData();
                }
            })
            .catch((err)=>{
                console.log(err);
            });
        };

        $ctrl.refreshCalTasks = ()=>{
            return $http.get(`api/usertasks/${$ctrl.wid}`)
            .then(tasks=>{
                $ctrl.calTasks = tasks.data;
                $ctrl.calFillData();
            })
            .catch(err=>{
                console.log(err);
            });
        }

        $ctrl.calFillData = ()=>{
            let i = 0;
            $ctrl.calTableData = [];

            //console.log('$ctrl.calTasks - ', $ctrl.calTasks);

            $ctrl.calTasks.forEach(task=>{
                $ctrl.calTableData.push(new Task(SettingsCore.getValueBykey($ctrl.options.taskNames, task.type.value),
                                            $ctrl.getDisplayNameById(task.displayId.value),
                                            task.startdate.value+' '+task.starttime.value,
                                            UserTask.getDate(task.lastrun.value),
                                            SettingsCore.getValueBykey($ctrl.options.frequencies, task.schtype.value),
                                            i));
                i++;

            });
            $ctrl.totalItemsCal = $ctrl.calTasks.length;
        };


        $ctrl.initDialogData = (task)=>{
            let result = {};

            result.type         = UserTaskData.optionInit($ctrl.options.taskNames);
            result.schtype      = UserTaskData.optionInit($ctrl.options.frequencies);
            result.displayId    = UserTaskData.displaysInit($ctrl.displays);
            result.DaysOfWeek   = $ctrl.options.DaysOfWeek;
            result.Monthes      = $ctrl.options.Monthes;
            result.WeekOfMonth  = $ctrl.options.WeekOfMonth;
            result.startdate = new Date();
            result.starttime = new Date();
            result.nthflag = '1';
            result.daysofweek3 = '1';
            result.daysofweek1 = ['1','2','3','4','5','6','7'];
            result.monthes = ['1','2','3','4','5','6','7','8','9','10','11','12'];
            result.weekofmonth = '1';
            result.everynweek = 1;
            result.everynday = 2;
            result.dayofmonth = 1;
            result.deleted = false;
            result.disabled = false;

            if(task){
                result._id = task._id;
                result.schtype.value   = task.schtype.value;
                result.displayId.value   = task.displayId.value;
                result.type.value   = task.type.value;

                if(task.nthflag.value===true && task.daysofweek.value==="1;2;3;4;5")
                    result.nthflag = '2';
                else
                    result.nthflag = (task.nthflag.value===true)?'1':'3';

                result.startdate = new Date(task.startdate.value);
                result.starttime = new Date(task.startdate.value);
                let stime = task.starttime.value.split(':');
                result.starttime.setHours(stime[0]);
                result.starttime.setMinutes(stime[1]);

                result.weekofmonth = task.weekofmonth.value;
                result.everynweek = parseInt(task.everynweek.value);
                result.everynday = parseInt(task.everynday.value);
                result.dayofmonth = parseInt(task.dayofmonth.value);
                result.disabled = task.dayofmonth.value;

                if(result.schtype.value == '3')
                    result.daysofweek1 = task.daysofweek.value.split(';');

                if(result.schtype.value == '4')
                    result.daysofweek3 = task.daysofweek.value;

                result.monthes = task.monthes.value.split(';')
            }

            return result;
        };

        $ctrl.calTaskAdd = ()=>{
            let calAddData = $ctrl.initDialogData();

            return dialog.open({title: "Add Task",
                    contentUrl: "/src/modules/scheduler/cal-edit-dialog.html",
                    result: calAddData
                })
                .then((result)=>{
                    let task = UserTask.fromDialogData(result, null, $ctrl.wid);
                    return $http.post(`api/usertasks`, task);
                }, ()=> {return null;})
                .then(result=>{
                    if(result){
                        $ctrl.refreshCalTasks();
                    }
                })
                .catch(err=>{
                    console.log(err);
                });
        };

        $ctrl.calTaskEdit = (id)=>{
            let editTask = $ctrl.calTasks[id];
            let calEditData = $ctrl.initDialogData(editTask);
            //console.log('editTask1 - ', editTask);

            return dialog.open({title: "Edit Task",
                    contentUrl: "/src/modules/scheduler/cal-edit-dialog.html",
                    result: calEditData
                })
                .then((result)=>{
                    let task = UserTask.fromDialogData(result, editTask, $ctrl.wid);
                    console.log('Edit task - ', task);

                    return $http.patch(`api/usertasks`, task);
                }, ()=> {return null})
                .then(result=>{
                    if(result){
                        $ctrl.refreshCalTasks();
                    }
                })
                .catch(err=>{
                    console.log(err);
                });
        };

        $ctrl.calTaskDelete = (id)=>{
            let task = $ctrl.calTasks[id];
            //console.log('Delete task - ', task);
            return $http.delete(`api/usertasks/${task._id}`)
            .then(result=>{
                $ctrl.refreshCalTasks();
            })
            .catch(err=>{
                console.log(err);
            });

        };
    },
    templateUrl: '/src/modules/scheduler/scheduler.html'
});
