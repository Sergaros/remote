'use strict';

const path = require('path');
const gulp = require('gulp');
const env = require('gulp-env');
const mocha = require('gulp-mocha');
const exec = require('child_process').exec;
const sequence = require('gulp-sequence');
const less = require('gulp-less');

const runCommand = (command)=>{
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      //cb(err);
    });
    cb();
  }
};

gulp.task('less', function () {
  return gulp.src('./gui_service/client/less/style.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./gui_service/client/src/css'));
});

gulp.task('test-bdd-synchronize', function(cb) {

    const envs = env.set({
        NODE_ENV: 'test',
        NODE_PATH: 'libs/;synchronize_service/libs/'
    });

    const tests_path = 'synchronize_service/test/*.js';

    return gulp
        .src(['test/*.js',tests_path], {read: false})
        .pipe(envs)
        .pipe(mocha(cb));
});

gulp.task('test-bdd-gui', function(cb) {

    const envs = env.set({
        NODE_ENV: 'test',
        NODE_PATH: 'libs/;gui_service/libs/'
    });

    const tests_path = 'gui_service/test/*.js';

    return gulp
        .src(['test/*.js',tests_path], {read: false})
        .pipe(envs)
        .pipe(mocha(cb));
});

gulp.task('tests-watcher', function(cb) {
    let watchPaths = [
        '*.js',
        //common libs paths
        'libs/**/*.js',
        'libs/**/**/*.js',
        'test/*.js',

        //synchronize_service paths
        'synchronize_service/*.js',
        'synchronize_service/libs/**/*.js',
        'synchronize_service/libs/**/**/*.js',
        'synchronize_service/test/*.js',
        'synchronize_service/test/**/*.js',

        //gui_services paths
        'gui_service/*.js',
        'gui_service/routes/*.js',
        'gui_service/libs/**/*.js',
        'gui_service/libs/**/**/*.js',
        'gui_service/test/*.js',
        'gui_service/test/**/*.js',

        //gui_services client
        'gui_service/client/src/js/*.js',
        'gui_service/client/src/modules/**/*.js',
        'gui_service/client/src/modules/**/*.html',
        'gui_service/client/test/*.js'
    ];

    let watcher = gulp.watch(watchPaths, function (event) {
            sequence('test-bdd-synchronize', 'test-bdd-gui', 'test:gui_service:client')(function (err) {
            if (err) console.log(err)
        })
    });

    //let watcher = gulp.watch(watchPaths, ['test-bdd-synchronize'/*, 'test-bdd-gui'*/]);
    watcher.on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    return cb();
});

gulp.task('test:gui_service:client', function (done) {
  const karmaServer = require('karma').Server;
  new karmaServer({
        configFile: path.normalize(__dirname +'/gui_service/client/karma.conf.js'),
    }, done).start();
});

gulp.task('mongo', (cb)=>{
    runCommand('mongod --dbpath ./db/')(cb);
});

gulp.task('test', function(cb) {
  sequence('mongo', 'test-bdd-synchronize', 'test-bdd-gui', 'test:gui_service:client', 'tests-watcher', cb);
});

gulp.task('docker_compose_build', (cb)=>{
    runCommand('docker-compose build')(cb);
});

gulp.task('build', function(cb) {
  sequence('less', 'docker_compose_build', cb);
});
