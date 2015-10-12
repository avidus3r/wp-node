'use strict';

var gulp = require('gulp');

var env = process.env.NODE_ENV || 'development';

// read gulp directory contents for the tasks...
require('require-dir')('./gulp');

gulp.task('default', function () {
    // run with paramater
    gulp.start(env);
});