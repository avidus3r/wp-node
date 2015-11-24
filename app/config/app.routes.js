'use strict';

var Router = function($routeProvider, $resourceProvider, $locationProvider, MetaTagsProvider, FeedServiceProvider, InstagramServiceProvider, env, app, appName, $compileProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sms|whatsapp|mailto):/);
    $routeProvider.stripTrailingSlashes = false;
    var appConfig = app[appName];

    var FeedService = FeedServiceProvider.$get();
    var InstagramService = InstagramServiceProvider.$get();

    $routeProvider
        .when('/posts',{
            controller: 'PostsController',
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
                        posts: FeedService.posts(appConfig.per_page, 1).then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),
                        instagram: null,
                        sponsors: null

                    });
                }
            }
        })
        .when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    var feedPath = app[appName].feedPath;
                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    if(Number(appSponsors) > 0){
                        sponsorResolve = FeedService.getSponsors().then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            },
                            function(notification){

                            }
                        )
                    }

                    /*if(appName === 'upshift'){
                        instagramResolve = null;
                    }*/
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
                        /*posts: FeedService.getPosts(feedPath+'/', '?per_page='+appConfig.per_page+'&page=1').then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            },
                            function(notification){

                            }
                        ),*/
                        posts: FeedService.getDBPosts(appConfig.per_page, 1).then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            }
                        ),
                        /*instagram: InstagramService.get(10,'nofilter').then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        ),*/
                        instagram:null,
                        sponsors: sponsorResolve
                    });
                }
            }
        })
        .when('/category/:category', {
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
                        posts: FeedService.getPosts('posts', '?per_page='+appConfig.per_page+'&page=1&category_name='+$route.current.params.category).then(
                            function (data) {
                                return data;
                            },
                            function (error) {
                                return 'error';
                            },
                            function (notification) {

                            }
                        ),
                        /*instagram: InstagramService.get(10, 'nofilter').then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),*/
                        instagram:null,
                        sponsors: null,
                        categories: function () {
                            return FeedService.getTerms('category').then(
                                function (data) {
                                    return data;
                                },
                                function (error) {

                                },
                                function (notification) {

                                }
                            );
                        }
                    });
                }
            }
        })
        .when('/category/:category/', {
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
                        posts: FeedService.getPosts('posts', '?per_page='+appConfig.per_page+'&page=1&category_name='+$route.current.params.category).then(
                            function (data) {
                                return data;
                            },
                            function (error) {
                                return 'error';
                            },
                            function (notification) {

                            }
                        ),
                        /*instagram: InstagramService.get(10, 'nofilter').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        instagram:null,
                        sponsors: null,
                        categories: function () {
                            return FeedService.getTerms('category').then(
                                function (data) {
                                    return data;
                                },
                                function (error) {

                                },
                                function (notification) {

                                }
                            );
                        }
                    });
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
                                return 'error';
                            },
                            function (notification) {

                            }
                        ),
                        posts: FeedService.search($route.current.params.query,1).then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
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
        .when('/:category/:slug', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    var params = {};
                    params.slug = $route.current.params.slug;

                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    if(Number(appSponsors) > 0){
                        sponsorResolve = FeedService.getSponsors().then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            },
                            function(notification){

                            }
                        )
                    }

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
                        post: FeedService.getPosts('posts', '?name=' + params.slug).then(
                            function (data) {
                                $route.singleId = data[0].id;
                                var txt = document.createElement('textarea');
                                txt.innerHTML = data[0].title.rendered;
                                var pageTitle = txt.value;
                                document.title = pageTitle;
                                localStorage.setItem('singID', $route.singleId);
                                return data;
                            },
                            function (error) {
                                return 'error';
                            },
                            function (notification) {

                            }
                        ),
                        /*instagram: InstagramService.get(10,'nofilter').then(
                         function(data){
                         return data;
                         },
                         function(error){

                         },
                         function(notification){

                         }
                         ),*/
                        instagram:null,
                        sponsors: sponsorResolve,
                        posts: null
                    });
                }
            }
        })
        .when('/:category/:slug/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    var params = {};
                    params.slug = $route.current.params.slug;

                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    if(Number(appSponsors) > 0){
                        sponsorResolve = FeedService.getSponsors().then(
                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            },
                            function(notification){

                            }
                        )
                    }

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
                        post: FeedService.getPosts('posts', '?name=' + params.slug).then(
                            function (data) {
                                $route.singleId = data[0].id;
                                var txt = document.createElement('textarea');
                                txt.innerHTML = data[0].title.rendered;
                                var pageTitle = txt.value;
                                document.title = pageTitle;
                                localStorage.setItem('singID', $route.singleId);
                                return data;
                            },
                            function (error) {
                                return 'error';
                            },
                            function (notification) {

                            }
                        ),
                        /*instagram: InstagramService.get(10,'nofilter').then(
                            function(data){
                                return data;
                            },
                            function(error){

                            },
                            function(notification){

                            }
                        ),*/
                        instagram:null,
                        sponsors: sponsorResolve,
                        posts: null
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
                                return 'error';
                            },
                            function(notification){

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
        .when('/subscribe',{
            templateUrl: '/views/subscribe.html',
            controller: 'PageController'
        })
        .otherwise({
            redirectTo: '/'
        });

    var metatagsDefaults = {
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
    };

    MetaTagsProvider
        .when('/', metatagsDefaults)    // the meta for the following routes get set by the controller but have defaults provided
        .when('/category/:category', metatagsDefaults)
        .when('/search/:query', metatagsDefaults)
        .when('/:category/:slug', metatagsDefaults);

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        hashPrefix: ''
    });
};

module.exports = Router;