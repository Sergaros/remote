const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const {OptionStringSchema} = require('./Option.js');

const DisplayStatusesSchema = new Schema({
    displayId: {
        type: Schema.Types.ObjectId,
        ref: 'Displays',
        require: true
    },

    Statuses:{
        type: [OptionStringSchema]
    }
});

const DisplaysStatusesSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    StatusesList:{
        type: [DisplayStatusesSchema]
    }
});

DisplaysStatusesSchema.methods.getStatuses = function(displayId) {
    let listIndex = this.StatusesList.findIndex(prefLis=>displayId.equals(displayId));
    if(listIndex === -1) return null;

    return this.StatusesList[listIndex].Statuses;
};

module.exports = mongoose.model('DisplaysStatuses', DisplaysStatusesSchema);
