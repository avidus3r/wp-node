'use strict';

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    sass            = require('gulp-sass'),
    git             = require('gulp-git'),
    fs              = require('fs'),
    es              = require('event-stream'),
    path            = require('path'),
    knox            = require('knox'),
    gutil           = require('gulp-util'),
    clean           = require('gulp-clean'),
    webpack         = require('webpack'),
    browserify      = require('gulp-browserify'),
    runSequence     = require('run-sequence'),
    pkg             = require('./package.json'),
    plugins         = gulpLoadPlugins(),
    csslint         = require('gulp-csslint'),
    cssmin          = require('gulp-cssmin'),
    LIVERELOAD_PORT = 35729,
    lr;

var paths   = {
    js: ['app/**/*.js'],
    sass: ['assets/**/*.scss'],
    assets:['assets/**/*.*', 'vendors/**/*.*', '!assets/**/*.scss'],
    templates:['app/components/**/*.html'],
    config:['app/config.json']
};

gulp.task('scripts', ['lint'], function(){
    return gulp.src('app/app.js')
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('templates', function(){
    gulp.src(paths.templates)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('config', function(){
    gulp.src(paths.config)
        .pipe(gulp.dest('./dist/'));
});

function publishToS3 (options) {

    var aws = JSON.parse(fs.readFileSync('./aws.json'));

    if(!options.path){
        throw "path is a required option"
    }

    return es.map(function (file, cb) {
        console.log(file);
        var isFile = fs.lstatSync(file.path).isFile();

        if (!isFile) {
            return false;
        }

        var uploadPath = file.path.replace(file.base, '');
        /*uploadPath = "" + path.join(options.path, uploadPath);
        console.log('upload path: ', uploadPath);*/
        // Correct path to use forward slash for windows
        if(path.sep == "\\"){
            uploadPath = uploadPath.replace(/\\/g,"/");
        }

        var client = knox.createClient(aws);
        console.log('client: ', client);
        var headers = {
            'x-amz-acl': 'public-read'
        };

        client.putFile(file.path, uploadPath, headers, function(err, res) {
            if (err || res.statusCode !== 200) {
                console.log("Error Uploading" + res.req.path);
            } else {
                console.log("Uploaded " + res.req.path);
            }
            cb();
        });


        return true;

    });
}

gulp.task('publish',function(){

    gulp.src('./dist/**/*.*', {read: false})
        .pipe(publishToS3({
            path : "/"+pkg.name+"/"
        }));

});

gulp.task('webpack', function(callback) {
    webpack({
        context: __dirname,
        entry: {
            index : './app/app.js'
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

gulp.task('css',['css:min']);

gulp.task('css:min', ['css:sass', 'css:lint'], function() {
    return gulp.src('./dist/css/*.css')
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

gulp.task('clean', function () {
    return gulp.src('./dist', { read: false })
        .pipe(clean());
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

gulp.task('tag', ['bump'], function (cb) {

    var pkg = require('./package.json');
    var v = 'v' + pkg.version;
    var message = '"Release ' + v +'"';

    gulp.src('./')
        .pipe(git.commit(message));

    git.tag(v, message);
    git.push('origin', 'master', {args : '--tags'});

    cb();
});

gulp.task('release', function(callback) {
    runSequence('tag', 'publish',  callback);
});


gulp.task('watch', function () {
    plugins.livereload.listen({interval:500});

    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.assets, ['assets']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.sass, ['css:sass']);
    gulp.watch(paths.config, ['config']);
});

gulp.task('default',['build','devServe','watch']);

gulp.task('build', function(callback) {
    runSequence('clean', 'css', 'assets', 'templates', 'scripts', 'config',  callback);
});