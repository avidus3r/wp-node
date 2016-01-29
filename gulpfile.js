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

var paths   = {
    root:'app/',
    src:'app/',
    js: ['app/**/*.js', '!tests/**/*.js'],
    sass: ['assets/**/*.scss'],
    assets:['assets/**/*.*', '!assets/**/*.scss'],
    templates: ['app/components/**/*.html'],
    tests: ['tests/spec/**/*.js'],
    config: ['app/config/*.json', 'app/config.json'],
    package:['app/package/**/*.*']
};

gulp.task('scripts', function(){
    return gulp.src('app/app.js')
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
    return gulp.src([
        paths.src + '**/*.js',
        '!' + paths.src + 'third-party/**',
    ])
        .pipe(ngAnnotate())
        .pipe(gulp.dest(paths.root + 'ngAnnotate'));
});

gulp.task('browserify-min', ['ngAnnotate'], function () {
    if(process.env.NODE_ENV === 'development') return;
    return gulp.src('app/ngAnnotate/app.js')
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
    if(!process.env.appname){
        process.env.appname = 'altdriver';

        process.env.mdbname = 'altdriver';
        process.env.mdbhost = 'staging-altdriver-0.altdriver.5600.mongodbdns.com:27000';
        process.env.mdbuser = 'admin';
        process.env.mdbpass = '@ltDr1v3r!';
    }
    var creds = require('./app/config/creds.json');
    process.env.apisecret = JSON.stringify(creds);
    gulp.src(paths.config)
        .pipe(gulp.dest('./dist/appdata/'));

    gulp.src('./app/config/config.json')
        .pipe(gulpNgConfig('NewsFeed.config',{environment:process.env.appname}))
        .pipe(gulp.dest('./app/config'))
});

gulp.task('data', function(){
    gulp.src(paths.config)
        .pipe(gulp.dest('./data/'));
});

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('tests', function(){
    gulp.src('app/app.mock.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('./tests/src'))
});

gulp.task('lint', function() {
    gulp.src(paths.js)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('assets', function() {
    gulp.src(paths.assets)
        .pipe(gulp.dest('./dist/'));

    if(!process.env.appname){
        process.env.appname = 'altdriver';
    }

    var iconsPath = './app/package/favicons/'+process.env.appname;
    try{
        fs.lstatSync(iconsPath).isDirectory()
    }catch(e){
        iconsPath = './app/package/favicons/altmedia';
    };
    /*fs.realpath('./assets/favicons/'+process.env.appname, function(err, resolvedPath) {
        fs.readdir(resolvedPath, function(err, files) {
            if (err) iconsPath = './assets/favicons/altmedia';
        });
    });
    console.log(iconsPath);*/
    gulp.src(iconsPath + '/favicon.ico')
        .pipe(gulp.dest('./dist/'));
    gulp.src(iconsPath + '/*.*')
        .pipe(gulp.dest('./dist/favicons/'));

});

gulp.task('css',['css:min']);

gulp.task('css:min', function() {
    return gulp.src('./dist/css/styles.css')
        .pipe(cssmin())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('css:lint', function(){
    gulp.src('./dist/css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
});

gulp.task('css:sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass({
            paths: [ './assets/css/' ]
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('cleanApp', function () {
    return gulp.src('./app/ngAnnotate/', { read: false })
        .pipe(clean({force:true}));
});

gulp.task('clean', ['cleanApp'], function () {
    return gulp.src('./dist/', { read: false })
        .pipe(clean({force:true}));
});

gulp.task('env:development', function () {
    process.env.NODE_ENV = 'development';
});

gulp.task('env:production', function () {
    process.env.NODE_ENV = 'production';
});

gulp.task('devServe', ['env:development'], function () {

    plugins.nodemon({
        script: 'server.js',
        ext: 'html js',
        env: { 'NODE_ENV': 'development' } ,
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
    gulp.watch(paths.sass, ['css:sass']);
    gulp.watch(paths.tests, ['tests']);
});

gulp.task('default',['build','devServe', 'watch']);

gulp.task('build', function(callback) {
    if(!process.env.NODE_ENV){
        process.env.NODE_ENV = 'development';
    }
    runSequence('clean','config', 'css:sass', 'css:min',  'assets', 'templates', 'data', 'scripts', 'browserify-min', callback);
});
