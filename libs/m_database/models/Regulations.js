const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const ClassificationSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    id_name:{
        type: String,
        required: true
    }
});

const RegulationSchema = new Schema({
    name:{
        type: String,
        required: true
    },

    id_name:{
        type: String,
        required: true
    },

    classifications:{
        type: [ClassificationSchema]
    }
});

const RegulationListSchema = new Schema({

    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    regulations:{
        type: [RegulationSchema]
    }
});

module.exports = mongoose.model('Regulations', RegulationListSchema);
