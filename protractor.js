exports.config = {
    seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
<<<<<<< HEAD
    specs: ['dist/tests/protractor/GAEvents-spec.js'/*'dist/tests/protractor/single-spec.js','dist/tests/protractor/homepage-spec.js','dist/tests/protractor/categories-spec.js'*/]
=======

    specs: [
        'dist/tests/protractor/single-spec.js',
        'dist/tests/protractor/homepage-spec.js',
        'dist/tests/protractor/categories-spec.js',
        'dist/tests/protractor/animated-gif-posttype-spec.js',
        'dist/tests/protractor/partner-post-posttype-spec.js'
    ]

>>>>>>> d3e2b680c4c3e5200d13384e6277bb5ba8f160cf
};