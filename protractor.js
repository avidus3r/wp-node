exports.config = {
    seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
    specs: [
        'dist/tests/protractor/single-spec.js',
        'dist/tests/protractor/homepage-spec.js',
        'dist/tests/protractor/categories-spec.js',
        'dist/tests/protractor/animated-gif-posttype-spec.js',
        'dist/tests/protractor/partner-post-posttype-spec.js',
        'dist/tests/protractor/GAEvents-spec.js',
        'dist/tests/protractor/upload-spec.js',
        'dist/tests/protractor/search-spec.js'
    ]

};