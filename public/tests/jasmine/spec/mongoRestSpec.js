describe('RestApiSpec', function() {
    var singlePostSlug = null;
    var posts = null;
    var post = null;
    var postName = null;



    var endpoint = 'http://localhost:3000/api';

    function isEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true && JSON.stringify(obj) === JSON.stringify({});
    }

    //check sponsers 
    describe('check sponsors', function() {
        var url = endpoint + '/sponsors';

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
            //console.log(sponsors);
            expect(typeof sponsors).toBe('object');
        });

        it('should have more than 1 sponsors', function() {
            expect(sponsors.length).toBeGreaterThan(1);
        });

        // it('should have the correct properties', function() {
        //     propertiesMissing = false;
        //     for (var prop in sponsorsProperties) {
        //         if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
        //             propertiesMissing = true;
        //         }
        //     }
        //     expect(propertiesMissing).toBe(false);
        // });
    });

    //check sponsers 
    describe('check sponsor page', function() {
        var url = endpoint + '/sponsor/alt_driver'

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                sponsor = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            //console.log(sponsor);
            expect(typeof sponsor).toBe('object');
        });

        it('should have more than 1 sponsors', function() {
            expect(sponsors.length).toBeGreaterThan(1);
        });

        // it('should have the correct properties', function() {
        //     propertiesMissing = false;
        //     for (var prop in sponsorsProperties) {
        //         if (!sponsors[0].hasOwnProperty(sponsorsProperties[prop])) {
        //             propertiesMissing = true;
        //         }
        //     }
        //     expect(propertiesMissing).toBe(false);
        // });
    });


    //check campaigns 
    describe('check campaigns response', function() {
        var url = endpoint + '/campaigns';

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
            //console.log(campaigns);
            expect(typeof campaigns).toBe('object');
        });

    });

    //check campaigns 
    describe('check campaigns response', function() {
        var url = endpoint + '/campaigns';

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
            expect(typeof campaigns).toBe('object');
        });

    });

    //check Menu 
    describe('check menu response', function() {
        var url = endpoint + '/menu';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                menuItems = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            console.log(menuItems);
            expect(typeof menuItems).toBe('object');
        });

        it('all items should have title', function() {
            var noTitle = false;
            for (item in menuItems) {
                if (!typeof menuItems[item].title == 'string' && menuItems[item].title.length < 1) {
                    noTitle = true;
                }
            }
            expect(noTitle).toBe(false);
        });

    });

    describe('check search post response', function() {
        var url = endpoint + '/search/fast/10/1/0';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            expect(typeof posts).toBe('object');
        });

        it('should contain be 10 post', function() {
            expect(posts.length).toBe(10);
        });

        it('all post should have title', function() {
            var noTitle = false;
            for (post in posts) {
                if (!typeof posts[post].title.rendered == 'string' && posts[post].title.length < 1) {
                    noTitle = true;
                }
            }
            expect(noTitle).toBe(false);
        });

        it('all post should have a link', function() {
            var noLink = false;
            for (post in posts) {
                if (!typeof posts[post].link == 'string' && posts[post].link.length < 1) {
                    noLink = true;
                }
            }
            expect(noLink).toBe(false);
        });

    });

    describe('check single post response', function() {
        var url = endpoint + '/going-fast-doesnt-mix-with-grass';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                post = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            expect(typeof post).toBe('object');
        });

        it('post should have title', function() {
            var noTitle = false;
            if (!typeof post.title.rendered == 'string' && post.title.length < 1) {
                noTitle = true;
            }
            expect(noTitle).toBe(false);
        });

        it('post should have a link', function() {
            var noLink = false;
            if (!typeof post.link == 'string' && post.link.length < 1) {
                noLink = true;
            }
            expect(noLink).toBe(false);
        });

    });

    describe('check a category response', function() {
        var url = endpoint + '/category/gaming/10/1/0';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            expect(typeof posts).toBe('object');
        });

        it('all post should have title', function() {
            var noTitle = false;
            for (post in posts) {
                if (!typeof posts[post].title.rendered == 'string' && posts[post].title.length < 1) {
                    noTitle = true;
                }
            }
            expect(noTitle).toBe(false);
        });

        it('all post should have a link', function() {
            var noLink = false;
            for (post in posts) {
                if (!typeof posts[post].link == 'string' && posts[post].link.length < 1) {
                    noLink = true;
                }
            }
            expect(noLink).toBe(false);
        });

    });

    describe('check posts response', function() {
        var url = endpoint + '/posts/10/1/0';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
            expect(typeof posts).toBe('object');
        });

        it('all post should have title', function() {
            var noTitle = false;
            for (post in posts) {
                if (!typeof posts[post].title.rendered == 'string' && posts[post].title.length < 1) {
                    noTitle = true;
                }
            }
            expect(noTitle).toBe(false);
        });

        it('all post should have a link', function() {
            var noLink = false;
            for (post in posts) {
                if (!typeof posts[post].link == 'string' && posts[post].link.length < 1) {
                    noLink = true;
                }
            }
            expect(noLink).toBe(false);
        });

    });

    describe('check Heros response', function() {
        var url = endpoint + '/heros/10/1/0';

        beforeEach(function(done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function() {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function() {
        	console.log(posts);
            expect(typeof posts).toBe('object');
        });

        it('all post should have title', function() {
            var noTitle = false;
            for (post in posts) {
                if (!typeof posts[post].title.rendered == 'string' && posts[post].title.length < 1) {
                    noTitle = true;
                }
            }
            expect(noTitle).toBe(false);
        });

        it('all post should have a link', function() {
            var noLink = false;
            for (post in posts) {
                if (!typeof posts[post].link == 'string' && posts[post].link.length < 1) {
                    noLink = true;
                }
            }
            expect(noLink).toBe(false);
        });

    });

});