require('m_database');
const mongoose = require('m_mongoose');
const config = require('config');

//console.log('Default Values - ', config.get('defaultValues'));
const User = mongoose.models.User;

User.find({}, (err, result)=>{
	if(err)
		throw err;
	if(result.length === 0)	{
        let def_values = config.get('defaultValues');
        console.log('Default Values - ', config.get('port'));
    	new User({
                    name: def_values.userName,
                    email: def_values.userEmail,
                    password: def_values.userPassword
                }).save((err, res)=>{
    				if(err)
    					throw err;
    			});
    }
});
