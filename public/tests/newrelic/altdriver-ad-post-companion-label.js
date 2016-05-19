var assert = require('assert');

$browser.get('http://www.altdriver.com/insane-stunts/using-a-jag-and-a-jetpack-to-ski-faster/').then(function(){
    // Check the H1 title matches "Example Domain"
    return $browser.isElementPresent($driver.By.className('ad-post-companion')).then(function(isFound){
        assert.ok(isFound, 'Ad-Post-Companion is Found');
    });
});
