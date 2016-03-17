describe('single page', function() {
    var singleURL = null;

    it('each article should have a valid link and image', function(){

        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL).then(function(){
                var feedItems = element.all(by.css('.card-item'));
                var feedItemsCount = feedItems.count();
                var postImages = element.all(by.css('.card-item img.featured-image'));
                var postImagesCount = postImages.count();

                //console.log(postImagesCount);
                //you see a feed with more than one post

                browser.executeAsyncScript(function() {
                    var callback = arguments[arguments.length - 1];
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "/appdata/config.json", true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4) {
                            callback(xhr.responseText);
                        }
                    };
                    xhr.send('');
                }).then(function(str) {
                    var postsPerPage = JSON.parse(str)['altdriver'].app.per_page;
                    expect(feedItemsCount).toBe(parseInt(postsPerPage)+1);
                    expect(postImagesCount).toBe(parseInt(postsPerPage));
                });

                //expect(feedItemsCount).toEqual(postImagesCount, 'expected each article to have a valid link and image');
            });
        });

        /*browser.ignoreSynchronization = true;
        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL);

            var feedItems = element.all(by.css('.card-item'));
            var feedItemsCount = feedItems.count();

            //you see a feed with more than one post
            expect(feedItemsCount).toBeGreaterThan(1);

            //Each article has a valid link and an image
            console.log(postListItemCount);
            console.log(postImagesCount);


        });*/
    });

    /*it('should contain a feed with more than one post', function() {
        browser.ignoreSynchronization = true;
        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL);

            var feedItems = element.all(by.css('.card-item'));
            var feedItemsCount = feedItems.count();

            //you see a feed with more than one post
            expect(feedItemsCount).toBeGreaterThan(1);
        });
    });

    it('each article should have a share/action bar', function(){
        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL);
            var articles = element.all(by.css('.card-item'));
            var articlesCount = articles.count();
            var articlesShareBar = element.all(by.css('.card-item .post-actions'));
            var commentsButtons = element.all(by.css('.card-item .pa-comments'));
            var articlesShareBarCount = articlesShareBar.count();


            //Each WORDPRESS article has a share/action bar
            expect(articlesShareBarCount).toEqual(articlesCount, 'expected each article to have a share/action bar');
        });
    });

    it('each article should have a comment button', function(){
        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL);
            var articles = element.all(by.css('.card-item'));
            var articlesCount = articles.count();
            var commentsButtons = element.all(by.css('.card-item .pa-comments'));

            //Each article has a comments icon
            expect(commentsButtons).toEqual(articlesCount, 'expected each article to have a comment button');
        });
    });

    it('should have og:meta', function(){
        browser.get('http://local.altdriver.com:3000');
        element.all(by.css('.feed-item')).first().getAttribute('data-url').then(function(attr){
            singleURL = 'http://local.altdriver.com:3000' + attr;
            browser.get(singleURL);
            // og meta should be present
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
        });
    });*/

    /*it('should do the rest', function(){

        var articles = element.all(by.css('.card-item'));
        var articlesCount = articles.count();
        var commentsButtons = element.all(by.css('.card-item .pa-comments'));

        browser.executeAsyncScript(function() {
            var callback = arguments[arguments.length - 1];
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/appdata/config.json", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    callback(xhr.responseText);
                }
            };
            xhr.send('');
        }).then(function(str) {
            console.log(JSON.parse(str)['altdriver'].app);
        });

        //The posts are sorted correctly - not sure the sort

        //The posts per page matches the one defined in config

        //The ad units are in the correct positions

        //you see advertisement divs - the DFP divs (ads do not always populate)

        //on desktop, you see a right rail with 1 ad slot

        //on mobile there is no right rail (mobile triggered by UA String)

        //Each Share/Action bar has Facebook, Google Plus, Email and Twitter (plus whatsapp and SMS if mobile)



        //Each article has voting (if on)

        //Feed items are not redundant

        //scrolling triggers a new page - url change to http://www.altdriver.com/?page=2

        //When the page url updates, the ads update as well
    });*/

});