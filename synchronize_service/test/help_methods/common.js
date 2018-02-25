let crypto = require('crypto');

exports.randObjId = ()=>{
   var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
   return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
       return (Math.random() * 16 | 0).toString(16);
   }).toLowerCase();
};

exports.toMD5 = (data)=>{
    return crypto.createHash('md5').update(data).digest("hex");
};
