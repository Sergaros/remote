const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const {OptionStringSchema} = require('./Option.js');

const DisplayPreferencesSchema = new Schema({
    displayId: {
        type: Schema.Types.ObjectId,
        ref: 'Displays',
        require: true
    },

    Preferences:{
        type: [OptionStringSchema]
    }
});

const DisplaysPreferencesSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    PreferencesList:{
        type: [DisplayPreferencesSchema]
    }
});

DisplaysPreferencesSchema.methods.getPreference = function(displayId, valueName) {
    let index = this.PreferencesList.findIndex(pref=>{
        return pref.displayId.equals(displayId)
    });
    if(index === -1) return null;

    let pref = this.PreferencesList[index].Preferences.find(p=>p.name===valueName);

    return pref?pref.value:undefined;
};

DisplaysPreferencesSchema.methods.getPreferences = function(displayId) {
    let index = this.PreferencesList.findIndex(pref=>{
        return pref.displayId.equals(displayId)
    });
    if(index === -1) return null;

    return this.PreferencesList[index].Preferences;
};

module.exports = mongoose.model('DisplaysPreferences', DisplaysPreferencesSchema);
