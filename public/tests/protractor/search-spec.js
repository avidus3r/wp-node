describe('Upload', function() {

    it('search button should be present', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var menuButton = element(by.css('.navbar-toggle'));
            menuButton.click().then(function() {
                expect(element(by.css('.header-search-txt')).isPresent()).toBe(true);
            });
        });
    });

    it('searching 3 length string should work', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var menuButton = element(by.css('.navbar-toggle'));
            menuButton.click().then(function() {
                element(by.css('.header-search-txt')).sendKeys('incredible');
                element(by.css('#search')).click().then(function() {
                    expect(browser.getCurrentUrl()).toContain('/incredible');
                });
            });
        });
    });

    it('searching 3 length string should work', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var menuButton = element(by.css('.navbar-toggle'));
            menuButton.click().then(function() {
                browser.sleep(2000);
                element(by.css('.header-search-txt')).sendKeys('red');
                element(by.css('#search')).click().then(function() {
                    browser.sleep(2000);
                    expect(browser.getCurrentUrl()).toContain('/red');
                });
            });
        });
    });

    it('searching 3 length string should work', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var menuButton = element(by.css('.navbar-toggle'));
            menuButton.click().then(function() {
                browser.sleep(2000);
                element(by.css('.header-search-txt')).sendKeys('we trippy');
                element(by.css('#search')).click().then(function() {
                    browser.sleep(2000);
                    expect(element(by.css('.no-results')).isPresent()).toBe(true);
                });
            });
        });
    });


});