'use strict';

const gulp = require('gulp');
const env = require('gulp-env');
const mocha = require('gulp-mocha');
const exec = require('child_process').exec;

const runCommand = (command)=>{
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  }
};

gulp.task('test-bdd', function() {
    const envs = env.set({
        NODE_ENV: 'test',
        NODE_PATH: 'libs/;../libs/'
    });

  return gulp
    .src(['test/*.js'], {read: false})
    .pipe(envs)
    .pipe(mocha())
});

gulp.task('tests-watcher', function() {
    let watchPaths = [
        '*.js',
        'libs/**/*.js',
        'libs/**/**/*.js',
        'test/*.js',
        'test/**/*.js'
    ];

    let watcher = gulp.watch(watchPaths, ['test-bdd']);
    watcher.on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('mongo', runCommand('mongod --dbpath ./db/'));
gulp.task('start-win', runCommand(`cross-env NODE_ENV='test' NODE_PATH='.;libs/.' node --harmony server.js`));
gulp.task('fixtures-linux', runCommand(`NODE_PATH='.:libs/.' node --harmony fixtures.js`));
gulp.task('fixtures-win', runCommand(`cross-env  NODE_ENV='test' NODE_PATH='.;libs/.' node --harmony fixtures.js`));
gulp.task('start-linux', runCommand(`NODE_PATH='.:libs/.' node --harmony server.js`));

gulp.task('default', ['fixtures-linux', 'start-linux']);
gulp.task('test', ['mongo', 'test-bdd', 'tests-watcher']);
