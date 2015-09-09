describe('FeedService', function(){
    beforeEach(module('NewsFeed'));

    var $feedService;

    beforeEach(inject(function(FeedService){
        $feedService = FeedService;
    }));

    describe('FeedService', function(){

        beforeEach(function() {
            var feedConfig = {
                url: 'http://local.altdriver.com',
                remoteUrl: 'http://devaltdriver.wpengine.com',
                basePath: '/wp-json/wp/v2/',
                site: 'altdriver'
            };
            $feedService.enpoints = feedConfig;
        });

        afterEach(function(){

        });

        it('should fetch posts', function(){
            var postPath = 'posts';
            var postParams = '?per_page=10&page=1';
            var posts = $feedService.getPosts(postPath, postParams);
            expect(typeof posts).toBe('object');
            expect(posts.hasOwnProperty('$$state')).toBe(true);
        });

        it('should fetch terms', function(){
            var posts = $feedService.getTerms('category');
            expect(typeof posts).toBe('object');
            expect(posts.hasOwnProperty('$$state')).toBe(true);
        });

        it('should fetch nav items', function(){
            var posts = $feedService.getNavItems();
            expect(typeof posts).toBe('object');
            expect(posts.hasOwnProperty('$$state')).toBe(true);
        });

    });

});