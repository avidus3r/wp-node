describe('RestApiSpec', function() {
    var singlePostID = null;
    var posts = null;
    var post = null;
    var postName = null;

    var feedConfig = {
        remoteUrl: 'http://altdriver.altmedia.com',
        basePath: '/wp-json/wp/v2/',
        postsPath: 'posts',
        mediaPath: 'media',
        postTypesPath: 'types',
        customPostTypes: ['animated-gif', 'partner-post', 'altdsc_sponsor', 'altdsc-campaign']
    };

    var endpoint = feedConfig.remoteUrl + feedConfig.basePath;
    var postProperties = {
        id:{
            type:Number
        },
        date:{
            type: Date
        },
        modified:{
            type: Date
        },
        slug:{
            type: String
        },
        type:{
            type: String
        },
        link:{
            type: String
        },
        title:{
            type: String,
            properties: {
                rendered:{
                    type: String
                }
            }
        },
        content:{
            type: Object,
            properties: {
                rendered:{
                    type: String
                }
            }
        },
        excerpt:{
            type: Object,
            properties: {
                rendered:{
                    type: String
                }
            }
        },
        author:{
            type: Number
        },
        featured_image:{
            type: Number
        },
        format:{
            type: String
        },
        votes:{
            type: Object,
            properties:{
                votes_up:{
                    type: String
                },
                votes_down:{
                    type: String
                },
                total_votes:{
                    type: String
                },
                votes_tally:{
                    type: String
                }
            }
        },
        postmeta:{
            type:Object,
            properties:{
                facebook_message:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                oem_safe:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                run_dates:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                run_dates_0_channel:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                run_dates_0_dates:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                explicit:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                },
                explicit_type:{
                    type: Array,
                    items:{
                        type: String
                    },
                    minItems: 1
                }
            }
        },
        category:{
            type: Array,
            items:{
                type: Object,
                properties:{
                    term_id:{
                        type: Number
                    },
                    name:{
                        type: String
                    },
                    slug:{
                        type: Number
                    },
                    taxonomy:{
                        type: String
                    },
                    description:{
                        type: String
                    },
                    parent:{
                        type: Number
                    },
                    count:{
                        type: Number
                    }
                }
            },
            minItems: 1
        },
        author_meta:{
            type: Object
        },
        featured_image_src:{
            type: Object
        }
    };
    var menuProperties = ['url','title'];
    var categoryProperties = ['description','link','name','slug'];

    describe('Main Post Feed', function() {
        var url = endpoint + 'posts?per_page=10';

        beforeEach(function(done){
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function () {
                var result = this.responseText;
                posts = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should get a response', function(){
            expect(typeof posts).toBe('object');
        });

        it('should have 10 posts', function(){
            expect(posts.length).toBe(10);
        });

        it('should have the correct properties', function(){
            var matched = true;
            var post = posts[0];

            for(var prop in postProperties){
                if(!post.hasOwnProperty(postProperties[prop])){
                    matched = false;
                }
            }

            expect(matched).toBe(true);
        });

    });

    describe('Get navigation menu', function() {
        var url = endpoint + 'feed/menu';
        var menu = null;

        beforeEach(function(done){
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function () {
                var result = this.responseText;
                menu = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it("should get a response", function(){
            expect(typeof menu).toBe('object');
        });

        it('should have the correct properties', function(){
            var matched = true;
            var menuItem = menu[0];

            for(var prop in menuProperties){
                if(!menuItem.hasOwnProperty(menuProperties[prop])){
                    matched = false;
                }
            }

            expect(matched).toBe(true);
        });
    });

    describe('Get categories', function() {
        var url = endpoint + 'terms/category?per_page=0';
        var categories = null;

        beforeEach(function(done){
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function () {
                var result = this.responseText;
                categories = JSON.parse(result);
                done();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it("should get a response", function(){
            expect(typeof categories).toBe('object');
        });

        it('should have the correct properties', function(){
            var matched = true;
            var category = categories[0];

            for(var prop in categoryProperties){
                if(!category.hasOwnProperty(categoryProperties[prop])){
                    matched = false;
                }
            }

            expect(matched).toBe(true);
        });
    });

    describe('Single view feed', function() {
        var url = endpoint + 'posts?per_page=1';

        beforeEach(function (done) {
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function () {
                var result = this.responseText;
                post = JSON.parse(result);
                postName = post[0].slug;
                var url = endpoint + 'posts?name=' + postName;
                var oReq = new XMLHttpRequest();
                oReq.addEventListener("load", function () {
                    var result = this.responseText;
                    post = JSON.parse(result);
                    singlePostID = post[0].id;
                    done();
                });
                oReq.open("GET", url, true);
                oReq.send();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it("should get a single post response by slug", function () {
            expect(typeof post).toBe('object');
        });

        it('should have the correct properties', function () {
            var matched = true;

            for (var prop in postProperties) {
                if (!post[0].hasOwnProperty(postProperties[prop])) {
                    matched = false;
                }
            }

            expect(matched).toBe(true);
        });
    });
    describe('Custom Feed by ID', function(){
        var url = endpoint + 'posts?per_page=1';

        beforeEach(function(done){
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function () {
                var result = this.responseText;
                post = JSON.parse(result);
                singlePostID = post[0].id;

                var url = endpoint + 'feed/' + singlePostID + '?per_page=10';

                var oReq = new XMLHttpRequest();
                oReq.addEventListener("load", function () {
                    var result = this.responseText;
                    posts = JSON.parse(result);
                    done();
                });
                oReq.open("GET", url, true);
                oReq.send();
            });
            oReq.open("GET", url, true);
            oReq.send();
        });

        it('should have a response', function(){
            expect(typeof posts).toBe('object');
        });

        it('should have 10 items', function(){
            expect(posts.length).toBe(10);
        });

        it('should have the correct properties', function () {
            var matched = true;

            for (var prop in postProperties) {
                if (!posts[0].hasOwnProperty(postProperties[prop])) {
                    matched = false;
                }
            }
            expect(matched).toBe(true);
        });

        it('should not contain the original post', function () {
            var containsID = false;

            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === singlePostID) {
                    containsID = true;
                }
            }

            expect(containsID).toBe(false);
        });

    });

    describe('/api/sponsor/axle', function(){
        beforeEach(function(done){
            function isEmpty(obj) {
                for(var prop in obj) {
                    if(obj.hasOwnProperty(prop))
                        return false;
                }
                return true && JSON.stringify(obj) === JSON.stringify({});
            }
            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", function(){
                var res = this.responseText;
                var items = JSON.parse(res);
                var sponsor = items[0];
                done();
            });
            oReq.open("GET", "http://local.altdriver.com:3000/sponsor/axle", true);
            oReq.send();
        });
        it('should be properly formatted', function(){
            var pass = sponsor.hasOwnProperty('sponsor') && typeof sponsor.sponsor === 'object' && !isEmpty(sponsor.sponsor);
            expect(pass).toBe(true);
        });

    });

});