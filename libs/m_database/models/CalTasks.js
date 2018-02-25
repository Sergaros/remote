'use strict'

const mongoose = require('m_mongoose');
const CalendarCache = mongoose.models.CalendarCache;

const Schema = mongoose.Schema;

const {
    ValueStringSchema,
    ValueBooleanSchema,
    ValueNumberSchema,
    OptionStringSchema,
    ValueObjectIdSchema,
    resolveValue
} = require('./Option.js');

const options = [
    'schtype',
    'displayId',
    'lastrun',
    'nextrun',
    'disabled',
    'deleted',
    'nthflag',
    'type',
    'status',
    'dayofmonth',
    'daysofweek',
    'everynweek',
    'everynday',
    'weekofmonth',
    'monthes',
    'starttime',
    'startdate',
    'testpattern',
    'sturtupdelay',
    'schedulingstr',
    'timeformat'
];

const CalTaskSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    serverTaskId: {
        type: String,
        default: ''
    },

    taskId: {
        type: String
    },

    displayId: {
        type: ValueStringSchema,
        require: true
    },
    type: {
        type: ValueStringSchema,
        require: true
    },
    schtype: {
        type: ValueStringSchema,
        require: true
    },
    status: {
        type: ValueStringSchema,
        require: true,
        default: {
            value: '0'
        }
    },
    lastrun: {
        type: ValueNumberSchema,
        require: true
    },
    nextrun: {
        type: ValueNumberSchema,
        require: true
    },
    disabled: {
        type: ValueBooleanSchema,
        require: true,
        default: {
            value: false
        }
    },
    deleted: {
        type: ValueBooleanSchema,
        require: true,
        default: {
            value: false
        }
    },
    synch: {
        type: Boolean,
        default: false
    },
    dayofmonth: {
        type: ValueStringSchema,
        default: {
            value: '1'
        }
    },
    daysofweek: {
        type: ValueStringSchema,
        default: {
            value: '1;2;3;4;5;6;7'
        }
    },
    everynday: {
        type: ValueStringSchema,
        default: {
            value: '2'
        }
    },
    everynweek: {
        type: ValueStringSchema,
        default: {
            value: '1'
        }
    },
    weekofmonth: {
        type: ValueStringSchema,
        default: {
            value: '1'
        }
    },
    monthes: {
        type: ValueStringSchema,
        default: {
            value: '1'
        }
    },
    nthflag: {
        type: ValueBooleanSchema,
        default: {
            value: true
        }
    },
    starttime: {
        type: ValueStringSchema,
        default: {
            value: ''
        }
    },
    startdate: {
        type: ValueStringSchema,
        default: {
            value: ''
        }
    },
    testpattern: {
        type: ValueStringSchema,
        default: {
            value: 'SMPTE'
        }
    },
    sturtupdelay: {
        type: ValueStringSchema,
        default: {
            value: ''
        }
    },
    schedulingstr: {
        type: ValueStringSchema,
        default: {
            value: ''
        }
    },
    timeformat: {
        type: ValueStringSchema,
        default: {
            value: ''
        }
    },
    exceptions: {
        type: [Schema.Types.Mixed],
        default: []
    }
});

CalTaskSchema.statics.addException = function(wstId, taskId, dfrom, dto) {
    return this.findOne({
            workstationId: wstId,
            _id: taskId
        })
        .then(task => {
            if (task) {

                let excIndex = task.exceptions.findIndex(ex => ex.to === dfrom);
                let excp = null;

                if (excIndex !== -1)
                    excp = task.exceptions[excIndex];

                if (excp) {
                    if (excp.from === dto) {
                        task.exceptions.splice(excIndex, 1);
                    } else {
                        excp.to = dto;
                        excp.synch = false;
                    }
                } else {
                    task.exceptions.push({
                        from: dfrom,
                        to: dto,
                        synch: false
                    });
                }

                task.exceptions = task.exceptions.filter(exc => exc.from !== exc.to);

                return task.save();
            } else
                return null;
        });
};

CalTaskSchema.statics.removePastExceptions = function(wstId, taskId) {
    return this.findOne({
            workstationId: wstId,
            _id: taskId
        })
        .then(task => {
            if (task) {
                let dt = new Date();
                dt.setHours(0);
                dt.setMinutes(0);
                dt.setSeconds(0);
                dt.setMilliseconds(0);

                task.exceptions = task.exceptions.filter(ex => ex.to >= dt.getTime());
                task.synch = false;
                return task.save();
            } else
                return null;
        });
};

CalTaskSchema.methods.getPublicFields = function() {
    let result = {};

    result._id = this._id;
    result.workstationId = this.workstationId;
    result.taskId = this.taskId;
    if (this.serverTaskId) result.serverTaskId = this.serverTaskId;

    options.forEach(name => {
        if (this[name])
            result[name] = {
                value: this[name].value,
                isChanged: this[name].isChanged,
                isLocked: this[name].isLocked
            };
    });

    return result;
};

CalTaskSchema.statics.getOptionsNames = function() {
    return options;
};

CalTaskSchema.statics.getFreeServerTaskId = function(wstId) {
    let id = 1;
    return this.find({
            workstationId: wstId
        })
        .then(tasks => {
            while (tasks.findIndex(task => task.serverTaskId == id) !== -1) {
                id++;
            }

            return id + '';
        })
}

const setValue = (obj1, obj2, name) => {
    if (name in obj2)
        obj1[name] = {
            value: obj2[name]
        };
}

const fromClient = (data) => {
    let task = {};

    task.workstationId = data.workstationId;
    task.taskId = data.taskId;
    task.synch = data.synch;

    if (data.serverTaskId)
        task.serverTaskId = data.serverTaskId;

    options.forEach(name => {
        if (name in data)
            setValue(task, data, name);
    });

    return task;
};

CalTaskSchema.statics.resolveExceptions = function(task) {
    let exceptions = [];
    task.exceptions.forEach(exc => {
        //if(!exc.synch){
        exceptions.push({
            from: exc.from / 1000,
            to: exc.to / 1000
        });
        exc.synch = true;
        //}
    });

    return exceptions;
}

CalTaskSchema.statics.synchronizeTask = function(task) {
    let result = {}

    //console.log('Synchronize task - ', task);

    let query = {
        workstationId: task.workstationId,
        taskId: task.taskId
    };
    if (task.serverTaskId)
        query = {
            workstationId: task.workstationId,
            serverTaskId: task.serverTaskId
        };

    return this.findOne(query)
        .then(ftask => {

            if (!ftask) {
                task.synch = true;
                return this.create(fromClient(task));
            }

            if (task.deleted) {
                return ftask.remove();
            }

            if (ftask.deleted.value) {
                result.deleted = true;
                return ftask.remove();
            } else {
                options.forEach(name => {
                    if (name in task) {
                        let res = resolveValue(ftask[name], task[name]);
                        if (res !== undefined) {
                            result[name] = res;
                        }
                    } else {
                        if (ftask[name].isChanged) {
                            ftask[name].isChanged = false;
                            result[name] = ftask[name].value;
                        }
                    }
                });

                ftask.synch = true;
                ftask.lastrun.value = parseInt(ftask.lastrun.value);
                ftask.nextrun.value = parseInt(ftask.nextrun.value);

                let exceptions = this.resolveExceptions(ftask);
                if (exceptions.length)
                    result.exceptions = exceptions;

                return CalendarCache.findOneAndRemove({
                        workstationId: ftask.workstationId,
                        taskId: ftask._id,
                        taskType: 'user'
                    })
                    .then(() => {
                        return ftask.save();
                    });
            }
        })
        .then(() => {
            if (Object.keys(result).length) {
                result.workstationId = task.workstationId;
                result.taskId = task.taskId;
                if (result.serverTaskId) result.serverTaskId = task.serverTaskId;
                result.displayId = task.displayId;
            }

            //console.log('Synchronize task result - ', result);
            return result;
        });
};

module.exports = mongoose.model('CalTasks', CalTaskSchema);
