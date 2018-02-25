const mongoose = require('m_mongoose');
const crypto = require('crypto');
const config = require('config');
const {permissions} = require('Common');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    name:{
        type: String,
        unique: true,
        required: true
    },

    PasswordHash:  {
        type: String
    },
    Salt: {
        type: String
    },
    email:{
        type: String,
        required: true//,
        /*validate: [
          {
            validator: function checkEmail(value) {
              return this.deleted ? true : /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(value);
            },
            msg: 'Write please correct email.'
          }
      ]*/
    },

    permissions:{
        type: [String]
    },

    groups_ids: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }]
});

userSchema.virtual('password')
  .set(async function(password) {
        if (password !== undefined) {
            if (password.length < 4) {
                this.invalidate('password', 'Password length must be more than 4 symbols.');
            }
        }

        this._plainPassword = password;
        const cryptoConfig = config.get('crypto');

        if (password) {
            this.Salt = crypto.randomBytes(parseInt(cryptoConfig.hash.length)).toString('base64');
            this.PasswordHash = crypto.pbkdf2Sync(password, this.Salt, parseInt(cryptoConfig.hash.iterations), parseInt(cryptoConfig.hash.length), 'sha1');
        } else {
            // remove password (unable to login w/ password any more, but can use providers)
            this.Salt = undefined;
            this.PasswordHash = undefined;
        }
  })
  .get(function() {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function(password) {
    if (!password) return false;
    if (!this.PasswordHash) return false;

    const cryptoConfig = config.get('crypto');

    return crypto.pbkdf2Sync(password, this.Salt, parseInt(cryptoConfig.hash.iterations), parseInt(cryptoConfig.hash.length), 'sha1') == this.PasswordHash;
};

userSchema.statics.ReplaceGroup = (oldGId, newGId)=>{
    return mongoose.models.User.find({groups_ids: { $in: [oldGId]}})
    .then(users=>{
        return Promise.all(users.map(user=>{
            let index = user.groups_ids.findIndex(id=>id.equals(oldGId));
            if(index !== -1)
                user.groups_ids[index] = newGId;
            return user.save();
        }));
    });
};

userSchema.statics.permissionsList = ()=>{
  return [
      {name: 'View Users/Groups', value: permissions.PERMISSION_VIEW},
      {name: 'Administrate Users/Groups', value: permissions.PERMISSION_ADMIN},
      {name: 'View workstations', value: permissions.PERMISSION_WST_VIEW},
      {name: 'Administrate workstations', value: permissions.PERMISSION_WST_ADMIN}
  ]
};

userSchema.methods.getPermission = function (groupId, permission){
    let index = this.groups_ids.findIndex(grId=>grId.equals(groupId));
    if(index === -1){
        console.log('Error: undefined group id');
        return false;
    }

    let groupPermissions = this.permissions.find(gp=>gp.groupId.equals(groupId));
    if(groupPermissions){
        let pIndex = groupPermissions.permissions.findIndex(perm=>perm===permission);
        if(pIndex === -1)
            return false;
        else
            return true;
    }
    return false;
}

userSchema.methods.setPermission = function (groupId, permission, ch = true){
    let index = this.groups_ids.findIndex(grId=>grId.equals(groupId));
    if(index === -1){
        //console.log('Error: undefined group id');
        return false;
    }

    let groupPermissions = this.permissions.find(gp=>gp.groupId.equals(groupId));

    if(groupPermissions){
        let pIndex = groupPermissions.permissions.findIndex(perm=>perm===permission);
        if(pIndex === -1){
            if(ch)
                groupPermissions.permissions.push(permission);
        } else {
            if(!ch)
                groupPermissions.permissions.splice(pIndex, 1);
            else
                return false;
        }
        return true;
    } else if(ch){
        this.permissions.push({
            groupId: groupId,
            permissions: [permission]
        });

        return true;
    }

    return false;
};

userSchema.methods.getPublicFields = function() {
    let result = { _id: this._id};

    if(this.name) result.name = this.name;
    if(this.email) result.email = this.email;
    if(this.permissions) result.permissions = this.permissions;
    if(this.groups_ids) result.groups_ids = this.groups_ids;

    return result;
};

module.exports = mongoose.model('User', userSchema);
