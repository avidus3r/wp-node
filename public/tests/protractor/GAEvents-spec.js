describe('Google Analytics', function() {

    var featuredImage = null;

    it('menu should have the GA class ga-navbar-toggle', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            expect(element(by.css('.ga-navbar-toggle')).isPresent()).toBe(true);
        });
    });

    it('search buttons should have the GA class ga-btn-search', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            var missingClass = false;
            var searchButtons = element.all(by.css('.btn-search'));
            searchButtons.each(function(item) {
                item.getAttribute('class').then(function(classes) {
                    //console.log(classes);
                    if (classes.split(' ').indexOf('.ga-btn-search') == -1) {
                        missingClass = true;
                    }
                });
            });

            expect(missingClass).toBe(false);
        });
    });

    it('upload should have the GA class ga-btn-submit-story', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            expect(element(by.css('.ga-btn-submit-story')).isPresent()).toBe(true);
        });
    });

    it('there should be a featured image', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            featuredImage = element(by.css('.ga-featured-image'));
            expect(featuredImage.isPresent()).toBe(true);

        });
    });

    it('share should have the GA class ga-btn-share', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            featuredImage.click().then(function() {
                expect(element(by.css('.ga-btn-share')).isPresent()).toBe(true);
            });
        });
    });


    it('6 share options should have indivual GA tags', function() {
        browser.get('http://localhost:3000/trending/latest').then(function() {
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
        });
    });

    it('read more should have class ga-post-more', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            featuredImage.click().then(function() {
                expect(element(by.css('.ga-post-more')).isPresent()).toBe(true);
            });
        });
    });

    it('trending buttons should have indivual GA tags', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            expect(element(by.css('.ga-hottest')).isPresent()).toBe(true);
            expect(element(by.css('.ga-latest')).isPresent()).toBe(true);
            expect(element(by.css('.ga-best')).isPresent()).toBe(true);
        });
    });

    it('trending buttons should have indivual GA tags', function() {
        browser.get('http://local.altdriver.com:3000').then(function() {
            expect(element(by.css('.ga-hottest')).isPresent()).toBe(true);
            expect(element(by.css('.ga-latest')).isPresent()).toBe(true);
            expect(element(by.css('.ga-best')).isPresent()).toBe(true);
        });
    });

    it('trending buttons should have indivual GA tags', function() {
        browser.get('http://local.altdriver.com:3000/gif').then(function() {
            expect(element(by.css('.ga-gifplay')).isPresent()).toBe(true);
        });
    });

    // it('share should have the GA class ga-btn-share', function() {
    //     browser.get('http://local.altdriver.com:3000').then(function() {
    //         featuredImage.click().then(function() {
    //             expect(element(by.css('.ga-btn-share')).isPresent()).toBe(true);
    //         });
    //     });
    // });

});