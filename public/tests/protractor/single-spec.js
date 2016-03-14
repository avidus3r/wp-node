describe('single page', function() {

    it('should contain a feed with more than one post', function() {
        browser.get('http://local.altdriver.com:3000');

        var url = element.all(by.css('.feed-item:first-child')).getAttribute('data-url').then(function(attr){
            browser.get('http://local.altdriver.com:3000' + attr);

            //you see a feed with more than one post
            var feedItems = element.all(by.repeater('item in feedItemElements'));
            expect(feedItems.count()).toBeGreaterThan(1);

            //The posts are sorted correctly - not sure the sort


            //The posts per page matches the one defined in config


            //The ad units are in the correct positions


            //you see advertisement divs - the DFP divs (ads do not always populate)


            //on desktop, you see a right rail with 1 ad slot


            //on mobile there is no right rail (mobile triggered by UA String)


            //Each article has an image


            //Each article has a valid link


            //Each WORDPRESS article has a share/action bar


            //Each Share/Action bar has Facebook, Google Plus, Email and Twitter (plus whatsapp and SMS if mobile)


            //Each article has a comments icon


            //Each article has voting (if on)


            //Feed items are not redundant

            
            //scrolling triggers a new page - url change to http://www.altdriver.com/?page=2


            //When the page url updates, the ads update as well
        });


    });

    /*it('should contain Facebook OpenGraph meta properties', function() {
        browser.get('http://local.altdriver.com:3000/');

        var ogTitle     = element.all(by.css('meta[property="og:title"')),
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
        });
    });*/

});