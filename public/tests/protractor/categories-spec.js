describe('categories', function() {
    it('should have feed items', function() {
        browser.get('http://local.altdriver.com:3000/home');

        //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
        var feedItems = element.all(by.css('.feed-item'));

        // feed should have at least 1 item
        expect(feedItems.count()).toBeGreaterThan(0);
    });
    it('should have a functioning menu', function() {
        browser.get('http://local.altdriver.com:3000');

        var menuButton = element.all(by.css('.navbar-toggle'));
        var menuButtonClosed = element.all(by.css('.navbar-toggle.collapsed'));
        var menuButtonOpen = element.all(by.css('.navbar-toggle:not(.collapsed)'));
        var menuState = null;


        //nav should be closed
        menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        expect(menuState).toEqual('closed', 'menu was expected to be initially closed');

        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');

        // opened menu button click should close nav
        menuButton.click();
        menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');

        var navItems = element.all(by.repeater('item in navItems'));
        expect(navItems.count()).toBe (8, 'menu was expected to contain 10 items');
        expect(navItems.count()).toBeGreaterThan(0, 'menu was expected to contain more than 0 items');

        var navTexts = element.all(by.repeater('item in navItems')).map(function (navTexts) {
            return navTexts.getText();
        });
        navTexts.then(function(array) {
            expect(array[0] === 'INSANE STUNTS', 'menu item 0 expected to be INSANE STUNTS');
            navTexts[0].click();
            expect(array[1] === 'CRASH & BURN', 'menu item 0 expected to be CRASH & BURN');
            expect(array[2] === 'GAMING', 'menu item 0 expected to be GAMING');
            expect(array[3] === 'SPORTS CAR', 'menu item 0 expected to be SPORTS CAR');
            expect(array[4] === 'LUX', 'menu item 0 expected to be LUX');
            expect(array[5] === 'MOTORCYCLES', 'menu item 0 expected to be MOTORCYCLES');
            expect(array[6] === 'CLASSICS', 'menu item 0 expected to be CLASSICS');
            expect(array[6] === 'OFF ROAD', 'menu item 0 expected to be OFF ROAD');
            console.log(array);
        });

    });
});

