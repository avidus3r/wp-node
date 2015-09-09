module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        files: [
            '*.js',
            '**/!vendors',
            '**/!dist',
            '**/!assets'
        ]
    });
};