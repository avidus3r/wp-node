describe('navigation', function() {
    var contactLink = element(by.css('a[href^="/contact"]'));
    var privacyLink = element(by.css('a[href^="/privacy-policy"]'));
    var vistoragreementLink = element(by.css('a[href^="/visitor-agreement"]'));
    var altdriverlogo = element(by.css('.navbar-brand'));
    var menuButton = element.all(by.css('.navbar-toggle'));
    var menuButtonClosed = element.all(by.css('.navbar-toggle.collapsed'));
    var menuButtonOpen = element.all(by.css('.navbar-toggle:not(.collapsed)'));
    var menuState = null;


    //test contact menu link
    it('should navigate to contact view', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');
        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');
        expect(contactLink.getAttribute('href')).toEqual('http://local.altdriver.com:3000/contact');
        contactLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/contact");

    });


    it('should navigate to home from contact view', function() {
        //test altdriver logo link
        altdriverlogo.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/");
    });

    //test privacy policy menu link
    it('should navigate to privacy-policy view', function() {
        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');
        expect(privacyLink.getAttribute('href')).toEqual('http://local.altdriver.com:3000/privacy-policy');
        privacyLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/privacy-policy");
    });

    it('should navigate to home from privacy policy view', function() {
        //test altdriver logo link
        altdriverlogo.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/");
    });

    //test visitor agreement menu link
    it('should navigate to visitor-agreement view', function() {
        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');
        expect(vistoragreementLink.getAttribute('href')).toEqual('http://local.altdriver.com:3000/visitor-agreement');
        vistoragreementLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/visitor-agreement");
    });

    it('should navigate to home from visitor agreement view', function() {
        //test altdriver logo link
        altdriverlogo.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/");
    });

});
