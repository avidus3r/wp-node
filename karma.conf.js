module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            '*.js',
            '**/!vendor',
            '**/!dist',
            '**/!assets'
        ]
    });
};