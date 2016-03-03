require('../src/app.mock.js');
describe('RestApiSpec', function() {
    var singlePostID = null;
    var posts = null;
    var post = null;
    var postName = null;

    var feedConfig = {
        remoteUrl: 'http://devaltdriver.wpengine.com',
        basePath: '/wp-json/wp/v2/'
    };

    var endpoint = feedConfig.remoteUrl + feedConfig.basePath;
    var postProperties = ['author','author_meta','category','content','date','excerpt','featured_image_src','link','postmeta','slug','title'];
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

});