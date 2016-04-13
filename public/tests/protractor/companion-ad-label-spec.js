describe('companion-ad-label', function() {

    it('should say Advertisment', function() {
        browser.ignoreSynchronization = false;
        browser.get('http://local.altdriver.com:3000');


        var companionAdLabel = window.getComputedStyle(document.querySelector('companion-ad'),':before').getPropertyValue('content');

        // feed should have at least 1 item
        expect(companionAdLabel ).toBeEqualTo("Advertisement");
    });

});
