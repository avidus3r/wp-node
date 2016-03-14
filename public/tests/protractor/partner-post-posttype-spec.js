describe('partner post type', function() {

    it('should be accessible from /stories/partner-post/', function() {
        browser.get('http://local.altdriver.com:3000/stories/partner-post/').then(function(){
            var partnerPost = element.all(by.css('.feed-item.partner-post:first-child'));
            var sourceAuthor = element.all(by.css('.feed-item.partner-post:first-child .source-author'));
            var sourcePublication = element.all(by.css('.feed-item.partner-post:first-child .pub-name a'));

            //there should be a partner post
            expect(partnerPost.count()).toBeGreaterThan(0);

            //Source author should have a value
            expect(sourceAuthor.getText() === '').toEqual(false, 'expected source author to have a value');

            partnerPost.getAttribute('data-url').then(function(attr){
                var url = 'http://local.altdriver.com:3000' + attr;
                browser.get(url).then(function(){
                    var pubLink = null;
                    var canonicalHref = null;
                    var canonicalLink = element.all(by.css('link[rel="canonical"]'));

                    //publication source link and canonical link should exist and be the same
                    expect(sourcePublication.count()).toEqual(1, 'expected publication source link to exist');
                    expect(canonicalLink.count()).toBeGreaterThan(0);

                    sourcePublication.getAttribute('href').then(function(attr){
                        pubLink = attr[0];
                        canonicalLink.getAttribute('href').then(function(attr){
                            canonicalHref = attr[0];
                            expect(pubLink).toEqual(canonicalHref, 'expected publication source link and canonical link to be the same');
                        });
                    });
                });
            });

        });
    });

});