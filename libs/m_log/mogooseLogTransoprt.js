'use strict'
const util = require('util');
const winston = require('winston');
const mongoose = require('m_mongoose');

const MongooseLogger = winston.transports.MongooseLogger = function (options) {
  this.name = 'mongooseLogger';

  options = options || {};
  this.level = options.level || 'info';

  // initialize static LogModel
  require('./LogModel');
};

util.inherits(MongooseLogger, winston.Transport);

MongooseLogger.prototype.log = function (level, message, metadata, callback) {
  let type='';
  if(Array.isArray(metadata.types)){
      type = metadata.types[0];
  } else if(metadata.type !== undefined){
      type = metadata.type;
  }

  let data = {};
  if(metadata.type) data.type = metadata.type;
  if(metadata.stack) data.stack = metadata.stack;

  const entry = new mongoose.models.Log({
    level: level,
    message: message,
    metadata: data,
    type: type
  });

  entry.save(function(err) {
    return callback(err, true);
});
};

module.exports = MongooseLogger;
