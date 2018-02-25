'use strict';

const gulp = require('gulp');
const exec = require('child_process').exec;
const path = require('path');

const runCommand = (command)=>{
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
};
 
gulp.task('fixtures-linux', runCommand(`NODE_PATH='.:libs/.' node --harmony fixtures.js`));
//gulp.task('fixtures-win', runCommand(`cross-env  NODE_ENV='test' NODE_PATH='.;libs/.' node --harmony fixtures.js`));
gulp.task('start-linux', runCommand(`NODE_PATH='.:libs/.' node --harmony server.js`));

gulp.task('default', ['fixtures-linux', 'start-linux']);

gulp.task('test:client', function (done) {
  var karmaServer = require('karma').Server;
  new karmaServer({
        configFile: path.normalize(__dirname +'/client/karma.conf.js'),
    }, done).start();
});
