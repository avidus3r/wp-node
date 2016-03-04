'use strict';

var Router = function($routeProvider, $resourceProvider, $locationProvider, MetaTagsProvider, FeedServiceProvider, InstagramServiceProvider, env, app, appame, $compileProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sms|whatsapp|mailto):/);
    $routeProvider.stripTrailingSlashes = false;
    var appConfig = app;

    var FeedService = FeedServiceProvider.$get();
    var InstagramService = InstagramServiceProvider.$get();



    $routeProvider
        .when('/', {
            controller: 'HomeController',
            templateUrl: '/views/home-hero-demo.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    var feedPath = app.feedPath;
                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    document.title = appConfig.title;

                    if(Number(appSponsors) > 0){

                        sponsorResolve = FeedService.getCampaigns().then(
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        heroItems: FeedService.getHeroPosts(4,1,0).then(

                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            }
                        ),
                        posts: FeedService.getDBPosts(5,1,4).then(

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
        .when('/wp/api/feed/', {
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

                    if(Number(appSponsors) > 0){

                        sponsorResolve = FeedService.getCampaigns().then(
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        posts: FeedService.getPosts('feed','?per_page=10&page=1').then(

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
        .when('/trending/:page', {
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
                    var postsResolve = null;

                    document.title = appConfig.title;

                    if(Number(appSponsors) > 0){

                        sponsorResolve = FeedService.getCampaigns().then(
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

                    postsResolve = FeedService.queryDBPosts($route.current.params.page,5,1,0).then(
                        function(data){
                            return data;
                        },
                        function(error){
                            //location.href = '/trending/latest';
                            return 'error';
                        }
                    );

                    /*if(appame === 'upshift'){
                     instagramResolve = null;
                     }*/
                    return $q.all({
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        posts: postsResolve,
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
        .when('/articles', {
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                            function (data) {
                                return data;
                            },
                            function (error) {

                            },
                            function (notification) {

                            }
                        ),*/
                        config:null,
                        posts: FeedService.getArticles(20,1,0).then(

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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        posts: FeedService.getDBCategoryPosts($route.current.params.category,10,1,0).then(
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
                        categories: null
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        posts: FeedService.getDBCategoryPosts($route.current.params.category,10,1,0).then(
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
                        categories: null
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
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
        .when('/sponsors/:sponsor', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    console.log('app.route sponsor');
                    return $q.all({
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
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
                        sponsorResolve = FeedService._getSponsors().then(
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
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
                        post: FeedService.getDBPost(params.slug).then(
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
        .when('/adtest',{
            templateUrl: '/views/post.html',
            controller: 'FeedListController',
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
                        config:null,
                        posts: null,
                        instagram:null,
                        sponsors: null
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
        .when('/homehero',{
            templateUrl: '/views/home-hero-demo.html',
            controller: 'HomeController',
            redirectTo: false,
            reloadOnSearch: false,
            resolve:{
                data: function($q, $route) {
                    var params = {};
                    var feedPath = app.feedPath;
                    var appSponsors = Number(appConfig.sponsors);
                    var sponsorResolve = null;

                    document.title = appConfig.title;

                    if(Number(appSponsors) > 0){

                        sponsorResolve = FeedService.getCampaigns().then(
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

                    /*if(appame === 'upshift'){
                     instagramResolve = null;
                     }*/
                    return $q.all({
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        heroItems: FeedService.getDBPosts(4,1,0).then(

                            function(data){
                                return data;
                            },
                            function(error){
                                return 'error';
                            }
                        ),
                        posts: FeedService.getDBPosts(5,1,4).then(

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
        .when('/subscribe',{
            templateUrl: '/views/subscribe.html',
            controller: 'PageController'
        })
        .otherwise({
            controller: 'FeedListController',
            templateUrl: '/views/post404.html',
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
                        /*config: FeedService.getData('/appdata/feed.conf.json').then(
                         function (data) {
                         return data;
                         },
                         function (error) {

                         },
                         function (notification) {

                         }
                         ),*/
                        config:null,
                        posts: FeedService.getDBPosts(4,1,0).then(

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
