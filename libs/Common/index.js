'use strict'

const crypto = require('crypto');

const resolvePreferences = (oldPreferences, newPreferences)=>{
    let result = {};
    for(let prefName in newPreferences){

        let index = oldPreferences.findIndex(pref=>pref.name===prefName);

        if(index === -1)
            oldPreferences.push({name: prefName, value: newPreferences[prefName]});
        else if(oldPreferences[index].isLocked){
            if(oldPreferences[index].value !== newPreferences[prefName]){
                result[prefName] = oldPreferences[index].value;
            }
        } else if(oldPreferences[index].isChanged){
            oldPreferences[index].isChanged = false;

            if(oldPreferences[index].value !== newPreferences[prefName]){
                result[prefName] = oldPreferences[index].value;
            }
        } else {
            oldPreferences[index].value = newPreferences[prefName];
        }
    }

    return result;
};

const createDate = (data)=>{
    //console.log('Create date - ', data);
    let timeStamp = Number(data);
    return (timeStamp != timeStamp) ? new Date(data) : new Date(timeStamp);
};

const getClass = (obj)=>{
    return {}.toString.call(obj).slice(8, -1);
};

const toMD5 = (data)=>{
    return crypto.createHash('md5').update(data).digest("hex");
};

const permissions = {
    PERMISSION_VIEW: 'view',
    PERMISSION_ADMIN: 'admin',
    PERMISSION_WST_VIEW: 'wst_view',
    PERMISSION_WST_ADMIN: 'wst_admin'
};

module.exports = {resolvePreferences, createDate, getClass, toMD5, permissions};
