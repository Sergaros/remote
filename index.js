require('m_database');
const crypto = require('crypto');
const mongoose = require('m_mongoose');
const config = require('config');
const axios = require('axios');

const {permissions} = require('Common');

const Group = mongoose.models.Group;
const User = mongoose.models.User;
const AppCommonSettings = mongoose.models.AppCommonSettings;

console.log('Start fixtures tasks.');
console.log('Create default groups.');

let rootGroupId;
Group.find({})
.then(result=>{
	if(result.length === 0)	{
        console.log('Create default groups');
        return Group.Create({
            name: 'root',
            sync_login: 'Admin',
            sync_password: crypto.createHash('md5').update('superAdmin777PaSwWWoRd').digest("hex"),
            description: 'This is base group for all other groups.'
        })
		.then(group=>{
			rootGroupId = group._id;
		});
    }
})
.then(()=>{
    console.log('Create default users.');
    return User.find({});
})
.then(users=>{
    if(users.length === 0)	{
        let def_values = config.get('defaultValues');
    	new User({
                    name: def_values.userName,
                    email: def_values.userEmail,
                    password: def_values.userPassword,
					groups_ids: [rootGroupId],
					permissions: [
						permissions.PERMISSION_VIEW,
					    permissions.PERMISSION_ADMIN,
					    permissions.PERMISSION_WST_VIEW,
					    permissions.PERMISSION_WST_ADMIN
					]
                }).save((err, res)=>{
    				if(err)
    					throw err;
    			});
    }
})
.then(()=>{
	console.log('Config email service');
	return AppCommonSettings.findOne({name: 'mailconfig'})
	.then(mailconfig=>{
		if(mailconfig){
			if(mailconfig.data)
				return axios.post('http://mail:5503/config', mailconfig.data);
		} else
			return AppCommonSettings.create({name: 'mailconfig', data: {}});
	})
})
.catch(err=>{
    console.log('Fixtures servece Error: ', err);
    throw err;
});
