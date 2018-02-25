const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const LanguageSchema = new Schema({
    id_name:{
        type: String,
        require: true
    },
    name:{
        type: String,
        require: true
    }
});

const LanguageListSchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    languages:{
        type: [LanguageSchema]
    }
});

module.exports = mongoose.model('Languages', LanguageListSchema);
