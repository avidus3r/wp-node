var assert = require('assert');

$browser.get('http://www.altdriver.com/luxury/supercars-abandoned-everywhere-in-dubai/').then(function(){
    // Check the H1 title matches "Supercars Abandoned Everywhere in Dubai"
    return $browser.waitForAndFindElement($driver.By.css('.post-single h2.post-title')).then(function(element){
        return element.getText().then(function(text){
            assert.equal('Supercars Abandoned Everywhere in Dubai', text, 'Page H1 title did not match');
        });
    });
}).then(function(){
    // Check that the facebook share link matches "http://www.altdriver.com/luxury/supercars-abandoned-everywhere-in-dubai/"
    return $browser.findElement($driver.By.css('.fb-like')).then(function(element){
        return element.getAttribute('data-href').then(function(link){
            assert.equal('http://www.altdriver.com/luxury/supercars-abandoned-everywhere-in-dubai/', link, 'FB share link did not match');
        });
    });
}).then(function(){
    return $browser.waitForAndFindElement($driver.By.css('.app-main')).then(function(element){
        return element.getCssValue('height').then(function(cssValue){
            $browser.executeScript('window.scrollTo(0,' + Math.round(Math.ceil(parseInt(cssValue.replace('px','')))) + ');').then(function() {
                $browser.executeScript('window.scrollTo(0, 10000)').then(function() {
                    $browser.executeScript('window.scrollTo(0, 10000)').then(function() {
                        $browser.findElement($driver.By.id('feed-item-11')).then(function(element){
                            console.log(element);
                            return;
                        });
                    });
                });
            });
        });
    });
});

