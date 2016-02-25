require('.././app.mock');
describe('FeedService', function(){
    var $feedService;
    beforeEach(angular.mock.module('NewsFeed'));

    beforeEach(function(){
        inject(function($injector) {
            $feedService = $injector.get('FeedService');
        })
    });

    it('getPosts should return a promise', function(){
        var postPath = 'posts';
        var postParams = '?per_page=10&page=1';
        var posts = $feedService.getPosts(postPath, postParams);
        expect(typeof posts).toBe('object');
        expect(posts.hasOwnProperty('$$state')).toBe(true);
    });

    it('getTerms should return a promise', function(){
        var categories = $feedService.getTerms('category');
        expect(typeof categories).toBe('object');
        expect(categories.hasOwnProperty('$$state')).toBe(true);
    });

    it('getNavItems should return a promise', function(){
        var navItems = $feedService.getNavItems();
        expect(typeof navItems).toBe('object');
        expect(navItems.hasOwnProperty('$$state')).toBe(true);
    });

});