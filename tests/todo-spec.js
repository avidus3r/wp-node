describe('homepage', function() {
    it('should have feed items', function() {
        browser.get('http://local.altdriver.com:3000/home');

        //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
        var feedItems = element.all(by.css('.feed-item'));

        // feed should have at least 1 item
        expect(feedItems.count()).toBeGreaterThan(0);
    });
    /*it('should have a functioning menu', function() {
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
        // menu should have at least 1 item
        expect(navItems.count()).toBeGreaterThan(0, 'menu was expected to contain more than 0 items');
    });*/
});