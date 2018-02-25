const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const WorkHourSchema = new Schema({
    date: {
        type: Date,
        require: true
    },
    hours:{
        type: Number,
        require: true
    }
});

const DisplayHoursSchema = new  Schema({
    displayId: {
        type: Schema.Types.ObjectId,
        ref: 'Displays',
        require: true
    },

    hoursData:{
        type: [WorkHourSchema]
    }
});

const DisplaysHoursSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    displays:{
        type: [DisplayHoursSchema]
    }
});

DisplaysHoursSchema.statics.setHours = (dispHoursObj, data)=> {
    data.forEach(date=>{
        let dateElement = dispHoursObj.hoursData.find(dateS=>dateS.date.getTime()===date.date.getTime());
        if(dateElement){
            if(dateElement.hours<date.hours)
                dateElement.hours = date.hours;
        }
        else{
            dispHoursObj.hoursData.push({date: date.date, hours: date.hours});
        }
    });
};

module.exports = mongoose.model('DisplaysHours', DisplaysHoursSchema);
