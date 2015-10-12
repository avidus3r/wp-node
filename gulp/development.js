'use strict';

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    sass            = require('gulp-sass'),
    path            = require('path'),
    browserify      = require('gulp-browserify'),
    runSequence     = require('run-sequence'),
    plugins         = gulpLoadPlugins(),
    csslint         = require('gulp-csslint'),
    cssmin          = require('gulp-cssmin');


var defaultTasks = ['build', 'devServe', 'watch'];


gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('devServe', ['env:development'], function () {
    plugins.nodemon({
        script: 'server.js',
        ext: 'html js',
        env: { 'NODE_ENV': 'development' } ,
        ignore: ['node_modules/', 'bower_components/', 'logs/', 'packages/*/*/public/assets/lib/', 'packages/*/*/node_modules/', '.DS_Store', '**/.DS_Store', '.bower-*', '**/.bower-*'],
        nodeArgs: ['--debug'],
        stdout: false
    }).on('readable', function() {
        this.stdout.on('data', function(chunk) {
            if(/app listening/.test(chunk)) {

                //setTimeout(function(){ plugins.livereload.reload(); }, 500);
            }
            process.stdout.write(chunk);
        });
        this.stderr.pipe(process.stderr);
    });
});

gulp.task('development', defaultTasks);