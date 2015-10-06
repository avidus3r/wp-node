'use strict';

var Router = function($routeProvider, $locationProvider, MetaTagsProvider, FeedServiceProvider, InstagramServiceProvider, env, $compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sms|whatsapp|mailto):/);
    var FeedService = FeedServiceProvider.$get();
    var InstagramService = InstagramServiceProvider.$get();

    $routeProvider.
        when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    return $q.all({
                        config: FeedService.getData('/appdata/feed.conf.json').then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),
                        posts: FeedService.getPostData('dev',12,1).then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        ),
                        instagram: InstagramService.get(1,'nofilter').then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        ),
                        sponsors: FeedService.getCampaigns('campaigns','').then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        )

                    });
                }
            }
        })
        /*.when('/page/:pageNumber', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: true,
            reloadOnSearch: false,
            resolve:{
                posts: function($route){
                    var page = $route.current.params.pageNumber;
                    return FeedService.getPosts('feed','?per_page=25&page='+page).then(
                        function(data){
                            return data;
                        },
                        function(error){

                        },
                        function(notification){

                        }
                    );
                }
            }
        })*/
        .when('/category/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            resolve:{
                categories: function(){
                    return FeedService.getTerms('category').then(
                        function(data){
                            return data;
                        },
                        function(error){

                        },
                        function(notification){

                        }
                    );
                }
            }
        })
        .when('/search/:query', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};

                    return $q.all({
                        config: FeedService.getData('/appdata/feed.conf.json').then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),
                        posts: FeedService.search($route.current.params.query).then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        ),
                        instagram: null,
                        sponsors: null
                    });
                }
            }
        })
        .when('/sponsor/:sponsor', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};

                    return $q.all({
                        config: FeedService.getData('/appdata/feed.conf.json').then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),
                        posts: null,
                        instagram: null,
                        sponsors: FeedService.getSponsor($route.current.params.sponsor).then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        )

                    });
                }
            }
        })
        .when('/:category/:slug', {
            controller: 'FeedSingleController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            resolve: {
                data: function($q, $route) {
                    var params = {};
                    //if(window.location.pathname.lastIndexOf('/page/') >-1) return false;
                    params.slug = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1, window.location.pathname.length);
                    var offset = '';
                    if(localStorage.getItem('post_offset')) offset = '&offset=' + localStorage.getItem('post_offset');
                    return $q.all({
                        post: FeedService.getPosts('posts', '?name=' + params.slug).then(
                            function (data) {
                                console.log(data);
                                $route.singleId = data[0].id;
                                localStorage.setItem('singID', $route.singleId);
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),
                        posts:FeedService.getPosts('feed', '?per_page=25&page=1&post__not_in=' + localStorage.getItem('singID')+offset).then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        )
                    });
                }
            }
        })
        .when('/submit',{
            controller: 'PageController',
            templateUrl: '/views/submit.html'
        })
        .when('/visitor-agreement',{
            templateUrl: '/views/static-page.html',
            controller: 'PageController'
        })
        .when('/privacy-policy',{
            templateUrl: '/views/static-page.html',
            controller: 'PageController'
        })
        .when('/contact',{
            templateUrl: '/views/static-page.html',
            controller: 'PageController'
        })
        .when('/about',{
            templateUrl: '/views/static-page.html',
            controller: 'PageController'
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
        .when('/search/:query', {
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
        hashPrefix: ''
    });
};

module.exports = Router;