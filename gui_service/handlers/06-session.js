const session = require('koa-generic-session');
const convert = require('koa-convert');
const MongooseStore = require('koa-session-mongoose');
const mongoose = require('m_mongoose');

exports.init = app => app.use(convert(session({
  store: new MongooseStore({
      collection: 'koaSessions',
      connection: mongoose.connection,
      expires: 60 * 60 * 24 * 14, // 2 weeks is the default
      model: 'KoaSession'
  })
})));
//exports.init = app => app.use(convert(session()));
