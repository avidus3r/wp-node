var assert = require('assert');


$browser.addHostnameToWhitelist({hostnameArr: ['netdna-cdn.com']});

$browser.get('http://www.altdriver.com').then(function(){
        return $browser.waitForAndFindElement($driver.By.className('ga-navbar-toggle')).then(function(element){
            return element.click();
        });
    })
    .then(function(){
        console.log('Searching');
        return $browser.waitForAndFindElement($driver.By.className('header-search-txt')).then(function(element){
            element.sendKeys("idiot biker wheelies into cop\n");
        });
    })
    .then(function(){
        console.log('Validate post');
        return $browser.waitForAndFindElement($driver.By.className('feed-item')).then(function(element){
            //console.log($browser);
            $browser.findElement($driver.By.className('ga-btn-share')).then(function(e) {
                e.click();
            });
            //click twitter
            $browser.waitForAndFindElement($driver.By.className('fa-twitter')).then(function(e) {
                e.click();
            });
            //validate twitter opens in new window
            $browser.sleep(5000);
            $browser.getAllWindowHandles().then(function(handles){
                console.log(handles);
                $browser.switchTo().window(handles[1]);
                $browser.getTitle().then(function(title) {
                    console.log(title);
                    //assert.equal(title, "Share a link on Twitter", "Twitter title doesn't match");
                });
            });

        });
    });
