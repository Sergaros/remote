'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const {
    ValueStringSchema,
    ValueNumberSchema
} = require('./Option.js');

const QATaskSchema = new Schema({
    name: {
        type: ValueStringSchema,
        require: true
    },
    freq: {
        type: ValueStringSchema,
        require: true
    },
    freqCodes: {
        type: ValueStringSchema,
        require: true
    },
    lastrundate: {
        type: ValueStringSchema,
        require: true
    },
    nextdate: {
        type: ValueNumberSchema,
        require: true
    },
    nextdateFixed: {
        type: ValueNumberSchema,
        require: true
    },
    taskStatus: {
        type: ValueStringSchema,
        require: true
    },
    taskKey: {
        type: ValueStringSchema,
        require: true
    },
    stepsIds: {
        type: [Number],
        require: true
    }
});

const QATasksSchema = new Schema({
    displayId: {
        type: Schema.Types.ObjectId,
        ref: 'Displays',
        require: true
    },
    taskList: {
        type: [QATaskSchema]
    },
    exceptions: {
        type: [Schema.Types.Mixed],
        default: []
    }
});

const QATasksListSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    tasks: {
        type: [QATasksSchema],
        require: true
    }

});

QATasksListSchema.statics.resolveExceptions = function(taskKey, clientExcps, serverExcps) {
    //console.log('resolveExceptions - ', taskKey, clientExcps, serverExcps);
    let result = [];

    if(clientExcps.length){
        clientExcps.forEach(cxcp=>{
            let sxcp = serverExcps.find(xcp=>xcp.from===cxcp.from);

            if(sxcp && !sxcp.synch){
                result.push({from: sxcp.from, to: sxcp.to});
                sxcp.synch = true;
            } else
                serverExcps.push({taskKey: taskKey, from: cxcp.from, to: cxcp.to, synch: true});
        });
    } else {
        serverExcps.forEach(sxcp=>{
            if(!sxcp.synch){
                result.push({from: sxcp.from, to: sxcp.to});
                sxcp.synch = true;
            }
        })
    }

    return serverExcps.map(exc=>{
        return {from: exc.from, to: exc.to};
    });//result;
};

QATasksListSchema.statics.getExceptions = function(wstId, dispId, taskKey) {
    //console.log('Get exceptions - ', wstId, dispId, taskKey);
    return this.findOne({workstationId: wstId})
    .then(result=>{
        //console.log('Get exceptions 1', result);
        if(result){
            //console.log('Get exceptions 2');
            let tlist = result.tasks.find(tl=>tl.displayId.equals(dispId));
            if(tlist){
                //console.log('Get exceptions 3');
                return tlist.exceptions.filter(exc=>exc.taskKey===taskKey);
            }
        }

        return null;
    });
}

QATasksListSchema.statics.addException = function(wstId, taskId, dispId, dfrom, dto) {
    console.log('addException 0');
    return this.findOne({
            workstationId: wstId
        })
        .then(result => {
            let tasks = result.tasks.find(task => task.displayId.equals(dispId));

            if (tasks) {
                let task = tasks.taskList.find(task => task._id.equals(taskId));
                if (task) {
                    let excp = tasks.exceptions.find(ex => ex.from === dfrom && ex.taskKey === task.taskKey.value);
                    if (excp){
                        excp.to = dto;
                        excp.synch = false;
                        tasks.markModified('exceptions');
                        console.log('addException 1');
                    } else {
                        tasks.exceptions.push({
                            from: dfrom,
                            to: dto,
                            taskKey: task.taskKey.value,
                            synch: false
                        });
                        console.log('addException 2');
					}
                    tasks.exceptions =  tasks.exceptions.filter(exc=>exc.from!==exc.to);
                }
            }

            console.log('addException 3');
            return result.save();
        });
};

QATasksListSchema.statics.removePastExceptions = function(wstId, dispId, taskId) {
    return this.findOne({
            workstationId: wstId
        })
        .then(result => {

            result.tasks.forEach(item=>{
                item.exceptions = item.exceptions.filter(ex => ex.to > Date.now());
            });


            return result.save();
        });
};

QATasksListSchema.statics.setNextDate = (wstId, dispId, taskId, nextdate) => {
    nextdate.date = parseInt(nextdate.date);
    return mongoose.models.QATasks.findOne({
            workstationId: wstId
        })
        .then(result => {

            let fromDate;
            let tasks = result.tasks.find(task => task.displayId.equals(dispId));
            let task = tasks.taskList.find(task => task._id.equals(taskId));
            /*let ch = false;

            if (task.nextdate.value !== nextdate.date) {

                fromDate = task.nextdate.value;
                task.nextdate.value = nextdate.date;
                task.nextdate.isChanged = true;
                ch = true;
            }

            if (nextdate.date.isLocked !== task.nextdate.isLocked) {
                task.nextdate.isLocked = nextdate.date.isLocked;
                ch = true;
            }

            if (ch)
                return result.save()
                .then(()=>{
                    return {workstationId: wstId, displayId: dispId, taskId: taskId, fromDate: fromDate, toDate: nextdate}
                });
            else
                return null;*/

            if(task){
                fromDate = task.nextdateFixed.value;
                task.nextdate.value =  nextdate.date;

                return result.save()
                .then(()=>{
                    return {workstationId: wstId, displayId: dispId, taskId: taskId, fromDate: fromDate, toDate: nextdate.date};
                });
            } else
                return null;
        })
        .then(res =>{
            if(res){
                if(res.dateFrom !== res.toDate)
                    return mongoose.models.QATasks.addException(res.workstationId, res.taskId, res.displayId, res.fromDate, res.toDate);
                else
                    return null;
            }
        });
};

module.exports = mongoose.model('QATasks', QATasksListSchema);
