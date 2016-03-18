describe('individual-postcard', function() {

    var commentbutton = element.all(by.css('ga-btn-comments'));
    var feedItems = element.all(by.css('.feed-item'));
    browser.ignoreSynchronization = true;
    browser.get('http://local.altdriver.com:3000/category/insane-stunts/');
    commentbutton.click();
    //Check for Comment Panel to be displayed
    it('Comment Panel should be displayed', function() {
        expect(element.all(by.css('comments')).isDisplayed()).toBeTruthy();

    });
    //ToDo: Deferred
    ////Check for Category Tag button
    //it('should navigate to appropriate category page', function() {
    //    browser.get('http://local.altdriver.com:3000/');
    //    var categorybutton = element.all(by.css('.author-meta')).all(by.css('.item-cat'));
    //    browser.pause;
    //    categorybutton.click().then(function () {
    //        expect(browser.driver.getCurrentUrl()).toEqual("http://local.altdriver.com:3000/category/general/");
    //    });
    //
    //})
});