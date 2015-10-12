'use strict';

var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    sass            = require('gulp-sass'),
    path            = require('path'),
    browserify      = require('gulp-browserify'),
    runSequence     = require('run-sequence'),
    plugins         = gulpLoadPlugins(),
    csslint         = require('gulp-csslint'),
    cssmin          = require('gulp-cssmin');

var env = process.env.NODE_ENV || 'development';

// read gulp directory contents for the tasks...
require('require-dir')('./gulp');

var paths   = {
    js: ['../app/**/*.js', '!tests/**/*.js'],
    sass: ['../assets/**/*.scss'],
    assets:['../assets/**/*.*', '!assets/**/*.scss'],
    templates: ['../app/components/**/*.html'],
    tests: ['../tests/spec/**/*.js'],
    config: ['../app/config/*.json']
};

gulp.task('scripts', ['lint'], function(){
    return gulp.src('/app/app.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('../dist/js'))
});

gulp.task('templates', function(){
    gulp.src(paths.templates)
        .pipe(gulp.dest('../dist/'));
});

gulp.task('config', function(){
    gulp.src(paths.config)
        .pipe(gulp.dest('../dist/appdata/'));
});

gulp.task('data', function(){
    gulp.src(paths.config)
        .pipe(gulp.dest('../data/'));
});

gulp.task('lint', function() {
    gulp.src(paths.js)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('assets', function() {
    return gulp.src(paths.assets)
        .pipe(gulp.dest('../dist/'));
});

gulp.task('css',['css:min']);

gulp.task('css:min', function() {
    return gulp.src('../dist/css/styles.css')
        .pipe(cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('../dist/css'));
});

gulp.task('css:lint', function(){
    gulp.src('../dist/css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
});

gulp.task('css:sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
            paths: [ '../assets/css/' ]
        }))
        .pipe(gulp.dest('../dist'));
});

gulp.task('watch', function () {
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.assets, ['assets']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.config, ['config']);
    gulp.watch(paths.sass, ['css:sass']);
    gulp.watch(paths.tests, ['tests']);
});

gulp.task('build', function(callback) {
    runSequence('clean', 'css:sass', 'css', 'assets', 'templates', 'config', 'data', 'scripts', callback);
});

gulp.task('default', function () {
    // run with paramater
    gulp.start(env);
});