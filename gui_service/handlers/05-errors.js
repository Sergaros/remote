const {ErrorHandler} = require('m_errors');
exports.init = app => app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
      ErrorHandler(e, ctx);
  }
});
