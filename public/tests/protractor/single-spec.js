describe('single page', function() {
    it('should contain a feed with more than one post', function() {
        browser.get('http://local.altdriver.com:3000/lmao/trying-to-steal-gas-as-a-prank-will-get-you-assaulted/');
        //check share buttons 
        var shareButton = element(by.css('.ga-btn-share'));
        shareButton.click().then(function() {
            var facebookGA = element(by.css('.ga-sharebar-facebook'));
            var smsGA = element(by.css('.ga-sharebar-sms'));
            var whatsappGA = element(by.css('.ga-sharebar-whatsapp'));
            var googleplusGA = element(by.css('.ga-sharebar-gplus'));
            var twitterGA = element(by.css('.ga-sharebar-twitter'));
            var emailGA = element(by.css('.ga-sharebar-mail'));
            expect(facebookGA.isPresent()).toBe(true);
            expect(smsGA.isPresent()).toBe(true);
            expect(whatsappGA.isPresent()).toBe(true);
            expect(googleplusGA.isPresent()).toBe(true);
            expect(twitterGA.isPresent()).toBe(true);
            expect(emailGA.isPresent()).toBe(true);
        });

        var commentButton = element(by.css('.ga-btn-comments'));
        commentButton.click().then(function(){
                    expect(commentButton.isPresent()).toBe(true);
        });
        // var feedItems = element.all(by.repeater('item in feedItemElements'));
        // var feedItemsCount = feedItems.count();
        /*var postListItems = element.all(by.css('.feed-item.pot-list'));
        var postListItemCount = postListItems.count();
        var postImages = element.all(by.css('.feed-item.pot-list a img.featured-image'));
        var postImagesCount = postImages.count();
        var articles = element.all(by.css('.feed-item:not(".ad")'));
        var articlesCount = articles.count();
        var articlesShareBar = element.all(by.css('.feed-item:not(".ad") .post-actions'));
        var articlesShareBarCount = articlesShareBar.count();*/


        //you see a feed with more than one post
        // expect(feedItemsCount).toBeGreaterThan(1);


        // og meta should be present
        /*var ogTitle     = element.all(by.css('meta[property="og:title"')),
            ogImage     = element.all(by.css('meta[property="og:image"')),
            ogDesc      = element.all(by.css('meta[property="og:description"')),
            ogSiteName  = element.all(by.css('meta[property="og:site_name"')),
            ogFBAppID   = element.all(by.css('meta[property="fb:app_id"'));

        var ogMetaTags = [ogTitle, ogImage, ogDesc, ogSiteName, ogFBAppID];

        ogMetaTags.forEach(function(el){
            el.getAttribute('property').then(function(attr){
                var ogProperty = attr;
                expect(el.count()).toEqual(1, 'expected page to have ' + ogProperty + ' meta property');

                el.getAttribute('content').then(function(attr){
                    var ogContent = attr;
                    expect(ogContent.length > 0).toEqual(true, 'expected ' + ogProperty + ' to not be empty');
                });
            });
        });*/


        //The posts are sorted correctly - not sure the sort


        //The posts per page matches the one defined in config


        //The ad units are in the correct positions


        //you see advertisement divs - the DFP divs (ads do not always populate)


        //on desktop, you see a right rail with 1 ad slot


        //on mobile there is no right rail (mobile triggered by UA String)


        //Each article has a valid link and an image
        //expect(postListItemCount).toEqual(postImagesCount, 'expected each article to have a valid link and image');

        //Each WORDPRESS article has a share/action bar
        //expect(articlesShareBarCount).toEqual(articlesCount, 'expected each article to have a share/action bar');

        //Each Share/Action bar has Facebook, Google Plus, Email and Twitter (plus whatsapp and SMS if mobile)


        //Each article has a comments icon


        //Each article has voting (if on)


        //Feed items are not redundant


        //scrolling triggers a new page - url change to http://www.altdriver.com/?page=2


        //When the page url updates, the ads update as well

    });

});