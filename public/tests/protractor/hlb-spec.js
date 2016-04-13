describe('hlb-nav', function() {

    var hottestLink = element(by.css('a[href^="/trending/hottest"]'));
    var latestLink = element(by.css('a[href^="/trending/latest"]'));
    var bestLink = element(by.css('a[href^="/trending/best"]'));

    it('should navigate to Hottest if not enough then Latest view', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');
        // menu button click should open nav
        hottestLink.click();
        var currentUrl  = browser.getCurrentUrl().then(function() {
        }).then(function () {
            expect(currentUrl !== 'http://local.altdriver.com:3000/trending/hottest/'||'http://local.altdriver.com:3000/trending/latest/');
        })
    });

    it('should navigate to Latest view', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');
        // menu button click should open nav
        latestLink.click();
        expect(latestLink.getAttribute('href')).toEqual('http://local.altdriver.com:3000/trending/latest/');
    });

    it('should navigate to Best view', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');
        // menu button click should open nav
        bestLink.click();
        expect(bestLink.getAttribute('href')).toEqual('http://local.altdriver.com:3000/trending/best/');
    });

});