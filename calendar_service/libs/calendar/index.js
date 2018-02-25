const moment = require('moment');
const scheduler = require('calendar-scheduler');


const zeroTime = (date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
};

const setTimeFromStr = (date, timeStr) => {
    let time = timeStr.split(':');
    zeroTime(date);
    date.setHours(time[0]);
    date.setMinutes(time[1]);
};

const getNextDate = (data) => {

    if(data.lastrun === 'Never') data.lastrun = 0; //qa tasks only

    if (data.schtype === '0') //startup
    {
        return 0;
    } else if (data.schtype === '1') //once
    {
        return 0;
    } else
    if (data.schtype === '2') //daily
    {
        let dt;
        let startdate;

        if(data.startdate && data.starttime)
            startdate = timeStampFromStr(data.startdate, data.starttime);
        else if(data.startdate)
            startdate = data.startdate;
        else
            startdate = 0;

        let lastdate = parseInt(data.lastrun);
        let date = new Date();

        if (data.starttime)
            setTimeFromStr(date, data.starttime);

        dt = date.getTime();

        if (startdate > dt)
            dt = startdate;

        if (lastdate > dt && lastdate>0)
            dt = lastdate;

        if(data.daysofweek){
            data.daysofweek = data.daysofweek.replace('7', '0');
        }

        if(lastdate === 0){
            return dt;
        } else return scheduler.calcDay({
                    date: dt,
                    everynday: data.everynday,
                    daysofweek: data.daysofweek
                });

    } else if (data.schtype === '3') //weekly
    {
        let dt;
        let time = data.starttime ? data.starttime.split(':') : [];

        if (data.lastrun) {
            dt = moment(parseInt(data.lastrun));
        } else {
            dt = moment();
            dt.add(-1, 'd');
        }


        if (time.length) {
            dt.set('hour', time[0]);
            dt.set('minute', time[1]);
        }

        if(data.daysofweek){
            data.daysofweek = data.daysofweek.replace('7', '0');
        }

        //console.log('calc!!!! - ', data);
        return scheduler.calcWeek({
            date: dt.valueOf(),
            everynweek: data.everynweek,
            daysofweek: data.daysofweek
        });
    } else if (data.schtype === '4') //monthly
    {
        let dt;
        let time = data.starttime ? data.starttime.split(':') : [];

        if (data.lastrun)
            dt = moment(parseInt(data.lastrun));
        else {
            dt = moment();
            dt.add(-1, 'd');
        }

        if (time.length) {
            dt.set('hour', time[0]);
            dt.set('minute', time[1]);
        }

        if(data.daysofweek){
            data.daysofweek = data.daysofweek.replace('7', '0');
        }

        return scheduler.calcMonth({
            date: dt.valueOf(),
            day: data.dayofmonth,
            weekofmonth: data.weekofmonth,
            daysofweek: data.daysofweek,
            months: data.months
        });

    } else if (data.schtype === '5' ||
        data.schtype === '6' ||
        data.schtype === '7') {
        let result;

        if (data.lastrun === 0) {
            result = (data.startdate && data.starttime) ? moment(timeStampFromStr(data.startdate, data.starttime)) : moment();
        } else {
            let months = 3;
            if (data.schtype === '6') months = 6;
            if (data.schtype === '7') months = 12;

            result = moment(parseInt(data.lastrun));
            result.add(months, 'M');
        }
        //console.log('result - ', result);
        return result.valueOf();
    }

    return 0;
}

const getDateStr = (date) => {
    let month = date.getMonth() + 1;
    return `${date.getFullYear()}-${month<10?'0'+month:month}-${date.getDate()}`;
};

const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};

const dateMin = (date) => {
    let result = new Date(date);
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
};

const dateMax = (date) => {
    let result = new Date(date);
    result.setHours(23);
    result.setMinutes(59);
    result.setSeconds(59);
    result.setMilliseconds(999);
    return result;
};

const isBetween = (date, dateFrom, dateTo) => {
    return date.getTime() >= dateFrom.getTime() && date.getTime() <= dateTo.getTime();
};

const isLess = (date, dateTo) => {
    return date.getTime() <= dateTo.getTime();
};

const getTimeBorders = (date, period) => {
    //for month
    /*let minDate = new Date(date);
    minDate.setMonth(minDate.getMonth() - 1);*/

    let dateFrom = new Date(dateMin(date));
    dateFrom.setDate(1);

    /*let maxDate = new Date(date);
    maxDate.setMonth(maxDate.getMonth() + 1);*/

    let dateTo = new Date(dateMax(date));
    dateTo.setDate(daysInMonth(dateTo.getMonth(), dateTo.getFullYear()));

    console.log('Time borders - ', dateFrom, dateTo);

    return {
        from: dateFrom,
        to: dateTo
    };
};

const timeStampFromStr = (dateStr, timeStr) => {
    let date = new Date(dateStr);

    if(timeStr)
    {
        let time = timeStr.split(':');
        date.setHours(time[0]);
        date.setMinutes(time[1]);
    }

    return date.getTime();
};

const calcQANextRun = (task) => {
    let data = {};

    /*
       FreqDaily   = 0,
       FreqWeekly  = 1,
       FreqBiWeekly = 6,
       FreqMonthly = 2,
       FreqQuaterly = 3,
       FreqBinnualy = 4,
       FreqAnnualy = 5,
       FreqEveryFiveYears = 7
    */

    if(task.freqCodes.value==0)
        data.schtype = '2';
    else if(task.freqCodes.value==1)
        data.schtype = '3';
    else if(task.freqCodes.value==2)
        data.schtype = '4';
    else if(task.freqCodes.value==3)
        data.schtype = '5';
    else if(task.freqCodes.value==4)
        data.schtype = '6';
    else if(task.freqCodes.value==5)
        data.schtype = '7';

    if (task.nextdateFixed)
        data.startdate = task.nextdateFixed.value;

    if (task.lastrundate)
        data.lastrun = task.lastrundate.value;

    //console.log('calcQANextRun - ', data);
    task.nextdate = {
        value: getNextDate(data)
    };

    //console.log('calcQANextRun result - ', task.nextdate);
};

const getFromTask = (propName, task, data, defvalue) => {
    if (task[propName]) {
        data[propName] = task[propName].value;
    } else if (defvalue) {
        data[propName] = defvalue;
    }
}

const calcUserNextRun = (task) => {
    let data = {};

    getFromTask('lastrun', task, data);
    getFromTask('schtype', task, data);
    getFromTask('startdate', task, data);
    getFromTask('starttime', task, data);
    //getFromTask('nthflag', task, data);
    getFromTask('dayofmonth', task, data);
    getFromTask('weekofmonth', task, data);
    if(task.nthflag.value)
        getFromTask('daysofweek', task, data);
    else
        getFromTask('everynday', task, data);

    getFromTask('everynweek', task, data);
    getFromTask('plannedDate', task, data);

    if(data.everynday)
        data.everynday = parseInt(data.everynday);

    if(data.everynweek)
        data.everynweek = parseInt(data.everynweek);

    task.nextrun = {
        value: getNextDate(data)
    };
};

module.exports = {
    getTimeBorders,
    isBetween,
    isLess,
    calcUserNextRun,
    calcQANextRun,
    getDateStr,
    dateMin,
    dateMax,
    timeStampFromStr
};
