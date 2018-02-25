const favicon = require('koa-favicon');
exports.init = app => app.use(favicon('./client/src/images/favicon.ico'));
