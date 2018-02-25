const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const mongoose = require('m_mongoose');
const User = mongoose.models.User;

passport.serializeUser(function(user, done) {
  done(null, user.id); // uses _id as idFieldd
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done); // callback version checks id validity automatically
});

passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password',
    passReqToCallback: true
  },

  function(req, name, password, done) {
    User.findOne({ name: name }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user || !user.checkPassword(password)) {
        return done(null, false, { message: 'User not found or password incorrect.' });
      }

      return done(null, user);
    });
  }
));

module.exports = passport;
