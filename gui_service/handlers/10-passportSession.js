const convert = require('koa-convert');

exports.init = app => app.use(convert(require('koa-passport').session()));
