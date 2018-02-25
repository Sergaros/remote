'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const CalendarCacheSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    taskId: {
        type: Schema.Types.ObjectId,
        require: true
    },

    taskType: {
        type: String
    },

    dates: {
        type: [Date]
    }
});

const timeReset = (date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
};

CalendarCacheSchema.statics.checkDate = (workstationId, taskId, type, fdate, tdate) => {
    //console.log('checkDate - ', ndate);
    return mongoose.models.CalendarCache.findOne({
            workstationId: workstationId,
            taskId: taskId,
            taskType: type
        })
        .then(task => {
            if (task) {
                let index = task.dates.findIndex(date => date.getTime()===fdate.getTime());
                let ndate = task.dates[index+1];
                let pdate = task.dates[index-1];

                let lb = pdate?pdate.getTime():fdate.getTime();
                let rb = ndate?ndate.getTime():tdate.getTime()+1;

                /*console.log('lb - ', lb);
                console.log('rb - ', rb);*/

                let m  = tdate.getTime();
                /*console.log('m - ', m);

                console.log('check result - ', m>lb && m<rb);*/

                return m>lb && m<=rb;
            } else
                return false;
        })
        .catch(err => {
            throw err;
        });
};

CalendarCacheSchema.statics.getLastPlannedDate = (workstationId, taskId, type) => {
    return mongoose.models.CalendarCache.findOne({
            workstationId: workstationId,
            taskId: taskId,
            taskType: type
        })
        .then(task => {
            if (task &&  task.dates.length) {
                return task.dates[task.dates.length-1];
            } else
                return undefined;
        })
        .catch(err => {
            throw err;
        });
}

CalendarCacheSchema.statics.getTasksDates = (workstationId, taskId, type, dateFrom, dateTo) => {
    //console.log('getTasksDates');
    return mongoose.models.CalendarCache.findOne({
            workstationId: workstationId,
            taskId: taskId,
            taskType: type
        })
        .then(task => {
            if (task) {
                return task.dates.filter(date => date.getTime() >= dateFrom && date.getTime() <= dateTo.getTime());
            } else
                return [];
        })
        .then(dates=>{
            if(dates.length>1)
                return dates.sort((a,b)=>a.getTime()-b.getTime());
            else
                return dates;
        })
        .catch(err => {
            throw err;
        });
};

CalendarCacheSchema.statics.addTask = (workstationId, taskId, type, date) => {
    //console.log('cache add task');
    timeReset(date);

    return mongoose.models.CalendarCache.findOne({
            workstationId: workstationId,
            taskId: taskId,
            taskType: type
        })
        .then(task => {
            if (task) {
                if (!task.dates.find(tdate => {
                        return tdate.getTime() === date.getTime();
                    })) {
                    task.dates.push(date);
                }

                return task;
            } else {
                return new mongoose.models.CalendarCache({
                    workstationId: workstationId,
                    taskType: type,
                    taskId: taskId,
                    dates: [date]
                });
            }
        })
        .then(task => {
            return task.save();
        })
        .catch(err => {
            throw err;
        });
};

CalendarCacheSchema.statics.updateTask = (workstationId, taskId, type, oldDate, newDate) => {
    timeReset(oldDate);
    timeReset(newDate);
    console.log('updateTask - ', oldDate, newDate);
    return mongoose.models.CalendarCache.findOne({
            workstationId: workstationId,
            taskId: taskId,
            taskType: type
        })
        .then(task => {
            if (task) {
                let index = task.dates.findIndex(d => d.getTime() === oldDate.getTime());
                console.log('index - ', index);
                if (index !== -1) {
                    task.dates.splice(index, 1, newDate);
                    task.dates.sort((a, b) => a.getTime() - b.getTime());

                    return task.save();
                }
            }
            return;
        })
        .catch(err => {
            throw err;
        });
};

CalendarCacheSchema.statics.removePastDates = (workstationId, type) => {
    let today = new Date();
    timeReset(today);

    return mongoose.models.CalendarCache.find({workstationId: workstationId, taskType: type})
    .then(tasks=>{
        tasks.forEach(task=>{
            task.dates = task.dates.filter(date=>date.getTime()>=today.getTime());
        });

        return Promise.all(tasks.map(task=>task.save()))
    })
};

module.exports = mongoose.model('CalendarCache', CalendarCacheSchema);
