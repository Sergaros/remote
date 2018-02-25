'use strict'

var winston = require('winston');
var MongooseLogger = require('./mogooseLogTransoprt');

//console.log(require.resolve());
//console.log(require.resolve('log'));

const simpleFileTransport = new winston.transports.File({
      filename: 'debug.log',
      level: 'debug',
      json: false, //if json true formatter does not work!
      timestamp: function() {
          var d = new Date();
          return d.toISOString();
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() +' ['+ options.level.toUpperCase() +']\t'+ (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
});

function getLogger(module){

  const filename = module.filename.replace(/\\/g,'/').split('/').slice(-2).join('/');

  const simpleConsoleTransport = new winston.transports.Console({
      colorize: true,
      level: 'debug',//ENV=='development'? 'debug':'error',
      label: filename
    });

  return new winston.Logger({
      transports:[
      simpleConsoleTransport,
      //simpleFileTransport,
      new winston.transports.MongooseLogger({ level: 'info'})
      ]
  });
}

module.exports = getLogger;
