const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const workstationSchema = new Schema({
    name:{
        type: String,
        required: true
    },

    application:{
        type: String,
        required: true
    },

    wsId:{
        type: String,
        required: true
    },

    inventoryNumber:{
        type: Number
    },

    installationDay:{
        type: Date
    },

    group:{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },

    preferences:{
        type: Schema.Types.Mixed
    }
});

workstationSchema.statics.ReplaceGroup = (oldGId, newGId)=>{
    return mongoose.models.Workstation.find({group: oldGId})
    .then(workstations=>{
        workstations.forEach(wst=>{
            wst.group = newGId;
        });

        return Promise.all(workstations.map(wst=>wst.save()));
    });
};

workstationSchema.statics.ReplaceGroupById = (id, newGId)=>{
    return mongoose.models.Workstation.findOne({_id: id})
    .then(workstation=>{
        if(workstation){
            workstation.group = newGId;
            return workstation.save();
        } else
            return null;
    });
};

workstationSchema.statics.Models = ()=>{
    return [
        mongoose.models.CalTasks,
        mongoose.models.Displays,
        mongoose.models.DisplaysHours,
        mongoose.models.DisplaysPreferences,
        mongoose.models.DisplaysStatuses,
        mongoose.models.Languages,
        mongoose.models.Preferences,
        mongoose.models.QATasks,
        mongoose.models.Regulations,
        mongoose.models.SettingsNames,
        mongoose.models.CalendarCache,
        mongoose.models.History
    ];
};

module.exports = mongoose.model('Workstation', workstationSchema);
