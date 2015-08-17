'use strict';

var gulp    = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    sass    = require('gulp-sass'),
    gutil   = require('gulp-util'),
    clean   = require('gulp-clean'),
    webpack = require('webpack'),
    runSequence = require('run-sequence'),
    plugins = gulpLoadPlugins(),
    LIVERELOAD_PORT = 35729,
    lr;

var paths   = {
    js: ['app/**/*.js'],
    sass: ['assets/**/*.scss'],
    assets:['assets/**/*.*', 'vendors/**/*.*', '!assets/**/*.scss'],
    templates:['app/components/**/*.html']
};


gulp.task('sass', function(){

});

gulp.task('scripts', ['lint', 'webpack']);

gulp.task('webpack', function(callback) {
    webpack({
        context: __dirname,
        entry: {
            index : './app/app.module.js'
        },
        output: {
            path: './dist/js/',
            filename: '[name].js'
        }
    }, function(err, stats){
        if(err) throw new gutil.PluginError('webpack', err);
        if(stats.hasErrors() || stats.hasWarnings()){
            gutil.log('[webpack]', stats.toString({
                colors : true
            }));
        }
        callback();
    });

    gulp.src(paths.templates)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('lint', function() {
    gulp.src(paths.js)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('assets', function() {
    return gulp.src(paths.assets)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function () {
    return gulp.src('./dist', { read: false })
        .pipe(clean());
});

gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
            paths: [ './assets/css/' ]
        }))
        .pipe(gulp.dest('./dist'));
});

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

                setTimeout(function(){ plugins.livereload.reload(); }, 500);
            }
            process.stdout.write(chunk);
        });
        this.stderr.pipe(process.stderr);
    });
});

gulp.task('watch', function () {
    plugins.livereload.listen({interval:500});

    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.assets, ['assets']);
    gulp.watch(paths.templates, ['webpack']);
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('default',['build','devServe','watch']);

gulp.task('build', function(callback) {
    runSequence('clean', 'assets', 'sass', 'scripts',  callback);
});