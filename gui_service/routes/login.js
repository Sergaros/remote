const passport = require('koa-passport');

exports.post = async function(ctx, next) {
return passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'/*,
        failureFlash: true // req.flash, better*/
    })(ctx, next);
};
