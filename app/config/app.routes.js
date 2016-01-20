'use strict';

var Router = function($routeProvider, $resourceProvider, $locationProvider, MetaTagsProvider, FeedServiceProvider, InstagramServiceProvider, env, app, appame, $compileProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sms|whatsapp|mailto):/);
    $routeProvider.stripTrailingSlashes = false;
    var appConfig = app;

    var FeedService = FeedServiceProvider.$get();
    var InstagramService = InstagramServiceProvider.$get();

    $routeProvider
        .when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    var feedPath = app.feedPath;
                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    document.title = appConfig.title;

                    /*if(Number(appSponsors) > 0){

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
                    }*/

                    /*if(appame === 'upshift'){
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
                        posts: FeedService._getPosts(7,1,0).then(

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
        .when('/posts/', {
            controller: 'PostsController',
            templateUrl: '/views/list.html'
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
                        posts: FeedService._getCategoryPosts($route.current.params.category,10,1,0).then(
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
                        posts: FeedService.search($route.current.params.query,7,1,0).then(
                            function(data){
                                console.log(data);
                                return data;
                            },
                            function(reason){
                                if(reason === 'end'){
                                    var data = [];
                                    return data;
                                }
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
        .when('/sponsor/:sponsor', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    console.log('app.route sponsor');
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
                        sponsors: FeedService.sponsor($route.current.params.sponsor).then(
                            function(data){

                                return data;
                            },
                            function(error){
                                console.log('error', error);
                                return 'error';
                            },
                            function(notification){

                            }
                        )

                    });
                }
            }
        })
        .when('/sponsor/:sponsor/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    console.log('app.route sponsor');
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
                        sponsors: FeedService.sponsor($route.current.params.sponsor).then(
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

                    /*if(Number(appSponsors) > 0){
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
                        /*post: FeedService.getPosts('posts', '?name=' + params.slug).then(
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
                        ),*/
                        post: FeedService._getPost(params.slug).then(
                            function(data){
                                console.log(data);
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
                        sponsors: sponsorResolve,
                        posts: null
                    });
                }
            }
        })
        .when('/submit',{
            controller: 'PageController',
            templateUrl: '/views/submit.html'
        })
        .when('/thanks',{
            controller: 'PageController',
            templateUrl: '/views/thanks.html'
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
        .when('/subscribe-hub',{
            templateUrl: '/views/subscribe-hub.html',
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