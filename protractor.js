exports.config = {
    seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
    specs: ['dist/tests/protractor/GAEvents-spec.js'/*'dist/tests/protractor/single-spec.js','dist/tests/protractor/homepage-spec.js','dist/tests/protractor/categories-spec.js'*/]
};