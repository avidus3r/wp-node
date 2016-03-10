describe('homepage', function() {

    it('should contain Facebook App ID, GTM ID, and Facebook Pixel ID html elements', function() {
        browser.get('http://local.altdriver.com:3000');
        var fbPxID = element.all(by.css('#fb-px-id'));
        var fbAppID = element.all(by.css('#fb-app-id'));
        var gtmID = element.all(by.css('#gtm-id'));

        expect(fbPxID.count()).toEqual(1, 'expected Facebook Pixel ID element to be on page');
        expect(fbAppID.count()).toEqual(1, 'expected Facebook ID element to be on page');
        expect(gtmID.count()).toEqual(1, 'expected GTM ID element to be on page');
    });

    it('should contain Facebook OpenGraph meta properties', function() {
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
    });

    it('should have a functioning carousel', function(){
        browser.get('http://local.altdriver.com:3000');

        var hero = {
                selector: element.all(by.css('.homepage-carousel')),
                minItems: 1
            },
            heroItems = {
                selector: element.all(by.repeater('item in heroItemElements')),
                minItems: 4
            },
            trendinNav = {
                selector: element.all(by.css('.trending-nav a')),
                minItems: 3
            },
            feedItems = {
                selector: element.all(by.css('.feed-item'))
            },
            feedItemsLinks = {
                selector: element.all(by.css('.post-content p')),
                properties:{
                    name: 'href',
                    type: 'string'
                }
            },
            feedItemsImgs = {
                selector: element.all(by.css('.feed-item img.featured-image')),
                properties:{
                    name: 'src',
                    type: 'string'
                }
            };

        //The homepage has a carousel on it
        expect(hero.selector.count()).toEqual(hero.minItems, 'expected the homepage to have a carousel');

        //The homepage carousel works
        expect(heroItems.selector.count()).toEqual(heroItems.minItems, 'expected the carousel to have ' + heroItems.minItems + ' items');


        //Each article/post has an image and a link

        feedItemsImgs.selector.each(function(item){
            item.getAttribute(feedItemsImgs.properties.name).then(function(attr){
                expect(typeof attr).toEqual(feedItemsImgs.properties.type, 'expected feed item image to be ' + feedItemsImgs.properties.type);
            });
        });

        //expect(feedItemsImgs.selector.count()).toEqual(element.all(by.css('.feed-item')).count(), 'each feed item should have an image');

        expect(feedItemsLinks.selector.count() > 0).toEqual(true, 'each feed item should have a link');

        //The homepage has the trending navigation - hottest, latest, best


        //There are 2 ad units on the homepage


        //The copyright is the correct year


        //There is an “AdChoice” image and link in the footer
    });

    it('should have feed items', function() {
        browser.get('http://local.altdriver.com:3000');

        //element(by.model('todoList.todoText')).sendKeys('write first protractor test');
        var feedItems = element.all(by.css('.feed-item'));

        // feed should have at least 1 item
        expect(feedItems.count()).toBeGreaterThan(0);
    });

    it('should have a functioning menu', function() {
        browser.get('http://local.altdriver.com:3000');

        var menuButton = element.all(by.css('.navbar-toggle'));
        var menuButtonClosed = element.all(by.css('.navbar-toggle.collapsed'));
        var menuButtonOpen = element.all(by.css('.navbar-toggle:not(.collapsed)'));
        var menuState = null;

        //nav should be closed
        menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        expect(menuState).toEqual('closed', 'menu was expected to be initially closed');

        // menu button click should open nav
        menuButton.click();
        menuState = menuButtonClosed.count() === 1 ? 'closed' : 'open';
        expect(menuState).toEqual('open', 'menu was closed, button click expected to open menu');

        // opened menu button click should close nav
        menuButton.click();
        menuState = menuButtonOpen.count() === 1 ? 'open' : 'closed';
        expect(menuState).toEqual('closed', 'menu was open, button click expected to close menu');

        var navItems = element.all(by.repeater('item in navItems'));
        // menu should have at least 1 item
        expect(navItems.count()).toBeGreaterThan(0, 'menu was expected to contain more than 0 items');
    });
});