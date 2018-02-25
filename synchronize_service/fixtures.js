require('m_database');
const crypto = require('crypto');
const mongoose = require('m_mongoose');
const Group = mongoose.models.Group;

//crypto.createHash('md5').update(data).digest("hex");


Group.find({}, (err, result)=>{
	if(err)
		throw err;
	if(result.length === 0)	{
        console.log('Default Group Create');
        Group.Create({
            name: 'root',
            sync_login: 'Admin',
            sync_password: crypto.createHash('md5').update('superAdmin777PaSwWWoRd').digest("hex"),
            description: 'This is base group for all other groups.'
        });
    }
})
.then(()=>{
    console.log('fixtures end.');
});
