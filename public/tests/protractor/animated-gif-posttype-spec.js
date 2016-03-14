describe('animated gif post type', function() {

    it('should function as an animated gif', function() {
        browser.get('http://local.altdriver.com:3000/stories/animated-gif/');

        var gifItem = element.all(by.css('.feed-item.animated-gif:first-child'));
        var gifButton = element.all(by.css('.feed-item.animated-gif:first-child .gif-btn'));
        var gifStaticImage = element.all(by.css('.feed-item.animated-gif:first-child .featured-image'));

        expect(gifButton.count()).toEqual(1, 'expected one gif button, found ' + gifButton.count());


        //Initial image state should be jpg
        gifStaticImage.getAttribute('src').then(function(attr){
            var filetype = '.jpg';
            expect(attr).toMatch(filetype, 'expected filetype to be ' + filetype);
        });

        gifButton.click();

        //After click, filetype should be gif
        var gifImage = element.all(by.css('.feed-item.animated-gif:first-child .post-content img'));

        gifImage.getAttribute('src').then(function(attr){
            var filetype = '.gif';
            expect(attr).toMatch(filetype, 'expected filetype to be ' + filetype);
        });


        //feed item should have a single route
        gifItem.getAttribute('data-url').then(function(attr){
            var url = 'http://local.altdriver.com:3000' + attr;
            browser.get(url);
            var gifSingle = element.all(by.css('.feed-item.post-single.format-animated-gif'));
            expect(gifSingle.count()).toEqual(1, 'expected one animated gif single-post element');
        });
    });

});