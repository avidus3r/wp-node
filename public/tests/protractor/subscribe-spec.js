describe('subscribe', function() {
    var menuButton = element.all(by.css('.navbar-toggle'));
    var subscribebutton = element(by.css('a[href^="/subscribe-hub"]'));
    var facebookbutton = element(by.css('a[href^="http://facebook.com/altdriver"]'));
    var instagrambutton = element(by.css('a[href^="https://instagram.com/altdriver"]'));
    var googlebutton = element(by.css('a[href^="https://plus.google.com/+Altdriver/videos"]'));
    var bestrss = element(by.css('a[href^="http://www.altdriver.com/feed/galleryfeed"]'));
    var allrss = element(by.css('a[href^="http://www.altdriver.com/feed/newsfeed"]'));

    //Check Subscribe
    it('should have a functioning Subscribe link', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');

        menuButton.click();
        subscribebutton.click().then(function () {
            var sblink = 'http://local.altdriver.com:3000/subscribe-hub';
                sblinkshort = 'http://local.altdriver.com:3000' + sblink.substr(sblink.length -14);
            expect(subscribebutton.getAttribute('href')).toEqual(sblinkshort);
            expect(facebookbutton.getAttribute('href')).toEqual("http://facebook.com/altdriver");
            expect(instagrambutton.getAttribute('href')).toEqual("https://instagram.com/altdriver/");
            expect(googlebutton.getAttribute('href')).toEqual("https://plus.google.com/+Altdriver/videos");
            expect(element(by.className('email')).isDisplayed()).toBeTruthy();
            expect(bestrss.getAttribute('href')).toEqual('http://www.altdriver.com/feed/galleryfeed');
            expect(allrss.getAttribute('href')).toEqual('http://www.altdriver.com/feed/newsfeed');

        });
    })
});



