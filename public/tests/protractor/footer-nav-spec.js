describe('footer-navigation', function() {
    var contactLink = element(by.css('.ga-nav-footer-about'));
    var vistoragreementLink = element(by.css('.ga-nav-footer-visitor'));
    var privacyLink = element(by.css('.ga-nav-footer-privacy'));

    it('mega-footer should be displayed', function() {
        browser.get('http://local.altdriver.com:3000');
        expect(element.all(by.css('.mega-footer')).isDisplayed()).toBeTruthy();

    });

    //test contact menu link
    it('should navigate to contact view', function() {
        browser.ignoreSynchronization = true;
        contactLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/contact");
        browser.navigate().back();
    });



    //test visitor-agreement menu link
    it('should navigate to visitor-agreement view', function() {
        vistoragreementLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/visitor-agreement");
        browser.navigate().back();
    });



    //test visitor-agreement menu link
    it('should navigate to privacy view', function() {
        privacyLink.click();
        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/privacy-policy");
    });


});