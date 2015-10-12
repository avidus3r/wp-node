var gulp = require('gulp');

gulp.task('env:production', function () {
    process.env.NODE_ENV = 'production';
});