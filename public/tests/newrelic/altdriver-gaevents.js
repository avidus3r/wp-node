var assert = require('assert');
var missingClass = false;


$browser.get('http://www.altdriver.com').then(function() {

    return $browser.findElement($driver.By.css('.ga-navbar-toggle')).then(function(isFound){
        assert.ok(isFound, 'Navbar Toggle is Found');
    }).then(function(){
        return $browser.findElements($driver.By.css('.btn-search')).then(function(elements) {
            elements.forEach(function(item) {
                    item.getAttribute('class').then(function(classes) {
                        //console.log(classes);
                        if (classes.split(' ').indexOf('.ga-btn-search') == -1) {
                            missingClass = true;
                        }
                    });
                }
            );
            assert.ok(missingClass === false, 'Search Button is Found');
        }).then(function() {
            return $browser.findElement($driver.By.css('.ga-btn-submit-story')).then(function(isFound){
                assert.ok(isFound, 'Upload Button is Found');
            }).then(function() {
                return $browser.findElement($driver.By.css('.ga-featured-image')).then(function(isFound){
                    assert.ok(isFound, 'Featured Image is Found');
                });
            }).then(function() {
                return $browser.findElement($driver.By.css('.ga-featured-image')).then(function(element) {
                    return element.click();
                });
            }).then(function() {
                return $browser.findElement($driver.By.css('.ga-btn-share')).then(function(isFound){
                    assert.ok(isFound, 'Share Button is Found');

                });
            }).then(function() {
                return $browser.get('http://www.altdriver.com/trending/latest').then(function() {
                    return $browser.findElement($driver.By.css('.ga-btn-share')).then(function(element){
                        return element.click();
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-facebook')).then(function(isFound){
                        assert.ok(isFound, 'Facebook share bar is Found');
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-sms')).then(function(isFound){
                        assert.ok(isFound, 'SMS share bar is Found');
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-whatsapp')).then(function(isFound){
                        assert.ok(isFound, 'WhatsApp share bar is Found');
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-gplus')).then(function(isFound){
                        assert.ok(isFound, 'Gplus share bar is Found');
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-twitter')).then(function(isFound){
                        assert.ok(isFound, 'Twitter share bar is Found');
                    });
                }).then(function() {
                    return $browser.findElement($driver.By.css('.ga-sharebar-mail')).then(function(isFound){
                        assert.ok(isFound, 'Mail share bar is Found');
                    });
                });

            });
        });
    });
});
