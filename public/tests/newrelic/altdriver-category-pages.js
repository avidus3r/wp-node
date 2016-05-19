var assert = require('assert');
$browser.addHostnameToWhitelist({hostnameArr: ['netdna-cdn.com']});

$browser.get('http://www.altdriver.com').then(function(){
    return $browser.waitForAndFindElement($driver.By.className("navbar-toggle"), 22000).then(function(element){
        return element.click();
    });
})
.then(function(){
    console.log('Clicking Classics');
    return $browser.waitForAndFindElement($driver.By.linkText("CLASSICS")).then(function(element){
        return element.click();
    });
})
.then(function(){
    console.log('feed items');
    return $browser.findElements($driver.By.className("feed-item")).then(function(elements){
        return assert.equal(true, elements.length > 1, "No featured videos");
    });
});
