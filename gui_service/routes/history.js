//Users
'use strict'

require('m_database');

const mongoose = require('m_mongoose');
const Hitsory = mongoose.models.History;

const Displays = mongoose.models.Displays;
const DisplaysPreferences = mongoose.models.DisplaysPreferences;

module.exports = (router)=>{
    router.get('/api/history/:workstationId', async function(ctx) {
        let workstationId = ctx.params.workstationId;
        let histories = await Hitsory.find({'workstationId': workstationId});

        let result = await Promise.all(histories.map(async function(hist){
            
            let display = await Displays.getDisplayByIdName(workstationId, hist.displayid);
            let dispPrefs = await DisplaysPreferences.findOne({"workstationId": workstationId});

            let model = dispPrefs.getPreference(display._id, 'Model');
            let serial = dispPrefs.getPreference(display._id, 'SerialNumber');
            let date =  new Date(hist.runtime);

            return {
                taskType: hist.getTypeName(),
                device: `${model} ${serial}`,
                performed: `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()}`,
                result: hist.result===2?'OK':'Failed'
            }
        }));

        ctx.body = result;
    })
};
