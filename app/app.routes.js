'use strict';

var Router = function($routeProvider, $locationProvider, MetaTagsProvider, $rootScopeProvider) {
    //$urlRouterProvider.otherwise('/');
    $routeProvider.
        when('/', {
            /*controller: 'FeedListController',*/
            templateUrl: '/views/feedlist.html'
        })
        .when('/:category', {
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
            title: 'alt_driver - Hottest Car Content from Social & the Web',
            description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            fb_title: 'alt_driver - Hottest Car Content from Social & the Web',
            fb_site_name: 'alt_driver',
            fb_url: 'http://www.altdriver.com/',
            fb_description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            fb_type: 'website',
            fb_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png'
        })
        .when('/:category', {
            title: 'Great',
            description: function(category){

                return category;
            },
            fb_title: 'My title',
            fb_site_name: 'My site name',
            fb_url: 'www.blablabla.blabla',
            fb_description: function(category){
                return category;
            },
            fb_type: 'Facebook type',
            fb_image: 'an_image.jpg'
        })
        .when('/:category/:slug', {
            title: 'Great',
            description: function(category, slug){
                return category + ' - ' + slug;
            },
            fb_title: 'My title',
            fb_site_name: 'My site name',
            fb_url: 'www.blablabla.blabla',
            fb_description: function(category, slug){
                return category + ' - ' + slug;
            },
            fb_type: 'Facebook type',
            fb_image: 'an_image.jpg'
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;