describe('RestApiSpec', function() {
    var singlePostID = null;
    var posts = null;
    var post = null;
    var postName = null;

    var feedConfig = {
        remoteUrl: 'http://altdriver.altmedia.com',
        basePath: '/wp-json/wp/v2/'
    };

    var endpoint = feedConfig.remoteUrl + feedConfig.basePath;
    var postProperties = ['author', 'author_meta', 'category', 'content', 'date', 'excerpt', 'featured_image_src', 'link', 'postmeta', 'slug', 'title'];
    var menuProperties = ['url', 'title'];
    var categoryProperties = ['description', 'link', 'name', 'slug'];
    var sponsorsProperties = ['_links', 'author', 'author_meta', 'campaign_active', 'campaign_items', 'category', 'comment_count', 'comment_status', 'date', 'excerpt', 'featured_image', 'featured_image_src', 'format', 'guid', 'modified', 'modified_gmt', 'parent', 'ping_status', 'postmeta', 'slug', 'sponsor', 'sticky', 'title', 'type', 'votes'];
    var campaignProperties = ['_links', 'author', 'author_meta', 'campaign_active', 'campaign_items', 'category', 'comment_count', 'comment_status', 'date', 'excerpt', 'featured_image', 'featured_image_src', 'format', 'guid', 'modified', 'modified_gmt', 'parent', 'ping_status', 'postmeta', 'slug', 'sponsor', 'sticky', 'title', 'type', 'votes'];


    //check sponsers 
    describe('check sponsors', function() {
        var url = endpoint + 'sponsors';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                sponsors = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(sponsors);
            expect(typeof sponsors).toBe('object');
        });

        it('should have more than 1 sponsors', function() {
            expect(sponsors.length).toBe(4);
        });

        it('should have the correct properties', function() {
            propertiesMissing = false;
            for (var prop in sponsorsProperties) {
                if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
                    propertiesMissing = true;
                }
            }
            expect(propertiesMissing).toBe(false);
        });

    });

    //check single sponsers 
    // describe('check sponsors', function() {
    //     var url = endpoint + 'sponsors/axle';

    //     beforeEach(function(done) {
    //         var oReq = new XMLHttpRequest();
    //         oReq.addEventListener("load", function() {
    //             var result = this.responseText;
    //             sponsors = JSON.parse(result);
    //             done();
    //         });
    //         oReq.open("GET", url, true);
    //         oReq.send();
    //     });

    //     it('should get a response', function() {
    //         console.log(sponsors);
    //         expect(typeof sponsors).toBe('object');
    //     });

    //     it('should have more than 1 sponsors', function() {
    //         expect(sponsors.length).toBe(4);
    //     });

    //     it('should have the correct properties', function() {
    //         propertiesMissing = false;
    //         for (var prop in sponsorsProperties) {
    //             if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
    //                 propertiesMissing = true;
    //             }
    //         }
    //         expect(propertiesMissing).toBe(false);
    //     });

    // });

    


    //check campaigns 
    describe('check campaigns', function() {
        var url = endpoint + 'campaigns';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                campaigns = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(campaigns);
            expect(typeof campaigns).toBe('object');
        });

        it('should have more than 1 campaigns', function() {
            expect(campaigns.length).toBe(5);
        });

        it('should have the correct properties', function() {
            propertiesMissing = false;
            for (var prop in campaignsProperties) {
                if (!campaigns[0].hasOwnProperty(campaignsProperties[prop])) {
                    propertiesMissing = true;
                }
            }
            expect(propertiesMissing).toBe(false);
        });

    });

});