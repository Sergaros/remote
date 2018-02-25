var mongoose = require('m_mongoose');
var Schema = mongoose.Schema;

var permissionSchema = new Schema({

  name:{
    type: String,
    unique: true,
    required: true
  },

  permissions: {
      type: [String],
      required: true
  }
});

permissionSchema.methods.PermissionsList = ()=>{
    return {
        PERMISSION_VIEW_ALL: 'view_all',
        PERMISSION_EDIT_ALL: 'edit_all',
        PERMISSION_VIEW_DISPLAYS: 'view_displays',
        PERMISSION_EDIT_DISPLAYS: 'edit_displays',
        PERMISSION_VIEW_USERS: 'view_users',
        PERMISSION_EDIT_USERS: 'edit_users',
        PERMISSION_VIEW_WORKSTATION: 'view_workstation',
        PERMISSION_EDIT_WORKSTATION: 'edit_workstation',
        PERMISSION_VIEW_LOGS: 'view_logs',
        PERMISSION_EDIT_LOGS: 'edit_logs',
        PERMISSION_VIEW_SETTINGS: 'view_settings',
        PERMISSION_EDIT_SETTINGS: 'edit_settings'
    }
};

module.exports = mongoose.model('Permission', permissionSchema);
