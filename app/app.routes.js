'use strict';

var Router = function($routeProvider, $locationProvider, MetaTagsProvider, $rootScopeProvider) {
    //$urlRouterProvider.otherwise('/');
    $routeProvider.
        when('/', {
            /*controller: 'FeedListController',*/
            templateUrl: '/views/feedlist.html'
        })
        .when('/category/:category', {
            /*controller: 'FeedCategoryController',*/
            templateUrl: '/views/category.html'
        })
        .when('/:category/:slug', {
            /*controller: 'FeedSingleController',*/
            templateUrl: '/views/single.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    MetaTagsProvider
        .when('/', {
            robots: 'index, follow',
            title: 'alt_driver - Hottest Car Content from Social & the Web',
            description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            // Facebook
            fb_title: 'alt_driver - Hottest Car Content from Social & the Web',
            fb_site_name: 'alt_driver',
            fb_url: 'http://www.altdriver.com/',
            fb_description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            fb_type: 'website',
            fb_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png',
            // Twitter
            tw_card: 'summary_large_image',
            tw_description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            tw_title: 'alt_driver - Hottest Car Content from Social &amp; the Web',
            tw_site: '@altdriver',
            tw_domain: 'alt_driver',
            tw_creator: '@altdriver',
            tw_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png'
        })
        // the following views' meta get set in their controller
        .when('/category/:category', {
            robots: 'index, follow',
            title: function(){
                return window.NewsFeed.metatags.title;
            },
            description: function(){
                return window.NewsFeed.metatags.description;
            },
            // Facebook
            fb_title: function(){
                return window.NewsFeed.metatags.fb_title;
            },
            fb_site_name: 'alt_driver',
            fb_url: function(){
                return window.NewsFeed.metatags.fb_url;
            },
            fb_description: function(){
                return window.NewsFeed.metatags.fb_description;
            },
            fb_type: function(){
                return window.NewsFeed.metatags.fb_type;
            },
            fb_image: function(){
                return window.NewsFeed.metatags.fb_image;
            },
            // Twitter
            tw_card: '',
            tw_description: '',
            tw_title: '',
            tw_site: '@altdriver',
            tw_domain: 'alt_driver',
            tw_creator: '@altdriver',
            tw_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png'
        })
        .when('/:category/:slug', {
            robots: 'index, follow',
            title: function(){
                return window.NewsFeed.metatags.title;
            },
            description: function(){
                return window.NewsFeed.metatags.description;
            },
            // Facebook
            fb_title: function(){
                return window.NewsFeed.metatags.fb_title;
            },
            fb_site_name: 'alt_driver',
            fb_url: function(){
                return window.NewsFeed.metatags.fb_url;
            },
            fb_description: function(){
                return window.NewsFeed.metatags.fb_description;
            },
            fb_type: function(){
                return window.NewsFeed.metatags.fb_type;
            },
            fb_image: function(){
                return window.NewsFeed.metatags.fb_image;
            },
            // Twitter
            tw_card: '',
            tw_description: '',
            tw_title: '',
            tw_site: '@altdriver',
            tw_domain: 'alt_driver',
            tw_creator: '@altdriver',
            tw_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;