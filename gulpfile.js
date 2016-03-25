'use strict';

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    sass            = require('gulp-sass'),
    /*git             = require('gulp-git'),*/
    fs              = require('fs'),
    //es              = require('event-stream'),
    path            = require('path'),
    clean           = require('gulp-clean'),
    browserify      = require('gulp-browserify'),
    runSequence     = require('run-sequence'),
    //pkg             = require('./package.json'),
    plugins         = gulpLoadPlugins(),
    csslint         = require('gulp-csslint'),
    cssmin          = require('gulp-cssmin'),
    jasmine         = require('gulp-jasmine'),
    //reporters       = require('jasmine-reporters'),
    Server          = require('karma').Server,
    gulpNgConfig    = require('gulp-ng-config'),
    uglify          = require('gulp-uglify'),
    ngAnnotate      = require('gulp-ng-annotate'),
    streamify       = require('gulp-streamify');
    //gifyParse      = require('gify-parse')

var paths   = {
    root:'public/',
    src:'public/',
    js: ['public/**/*.js', '!tests/**/*.js'],
    sass: ['public/assets/**/*.scss'],
    assets:['public/assets/**/*.*', '!public/assets/**/*.scss'],
    templates: ['public/components/**/*.html'],
    tests: ['public/tests/**/*.*'],
    config: ['public/config/*.json'],
    package:['public/package/**/*.*']
};

gulp.task('scripts', function(){
    return gulp.src('public/app.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('compress', function() {
    return gulp.src('dist/js/app.js')
        .pipe(uglify({mangle:false}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('ngAnnotate', function () {
    if(process.env.NODE_ENV === 'local') return;
    return gulp.src([
        paths.src + '**/*.js',
        '!' + paths.src + 'third-party/**',
    ])
        .pipe(ngAnnotate())
        .pipe(gulp.dest(paths.root + 'ngAnnotate'));
});

gulp.task('browserify-min', ['ngAnnotate'], function () {
    if(process.env.NODE_ENV === 'local') return;
    return gulp.src('public/ngAnnotate/app.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(streamify(uglify({mangle: false})))
        .pipe(gulp.dest(('dist/js')));
});

gulp.task('templates', function(){
    gulp.src(paths.templates)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('config', function(){
    var creds = require('./public/config/creds.json');
    process.env.apisecret = JSON.stringify(creds);
    gulp.src(paths.config)
        .pipe(gulp.dest('./dist/appdata/'));

    return gulp.src('./public/config/config.json')
        .pipe(gulpNgConfig('NewsFeed.config',{environment:process.env.appname}))
        .pipe(gulp.dest('./public/config'))
});

gulp.task('data', function(){
    return gulp.src(paths.config)
        .pipe(gulp.dest('./data/'));
});

/*
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
*/

gulp.task('test', function(){
    gulp.src(paths.tests)
        .pipe(gulp.dest('./dist/tests/'));

    return gulp.src('./public/tests/jasmine/spec/**/*Spec.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('./dist/tests/jasmine/src/'));
});

gulp.task('lint', function() {
    return gulp.src(paths.js)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('assets', function() {
    gulp.src(paths.assets)
        .pipe(gulp.dest('./dist/'));

    if(!process.env.appname){
        process.env.appname = 'driversenvy';
    }

    var iconsPath = './public/package/favicons/'+process.env.appname;
    try{
        fs.lstatSync(iconsPath).isDirectory()
    }catch(e){
        iconsPath = './public/package/favicons/altmedia';
    }

    /*fs.realpath('./assets/favicons/'+process.env.appname, function(err, resolvedPath) {
        fs.readdir(resolvedPath, function(err, files) {
            if (err) iconsPath = './assets/favicons/altmedia';
        });
    });
    console.log(iconsPath);*/
    gulp.src(iconsPath + '/favicon.ico')
        .pipe(gulp.dest('./dist/'));
    return gulp.src(iconsPath + '/*.*')
        .pipe(gulp.dest('./dist/favicons/'));

});

gulp.task('css',['css:min']);

gulp.task('css:min', ['css:sass'], function() {
    return gulp.src('./dist/css/styles.css')
        .pipe(cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('css:lint', function(){
    return gulp.src('./dist/css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
});

gulp.task('css:sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
            paths: [ './public/assets/css/' ]
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('cleanApp', function () {
    if(process.env.NODE_ENV === 'local') return;
    return gulp.src('./public/ngAnnotate/', { read: false })
        .pipe(clean({force:true}));
});

gulp.task('clean', ['cleanApp'], function () {
    return gulp.src('./dist/', { read: false })
        .pipe(clean({force:true}));
});

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'local';
});

gulp.task('env:production', function () {
    process.env.NODE_ENV = 'production';
});

gulp.task('devServe', ['env:development'], function () {
    process.env.NODE_ENV = 'local';
    var currPath = __dirname.split('/');
    var appName = currPath[currPath.length-1];
    process.env.appname = appName;
    process.env.mdbname = appName;
    //local
    //process.env.mdbhost = 'localhost:27017';
    //staging
    process.env.mdbhost = 'staging-altdriver-0.altdriver.5600.mongodbdns.com:27000';
    //prod
    //process.env.mdbhost = 'altdriver-0.altdriver.5600.mongodbdns.com:27000';

    process.env.mdbuser = 'admin';
    process.env.mdbpass = appName === 'driversenvy' ? '_@ltM3d1@_' : '@ltDr1v3r!';
    plugins.nodemon({
        script: 'server.js',
        ext: 'html js',
        env: { 'NODE_ENV': 'local' } ,
        ignore: ['node_modules/', 'dist', 'bower_components/', 'logs/', 'packages/*/*/public/assets/lib/', 'packages/*/*/node_modules/', '.DS_Store', '**/.DS_Store', '.bower-*', '**/.bower-*'],
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

gulp.task('watch', function () {
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.assets, ['assets']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.config, ['config']);
    gulp.watch(paths.sass, ['css:min']);
    gulp.watch(paths.tests, ['test']);
});

gulp.task('default',['build', 'devServe', 'watch']);

gulp.task('build', function(callback) {
    if(!process.env.NODE_ENV){
        process.env.NODE_ENV = 'local';
        var currPath = __dirname.split('/');
        var appName = currPath[currPath.length-1];
        process.env.appname = appName;
        process.env.mdbname = appName;
        //local
        //process.env.mdbhost = 'localhost:27017';
        //staging
        process.env.mdbhost = 'staging-altdriver-0.altdriver.5600.mongodbdns.com:27000';
        //prod
        //process.env.mdbhost = 'altdriver-0.altdriver.5600.mongodbdns.com:27000';

        process.env.mdbuser = 'admin';
        process.env.mdbpass = appName === 'driversenvy' ? '_@ltM3d1@_' : '@ltDr1v3r!';
    }
    runSequence('clean','config', 'css:min', 'assets', 'templates', 'scripts', 'test', 'browserify-min', callback);
});
