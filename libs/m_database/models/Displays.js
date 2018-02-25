'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const displaySchema = new Schema({
    id_name:{
        type: String,
        required: true
    },

    serial:{
        type: String,
        required: true
    },

    width:{
        type: Number,
        required: true
    },

    height:{
        type: Number,
        required: true
    },

    commode:{
        type: Number,
        required: true
    },

    isactive:{
        type: Boolean,
        required: true
    }
});

const displaysListSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    displays: {
        type: [displaySchema],
        require: true
    }

});

displaysListSchema.statics.getDisplayByIdName = function (workstationId, idname){
    return this.findOne({workstationId: workstationId})
    .then(disps=>{
        return disps.displays.find(disp=>disp.id_name==idname);
    })
    .then(disp=>{
        //console.log('getDisplayByIdName - ', disp);
        return disp?disp:null;
    });
};

displaysListSchema.statics.getDisplayIdByIdName = function (workstationId, idname){
    return this.findOne({workstationId: workstationId})
    .then(disps=>{
        return disps.displays.find(disp=>disp.id_name===idname);
    })
    .then(disp=>{
        if(disp)
            return disp._id;
        else
            return null;
    });
};

displaysListSchema.statics.getDisplayIdNameById = function (workstationId, id){
    return this.findOne({workstationId: workstationId})
    .then(disps=>{
        return disps.displays.find(disp=>disp._id.equals(id));
    })
    .then(disp=>{
        if(disp)
            return disp.id_name;
        else
            return undefined;
    });
}

module.exports = mongoose.model('Displays', displaysListSchema);
