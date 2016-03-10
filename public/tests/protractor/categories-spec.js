describe('categories', function() {
    var menuButton = element.all(by.css('.navbar-toggle'));
    var menuButtonClosed = element.all(by.css('.navbar-toggle.collapsed'));
    var menuButtonOpen = element.all(by.css('.navbar-toggle:not(.collapsed)'));
    var menuState = null;
    it('should have feed items', function() {
        browser.ignoreSynchronization = true;
        browser.get('http://local.altdriver.com:3000');

        //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
        var feedItems = element.all(by.css('.feed-item'));

        // feed should have at least 1 item
        expect(feedItems.count()).toBeGreaterThan(0);
    });
    it('should have a functioning menu', function() {
        browser.get('http://local.altdriver.com:3000');

        //nav should be closed
        menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        expect(menuState).toEqual('closed', 'menu was expected to be initially closed');

        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');

        //// opened menu button click should close nav
        //menuButton.click();
        //menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        //expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');

        var navItems = element.all(by.repeater('item in navItems'));
        expect(navItems.count()).toBe (8, 'menu was expected to contain 10 items');
        expect(navItems.count()).toBeGreaterThan(0, 'menu was expected to contain more than 0 items');

        var navTexts = element.all(by.repeater('item in navItems')).map(function (navTexts) {
            return navTexts.getText();
        });


        navTexts.then(function(array) {

            expect(array[0] === 'INSANE STUNTS', 'menu item 0 expected to be INSANE STUNTS');
            element.all(by.repeater('item in navItems')).get(0).element(by.linkText('INSANE STUNTS')).click().then(function () {
                it('should have feed items', function () {
                    browser.get('http://local.altdriver.com:3000/insane-stunts/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                    expect(browser.window.innerHeight).toBeGreaterThan(0);
                    browser.executeScript('window.scrollTo(0,' + browser.window.innerHeight + ');').then(function () {

                    });
                    menuButton.click();
                    menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                    expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
                });
            });
            // menu button click should open nav
            menuButton.click();
            expect(array[1] === 'CRASH & BURN', 'menu item 0 expected to be CRASH & BURN');
            element.all(by.repeater('item in navItems')).get(1).element(by.linkText('CRASH & BURN')).click().then(function () {
                it('should have feed items', function () {
                    browser.get('http://local.altdriver.com:3000/crash-burn/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[2] === 'GAMING', 'menu item 0 expected to be GAMING');
            element.all(by.repeater('item in navItems')).get(2).element(by.linkText('GAMING')).click().then(function() {
                it('should have feed items', function () {
                    browser.get('http://local.altdriver.com:3000/gaming/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                 });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[3] === 'SPORTS CAR', 'menu item 0 expected to be SPORTS CAR');
            element.all(by.repeater('item in navItems')).get(3).element(by.linkText('SPORTS CAR')).click().then(function() {
                it('should have feed items', function() {
                    browser.get('http://local.altdriver.com:3000/gaming/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[4] === 'LUX', 'menu item 0 expected to be LUX');
            element.all(by.repeater('item in navItems')).get(4).element(by.linkText('LUX')).click().then(function() {
                it('should have feed items', function() {
                    browser.get('http://local.altdriver.com:3000/luxury/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[5] === 'MOTORCYCLES', 'menu item 0 expected to be MOTORCYCLES');
            element.all(by.repeater('item in navItems')).get(5).element(by.linkText('MOTORCYCLES')).click().then(function() {
                it('should have feed items', function() {
                    browser.get('http://local.altdriver.com:3000/motorcycles/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[6] === 'CLASSICS', 'menu item 0 expected to be CLASSICS');
            element.all(by.repeater('item in navItems')).get(6).element(by.linkText('CLASSICS')).click().then(function() {
                it('should have feed items', function() {
                    browser.get('http://local.altdriver.com:3000/classics/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
            menuButton.click();
            expect(array[7] === 'OFF ROAD', 'menu item 0 expected to be OFF ROAD');
            element.all(by.repeater('item in navItems')).get(7).element(by.linkText('OFF ROAD')).click().then(function() {
                it('should have feed items', function() {
                    browser.get('http://local.altdriver.com:3000/off-road/');

                    //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
                    var feedItems = element.all(by.css('.feed-item'));

                    // feed should have at least 1 item
                    expect(feedItems.count()).toBeGreaterThan(0);
                });
                menuButton.click();
                menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
                expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');
            });
        });

    });
});

