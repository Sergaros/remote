var mongoose = require('m_mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({

    message:{
      type: String,
      required: true
    },

    level:{
      type: String,
      required: true
    },

    type: {
        type: String,
    },

    metadata:{
        type: Schema.Types.Mixed
    },

    date:{
      type: Date,
      default: Date.now
    }
}, { capped: 5242880 });

module.exports = mongoose.model('Log', logSchema);
