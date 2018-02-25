'use strict';

class Task {
    constructor(name, device, nextdate, lastrundate, frequency, id) {
        this.name = name;
        this.device = device;
        this.nextdate = nextdate;
        this.lastrundate = lastrundate;
        this.frequency = frequency;
        this.id = id;
    }
};

class UserTask {

    static getDate(date){
        let dt = new Date(date);
        let year = dt.getFullYear();
        let month = dt.getMonth()+1;
        let day = dt.getDate();

        return (dt.getTime() === 0)?'Never':`${year}.${month<10?'0'+month:month}.${day<10?'0'+day:day}`;
    }

    static getTime(date){
        let dt = new Date(date);
        let m = dt.getMinutes();
        if(m < 10) m = '0'+m;

        return (dt.getTime() === 0)?'Never':`${dt.getHours()}:${m}`;
    }

    static timeStampFromStr (dateStr, timeStr){
        let date = new Date(dateStr);
        let time = timeStr.split(':');
        date.setHours(time[0]);
        date.setMinutes(time[1]);

        return date.getTime();
    };

    static calculateNextRun(task) {
        const mdays = ['7', '1', '2', '3', '4', '5', '6'];

        if(!task.nextrun && !task.lustrun){
            task.nextrun = {value: 0};
            task.lastrun = {value: 0};

            return;
        } else {
            if(!task.lastrun) task.lastrun = {value: 0, isChanged : true};

            if(task.schtype.value === '0')//startup
            {
                task.nextrun = {value: 0, isChanged : true};
            }
            else if(task.schtype.value === '1')//once
            {
                task.nextrun = {value: UserTask.timeStampFromStr(task.startdate.value, task.starttime.value), isChanged : true};
            }
            else if(task.schtype.value === '2')//daily
            {
                let startdate = UserTask.timeStampFromStr(task.startdate.value, task.starttime.value);
                let lastdate = task.lastrun.value;
                let tmp = Date.now();

                if(startdate > tmp)
                    tmp = startdate;

                if(lastdate > tmp)
                    tmp = lastdate;

                let result = moment(tmp);

                if(task.nthflag.value && task.daysofweek.value.split(';').length === 7){
                    result.add(1, 'days');
                    task.nextrun = {value: result.valueOf()};
                } else if(task.nthflag.value && task.daysofweek.value.split(';').length === 5){
                    result.add(1, 'days');
                    while(mdays[result.day()]>5) result.add(1, 'days');
                } else{
                    if(lastdate !== 0)
                        result.add(task.everynday.value, 'days');
                }
                task.nextrun = {value: result.valueOf(), isChanged : true};
            }
            else if(task.schtype.value === '3')//weekly
            {
                let result;
                let time = task.starttime.value.split(':');
                let startdate;

                if(task.lastrun.value){
                    result = moment(task.lastrun.value);
                    let adddays = 7*task.everynweek.value;
                    result.add(7, 'days');

                } else
                    result = moment();

                result.set('hour', time[0]);
                result.set('minute', time[1]);

                let daysofweek = task.daysofweek.value.split(';');

                let index = -1;
                do{
                    let day = (mdays[result.day()])+'';
                    index = daysofweek.findIndex(d=>d===day);
                    if(index===-1){
                        result.add(1, 'days');
                    }
                }while(index===-1)

                task.nextrun = {value: result.valueOf(), isChanged : true};
            }
            else if(task.schtype.value === '4')//monthly
            {
                let result;
                let time = task.starttime.value.split(':');
                let startdate;

                if(task.lastrun.value){
                    result = moment(task.lastrun.value);
                    result.add(1, 'months');
                } else
                    result = moment();

                result.set('hour', time[0]);
                result.set('minute', time[1]);

                let months = task.monthes.value.split(';');
                let index = -1;
                let i = 0;
                do{
                    index = months.findIndex(m=>m==(result.get('month')+1));
                    if(index === -1){
                        result.add(1, 'months');
                    }
                }while(index === -1)

                if(task.nthflag.value){
                    let maxd = moment().daysInMonth();
                    let dt = parseInt(task.dayofmonth.value);

                    if(dt > maxd)
                        dt = maxd;

                    result.set('date', dt);
                } else {
                    let wofm = parseInt(task.weekofmonth.value);
                    let dofw = parseInt(task.daysofweek.value);

                    result.set('date', moment().date());

                    if(wofm===1 || wofm===2 || wofm===3 || wofm===4){
                        do{
                            if(mdays[result.day()] == dofw){
                                wofm--;
                            }
                            if(wofm > 0)
                                result.add(1, 'days');
                        }while(wofm > 0);
                    } else {
                        result.set('date', result.daysInMonth());

                        while(mdays[result.day()] != dofw){
                            result.add(-1, 'days');
                            if(result.date() === 1){
                                if(mdays[result.day()] == dofw)
                                    break;
                                else {
                                    result.add(1, 'months');
                                    result.set('date', result.daysInMonth());
                                }
                            }
                        }
                    }
                }
                task.nextrun = {value: result.valueOf(), isChanged : true};
            }
            else if(task.schtype.value === '5' ||
                task.schtype.value === '6' ||
                task.schtype.value === '7')
            {
                let result;

                if(task.lastrun.value === 0){
                    result = moment(UserTask.timeStampFromStr(task.startdate.value, task.starttime.value));
                }
                else {
                    let months = 4;
                    if(task.schtype.value === '6') months = 6;
                    if(task.schtype.value === '7') months = 12;

                    result = moment(task.lastrun.value);
                    result.add(months, 'months');
                }
                task.nextrun = {value: result.valueOf(), isChanged : true};
            }
        }
    }

    static fromDialogData(data, task, wid){
        const setValue = (obj1, obj2, name)=>{
            if(!obj1[name]) obj1[name] = {};

            if(obj1[name].value != obj2[name])
                obj1[name] = {value: obj2[name], isChanged: true};
        };

        if(!task) task = {
            type: {},
            schtype: {},
            displayId: {},
            monthes: {},
            startdate: {},
            starttime: {},
            nthflag: {},
            daysofweek: {},
            nextrun: {value: 0},
            lastrun: {value: 0}
        };

        if(!task._id)
            task.workstationId = wid;

        if(task.type.value !== data.type.value){
            task.type = {value: data.type.value};
            task.type.isChanged = true;
        }

        if(task.schtype.value !== data.schtype.value){
            task.schtype = {value: data.schtype.value};
            task.schtype.isChanged = true;
        }

        if(task.displayId.value !== data.displayId.value){
            task.displayId = {value: data.displayId.value};
            task.displayId.isChanged = true;
        }

        if(task.schtype){

            if(task.schtype.value=='3'){
                let tmp = {value: data.daysofweek1.join(';')};
                if(task.daysofweek.value !==  tmp.value)
                    task.daysofweek = tmp;

                task.daysofweek.isChanged = true;
            } else if(task.schtype.value=='4'){
                let tmp = {value: data.daysofweek3};
                if(task.daysofweek.value !==  tmp.value)
                    task.daysofweek = tmp;

                task.daysofweek.isChanged = true;
            } else {
            if(data.nthflag==='1'){
                if(!task.nthflag.value){
                    task.nthflag = {value: true};
                    {task.nthflag.isChanged = true};
                }

                if(task.daysofweek.value !==  '1;2;3;4;5;6;7'){
                    task.daysofweek = {value: '1;2;3;4;5;6;7'};
                    {task.daysofweek.isChanged = true;};
                }

                } else if(data.nthflag==='2'){
                    task.nthflag = {value: true};
                    task.daysofweek = {value: '1;2;3;4;5'};
                    {task.daysofweek.isChanged = true; task.nthflag.isChanged = true};
                } else{
                        if(task.nthflag.value){
                            task.nthflag = {value: false};
                            {task.nthflag.isChanged = true};
                        }
                }
            }
        }

        setValue(task, data, 'weekofmonth');
        setValue(task, data, 'everynweek');
        setValue(task, data, 'everynday');
        setValue(task, data, 'dayofmonth');

        if(task.monthes.value !== data.monthes.join(';')){
            task.monthes = {value: data.monthes.join(';')};
            task.monthes.isChanged = true;
        }

        let sdate = UserTask.getDate(new Date(data.startdate));
        let stime = UserTask.getTime(new Date(data.starttime));

        if(task.startdate.value !== sdate){
            task.startdate = {value: sdate};
            task.startdate.isChanged = true;
        }

        if(task.starttime.value !== stime){
            task.starttime = {value: stime};
            task.starttime.isChanged = true;
        }

        let ch = data.nthflag==='3'?false:true;
        if(task.nthflag.value !== ch){
            task.nthflag = data.nthflag === '3'?{value: false}:{value: true};
            task.nthflag.isChanged = true;
        }

        //UserTask.calculateNextRun(task);

        if(task.nextrun.isChanged){
            task.startdate.value = UserTask.getDate(task.nextrun.value);
            task.startdate.isChanged = true;
            task.starttime.value = UserTask.getTime(task.nextrun.value);
            task.starttime.isChanged = true;
        }

        return task;
    }
};
