var mongoose = require('m_mongoose');
var Schema = mongoose.Schema;

const {OptionStringSchema} = require('./Option.js');

var preferencesSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    preferences:{
      type: [OptionStringSchema]
    }
});

preferencesSchema.methods.findByName = function(name) {
  return this.preferences.find(pref=>pref.name===name);
};

preferencesSchema.methods.setByName = function(name, value, isLocked=false) {
  let pref = this.preferences.find(pref=>pref.name===name);
  if(pref){
    if(pref.value != value){
        pref.value = value;
        pref.isChanged = true;
    }
    if(pref.isLocked != isLocked){
        pref.isLocked = isLocked
    }
    return true;
  } else
    return false;
};

module.exports = mongoose.model('Preferences', preferencesSchema);
