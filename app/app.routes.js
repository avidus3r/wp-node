'use strict';

var Router = function($routeProvider, $locationProvider, MetaTagsProvider, $rootScopeProvider) {
    //$urlRouterProvider.otherwise('/');
    $routeProvider.
        when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false
        })
        .when('/category/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/post.html',
            redirectTo: false
        })
        .when('/:category/:slug', {
            controller: 'FeedSingleController',
            templateUrl: '/views/post.html',
            redirectTo: false
        })
        .when('/submit',{
            templateUrl: '/views/submit.html'
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
        requireBase: false,
        rewriteLinks: false
    });
};

module.exports = Router;