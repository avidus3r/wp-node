var assert = require('assert');

$browser.get('http://www.altdriver.com')
    .then(function(){
        // Click on the upload button.
        return $browser.waitForAndFindElement($driver.By.linkText('Upload')).then(function(element){
            return element.click();
        });
    })
    .then(function(){

        $browser.findElement($driver.By.id('name')).then(function(element){
            return element.sendKeys("new relic");
        });
        $browser.findElement($driver.By.id('email')).then(function(element){
            return element.sendKeys("newrelic@altdriver.com");
        });
        $browser.findElement($driver.By.id('link-url')).then(function(element){
            return element.sendKeys("http://www.altdrivertest.com/test");
        });
        $browser.findElement($driver.By.name('messageContent')).then(function(element){
            return element.sendKeys("Message about video for testing purposes.");
        });


    });

/* Do we need to submit and validate something? */
