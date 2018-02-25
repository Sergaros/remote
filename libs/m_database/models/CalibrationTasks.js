'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const { ValueStringSchema,
        ValueBooleanSchema,
        ValueNumberSchema,
        OptionStringSchema,
        resolveOptionsElement,
        resolveValue } = require('./Option.js');

const {createDate} = require('Common');

const CalTaskSchema = new Schema({
        taskId: {
            type: String,
            require: true
        },
        type:{
            type: ValueStringSchema,
            require: true
        },
        schtype: {
            type: ValueStringSchema,
            require: true
        },
        TaskStatus: {
            type: ValueStringSchema,
            require: true
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
            default: false
        },
        isDeleted: {
            type: ValueBooleanSchema,
            default: false
        },
        isSynchronize: {
            type: Boolean,
            default: true
        },
        params: {
            type: [OptionStringSchema]
        }
});

const CalTasksSchema = new Schema({
    displayId: {
        type: Schema.Types.ObjectId,
        ref: 'Displays',
        require: true
    },
    userTasks: {
        type: [CalTaskSchema]
    },
    serverTasks: {
        type: [CalTaskSchema]
    }
});

const CalibartionTasksSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    tasks: {
        type: [CalTasksSchema],
        require: true
    }
});

CalibartionTasksSchema.methods.getNewUserTasksIds = function(displayId){
    let ids = [];
    for(let i = 0; i < this.tasks.length; i++){
        for(let j = 0; j <  this.tasks[i].userTasks.length; j++){
            let task = this.tasks[i].userTasks[j];
            if(!task.isSynchronize)
                ids.push(task.taskId);
        }
    }

    return ids;
};

CalibartionTasksSchema.methods.getNewServerTasksIds = function(displayId){
    let ids = [];
    for(let i = 0; i < this.tasks.length; i++){
        for(let j = 0; j <  this.tasks[i].serverTasks.length; j++){
            let task = this.tasks[i].serverTasks[j];
            if(!task.isSynchronize)
                ids.push(task.taskId);
        }
    }

    return ids;
};

CalibartionTasksSchema.methods.getUserTaskIndex = function(displayId, taskId){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    let index = tasks.userTasks.findIndex(task=>task.taskId===taskId);
    return index;
};

CalibartionTasksSchema.methods.getUserTaskIndexById = function(displayId, id){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    let index = tasks.userTasks.findIndex(task=>task._id.equals(id));
    return index;
};

CalibartionTasksSchema.methods.getServerTaskIndex = function(displayId, taskId){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    let index = tasks.serverTasks.findIndex(task=>task.taskId===taskId);
    return index;
};

CalibartionTasksSchema.methods.getServerTaskIndexById = function(displayId, id){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    let index = tasks.serverTasks.findIndex(task=>task._id.equals(id));
    return index;
};

CalibartionTasksSchema.methods.getUserTask = function(displayId, taskId){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    return tasks.userTasks.find(task=>task.taskId===taskId);
};

CalibartionTasksSchema.methods.getServerTask = function(displayId, taskId){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return -1;

    return tasks.serverTasks.find(task=>task.taskId===taskId);
};

CalibartionTasksSchema.methods.addUserTask = function(displayId, ntask){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));

    if(!tasks) return false;

    if(tasks.userTasks.findIndex(task=>task.taskId===ntask.taskId) !== -1)
        return false;

    tasks.userTasks.push(ntask);

    return true;
};

CalibartionTasksSchema.methods.addServerTask = function(displayId, ntask){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) return false;

    if(!ntask.taskId){
        if(tasks.serverTasks.length === 0)
            ntask.taskId = 1;
        else
            ntask.taskId = tasks.serverTasks.reduce((max, val)=>{if(max<val)max=val; return val});
    }

    if(tasks.serverTasks.findIndex(task=>task.taskId===ntask.taskId) !== -1)
        return false;

    tasks.serverTasks.push(ntask);

    return true;
};

const fullValueResolve = (paramName, task, nTask, result)=>{
    if( nTask[paramName]){
        let rs = resolveValue(task[paramName], nTask[paramName].value);
        if(rs !== nTask[paramName].value) result[paramName] = rs;
    }
};

const isChangedValueResolve = (paramName, task, result)=>{
    if(task[paramName].isChanged){
        result[paramName] = task[paramName].value;
        task[paramName].isChanged = false;
    }
};

CalibartionTasksSchema.methods.deleteTask = function(displayId, taskId, type){
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));


    const removeTask = (arr,id)=>{
        let index = arr.findIndex(task=>taskId===id);
        if(index !== -1){
            arr.splice(index, 1);
            return true;
        } else
            return false;
    };

    if(type === 'user'){
        return removeTask(tasks.userTasks, taskId);
    }
    else if(type === 'server'){
        return removeTask(tasks.serverTasks, taskId);
    }

    return false;
};

CalibartionTasksSchema.methods.deleteServerTask = function(displayId, taskId){

};

CalibartionTasksSchema.methods.updateUserTask = function(displayId, ntask){
    let result = {};
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) {
        console.log('Error: updateUserTask');
        return null;
    }
    let userTask = tasks.userTasks.find(task=>task.taskId===ntask.taskId);

    if(userTask){
        fullValueResolve('type', userTask, ntask, result);
        fullValueResolve('schtype', userTask, ntask, result);
        fullValueResolve('lastrun', userTask, ntask, result);
        fullValueResolve('nextrun', userTask, ntask, result);
        fullValueResolve('TaskStatus', userTask, ntask, result);
        fullValueResolve('disabled', userTask, ntask, result);
        fullValueResolve('isDeleted', userTask, ntask, result);

        for(let i = 0; i < ntask.params.length; i++){
            let index = userTask.params.findIndex(param=>param.name===ntask.params[i].name);
            if(index === -1){
                userTask.params.push(ntask.params[i]);
            } else {
                let rs = resolveValue(userTask.params[index], ntask.params[i].value);
                if(rs !== ntask.params[i].value) {
                    if(!result.params) result.params = [];
                    result.params.push({name: ntask.params[i].name, value: rs});
                }
            }
        };

        for(let i = 0; i < userTask.params.length; i++){
            if(userTask.params[i].isChanged){
                if(!result.params) result.params = [];
                result.params.push({name: userTask.params[i].name, value: userTask.params[i].value});
                userTask.params[i].isChanged = false;
            }
        };
    }

    if(Object.keys(result).length)
        return result;
    else
        return null;
};

const innerResolveValue = (name, task, ntask)=>{
    if(task[name].value !== ntask[name].value){
        task[name].value = ntask[name].value;
        task[name].isChanged = true;
    }
};

CalibartionTasksSchema.methods.updateInnerUserTask = function(displayId, ntask){
    let result = {};
    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) {
        console.log('Error: updateUserTask');
        return null;
    }
    let userTask = tasks.userTasks.find(task=>task.taskId===ntask.taskId);

    if(userTask){
        innerResolveValue('type', userTask, ntask);
        innerResolveValue('schtype', userTask, ntask);
        innerResolveValue('lastrun', userTask, ntask);
        innerResolveValue('nextrun', userTask, ntask);
        innerResolveValue('TaskStatus', userTask, ntask);
        innerResolveValue('disabled', userTask, ntask);
        innerResolveValue('isDeleted', userTask, ntask);

        for(let i = 0; i < ntask.params.length; i++){
            let index = userTask.params.findIndex(param=>param.name===ntask.params[i].name);
            if(index === -1){
                userTask.params.push(ntask.params[i]);
            } else {

                if(userTask.params[index].value !== ntask.params[i].value){
                    userTask.params[index].value = ntask.params[i].value;
                    userTask.params[index].isChanged = true;
                }
            }
        };
    }
};

/*CalibartionTasksSchema.methods.updateInnerUserTask = function(displayId, ntask){
    let result = {};

    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) {
        console.log('Error: updateInnerUserTask');
        return null;
    }

    let userTask = tasks.userTasks.find(task=>task.taskId===ntask.taskId);
    if(userTask){
        fullValueResolve('lastrun', userTask, ntask, result);
        fullValueResolve('nextrun', userTask, ntask, result);

        isChangedValueResolve('type', userTask, result);
        isChangedValueResolve('schtype', userTask, result);
        isChangedValueResolve('TaskStatus', userTask, result);
        isChangedValueResolve('disabled', userTask, result);
        isChangedValueResolve('isDeleted', userTask, result);

        for(let i = 0; i < userTask.params.length; i++){
            if(userTask.params[i].isChanged){
                if(!result.params) result.params = [];
                result.params.push({name: userTask.params[i].name, value: userTask.params[i].value});
                userTask.params[i].isChanged = false;
            }
        };
    }

    if(Object.keys(result).length)
        return result;
    else
        return null;
};*/


CalibartionTasksSchema.methods.updateServerTask = function(displayId, ntask){
    let result = {};

    let tasks = this.tasks.find(tasksList=>tasksList.displayId.equals(displayId));
    if(!tasks) {
        console.log('Error: updateServerTask');
        return null;
    }

    let serverTask = tasks.serverTasks.find(task=>task.taskId===ntask.taskId);
    if(serverTask){
        fullValueResolve('lastrun', serverTask, ntask, result);
        fullValueResolve('nextrun', serverTask, ntask, result);

        isChangedValueResolve('type', serverTask, result);
        isChangedValueResolve('schtype', serverTask, result);
        isChangedValueResolve('TaskStatus', serverTask, result);
        isChangedValueResolve('disabled', serverTask, result);
        isChangedValueResolve('isDeleted', serverTask, result);

        for(let i = 0; i < serverTask.params.length; i++){
            if(serverTask.params[i].isChanged){
                if(!result.params) result.params = [];
                result.params.push({name: serverTask.params[i].name, value: serverTask.params[i].value});
                serverTask.params[i].isChanged = false;
            }
        };
    }

    if(Object.keys(result).length)
        return result;
    else
        return null;
};

CalibartionTasksSchema.statics.TaskToJson = (dispNameId, task)=>{
    let result = {};
    //console.log('conv task - ', task );
    result.displayId    = dispNameId;
    result.taskId       = task.taskId;
    result.schtype      = task.schtype.value;
    result.type         = task.type.value;
    result.TaskStatus   = task.TaskStatus.value;
    result.lastrun      = task.lastrun.value;
    result.nextrun      = task.nextrun.value;
    result.disabled     = task.disabled.value;
    result.isDeleted    = task.isDeleted.value;

    result.params = [];
    task.params.forEach(param=>{
        result.params.push({name: param.name, value: param.value});
        param.isChanged = false;
    });

    return result;
};

CalibartionTasksSchema.statics.IsTaskSynchronizeNeed = (task, state)=>{
    task.isSynchronize = !state;
    task.schtype.isChanged = state;
    task.TaskStatus.isChanged = state;
    task.lastrun.isChanged = state;
    task.nextrun.isChanged = state;
    task.disabled.isChanged = state;
    task.isDeleted.isChanged = state;
    task.params.forEach(param=>{param.isChanged=state});
};

CalibartionTasksSchema.statics.ConvertJsonToTasks = (jsData)=>{
    let data={};
    data.userTasks = {};

    if(jsData.userTasks)
    {
        for(let i = 0; i < jsData.userTasks.length; i++){
            let task = jsData.userTasks[i];

            if(!data.userTasks[task.displayId])
                data.userTasks[task.displayId] = [];

            data.userTasks[task.displayId].push({
                taskId          :task.taskId,
                type            :{value: task.type},
                schtype         :{value: task.schtype},
                lastrun         :{value: task.lastrun*1000},
                nextrun         :{value: task.nextrun*1000},
                TaskStatus      :{value: task.TaskStatus},
                disabled        :{value:task.disabled},
                isDeleted       :{value:task.isDeleted},
                params          :task.params
            });
        };
    };

    if(jsData.serverTasks)
    {
        data.serverTasks = {};
        for(let i = 0; i < jsData.serverTasks.length; i++){
            let task = jsData.serverTasks[i];

            if(!data.serverTasks[task.displayId])
                data.serverTasks[task.displayId]= [];

            data.serverTasks[task.displayId].push({
                taskId          :task.taskId,
                lastrun         :{value: task.lastrun},
                nextrun         :{value: task.nextrun}
            });
        };
    };

    return data;
};

module.exports = mongoose.model('CalibrationTasks', CalibartionTasksSchema);
