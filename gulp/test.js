var gulp = require('gulp'),
    browserify      = require('gulp-browserify'),
    jasmine         = require('gulp-jasmine'),
    reporters       = require('jasmine-reporters'),
    Server          = require('karma').Server;

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