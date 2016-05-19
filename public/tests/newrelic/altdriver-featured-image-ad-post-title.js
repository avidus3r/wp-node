var assert = require('assert');

$browser.get('http://www.altdriver.com/luxury/supercars-abandoned-everywhere-in-dubai/').then(function(){
    // Check the post title
    return $browser.findElement($driver.By.css('.post-title'))
        .then(function(element){
            return element.getText().then(function(text){
                assert.equal('Supercars Abandoned Everywhere in Dubai', text, 'Post title did not match');
            });
        });
}).then(function(){
    // Check the read more text
    return $browser.findElement($driver.By.css('.post-txt-more'))
        .then(function(element){
            return element.getText().then(function(text){
                assert.equal('Read More', text, 'Read More Text not visible');
            });
        });
}).then(function(){
    // Check that single post has a post companion ad div
    return $browser.isElementPresent($driver.By.css('.ad-post-companion'))
        .then(function(isFound){
            assert.ok(isFound,"Post Companion Ad Div Not Found");
        });
}).then(function(){
    // Check that a featured image is present on the next post in feed
    return $browser.isElementPresent($driver.By.css('.featured-image'))
        .then(function(isFound){
            assert.ok(isFound,"Featured Image Not Found");
        });
});

