var assert = require('assert');

$browser.get('http://www.altdriver.com').then(function(){
    // Check the upload button
//   return $browser.waitForAndFindElement($driver.By.css('.btn-submit-story')).then(function(element){
//     return element.getText().then(function(text){
//       assert.equal('Upload', text, 'upload text did not match');
//     });
//   });
}).then(function(){
    // Check that the navbar open close is there
    return $browser.findElement($driver.By.css('.navbar-toggle span')).then(function(element){
        return element.getText().then(function(text){
            assert.equal('Toggle navigation', text, 'Navbar Toggle was not visible');
        });
    });
// rework now that submit is in app - PBoggs
// }).then(function(){
//   // Check that the link is correct for upload
//   return $browser.findElement($driver.By.css('.btn-submit-story')).then(function(element){
//     return element.getAttribute('href').then(function(link){
//       assert.equal('http://www.altdriver.com/submit', link
//                    , 'Upload Link was incorrect expected '
//                    + 'http://www.altdriver.com/submit'
//                    + ' got '
//                    + link);
//     });
//  });
});
