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
            resolve: {
                data: function($q, $route) {
                    document.title = appConfig.title;

                    return $q.all({
                        config: null,
                        posts: FeedService.getDBPosts(10,1,0).then(
                            function(data) {
                                return data;
                            },
                            function(error) {
                                return 'error';
                            }
                        ),
                        instagram: null,
                        sponsors: null
                    });
                }
            }
        })
        .when('/wp/api/feed/', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    document.title = appConfig.title;

                    return $q.all({
                        config: null,
                        posts: FeedService.getPosts('feed', '?per_page=10&page=1').then(
                            function(data) {
                                return data;
                            },
                            function(error) {
                                return 'error';
                            }
                        ),
                        instagram: null,
                        sponsors: null
                    });
                }
            }
        })
        .when('/category/:category', {
            controller: 'FeedListController',
            templateUrl: '/views/post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    return $q.all({
                        config: null,
                        posts: FeedService.getDBCategoryPosts($route.current.params.category, 10, 1, 0).then(
                            function(data) {
                                return data;
                            },
                            function(error) {
                                return 'error';
                            },
                            function(notification) {

                            }
                        ),
                        instagram: null,
                        sponsors: null,
                        categories: null
                    });
                }
            }
        })
        .when('/category/:category/', {
            controller: 'CategoryController',
            templateUrl: '/views/category-post.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    var params = {};

                    appConfig.per_page = 10;
                    appConfig.scroll_amount = 10;

                    return $q.all({
                        config: null,
                        posts: null,
                        instagram: null,
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
            resolve: {
                data: function($q, $route) {
                    return $q.all({
                        posts: FeedService.search($route.current.params.query, 5, 1, 0).then(
                            function(data) {
                                console.log(data);
                                return data;
                            },
                            function(reason) {
                                if (reason === 'end') {
                                    var data = [];
                                    return data;
                                }
                                return 'error';
                            },
                            function(notification) {

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
                    params.category = $route.current.params.category;

                    return $q.all({
                        config: null,
                        post: FeedService.getPosts('posts', '?name=' + params.slug).then(
                            function(data) {
                                $route.singleId = data[0].id;
                                var txt = document.createElement('textarea');
                                txt.innerHTML = data[0].title.rendered;
                                document.title = txt.value;
                                localStorage.setItem('singID', $route.singleId);
                                return data;
                            },
                            function(error) {
                                return 'error';
                            },
                            function(notification) {

                            }
                        ),
                        instagram: null,
                        sponsors: null,
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

                    return $q.all({
                        config: FeedSqwervice.getData('/appdata/feed.conf.json').then(
                            function(data) {
                                return data;
                            },
                            function(error) {

                            },
                            function(notification) {

                            }
                        ),
                        //config:null,
                        post: FeedService.getDBPost(params.category, params.slug).then(
                            function(data) {
                                console.log(data);
                                return data;
                            },
                            function(error) {
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
                        instagram: null,
                        sponsor: null,
                        sponsors: null,
                        posts: null
                    });
                }
            }
        })
        .otherwise({
            controller: 'FeedListController',
            templateUrl: '/views/post404.html',
            redirectTo: false,
            reloadOnSearch: false,
            resolve: {
                data: function($q, $route) {
                    document.title = appConfig.title;
                    return $q.all({
                        config: null,
                        posts: FeedService.getDBPosts(4, 1, 0, null).then(

                            function(data) {
                                return data;
                            },
                            function(error) {
                                return 'error';
                            }
                        ),
                        instagram: null,
                        sponsors: null
                    });
                }
            }
        });

    var metatagsDefaults = {
        robots: 'index, follow',
        title: 'Fresh Tracks Daily - A Daily Source of Nutritious Music',
        description: 'A Daily Source of Nutritious Music',
        // Facebook
        fb_title: 'Fresh Tracks Daily (Extra Sharp Cheddar)',
        fb_site_name: 'Fresh Tracks Daily (Extra Sharp Cheddar)',
        fb_url: 'http://www.freshtracksdaily.com/',
        fb_description: 'A Daily Source of Nutritious Music',
        fb_type: 'website',
        fb_image: '',
        // Twitter
        tw_card: '',
        tw_description: '',
        tw_title: '',
        tw_site: '',
        tw_domain: '',
        tw_creator: '',
        tw_image: ''
    };

    MetaTagsProvider
        .when('/', metatagsDefaults) // the meta for the following routes get set by the controller but have defaults provided
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