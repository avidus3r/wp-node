'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');
require('angular-mocks/ngMock');

var env = 'prod';

var feedConfig = {
    'prod': {
        remoteUrl: 'http://www.altdriver.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    },
    'dev':{
        remoteUrl: 'http://devaltdriver.wpengine.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    }
};

//Controllers
var Controllers = require('./controllers/app.controllers.js');

//Directives
var Directives = require('./directives/app.directives.js');

//Services
var FeedService = require('./services/FeedService');
var InstagramService = require('./services/InstagramService');

//Routes
var Router = require('./config/app.routes.js');


//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', 'metatags', 'ngMock']);


/*
 * Module Configuration
 */

angular.module('NewsFeed').run(function(MetaTags){
    MetaTags.initialize();
});

NewsFeed.factory(
    'FeedService',
    ['envConfig', 'env', '$http', '$q', FeedService]
);

NewsFeed.provider('FeedServiceProvider',function(){
    return {
        $get: function(){
            return FeedService;
        }
    }
});

NewsFeed.factory('InstagramService', ['$http', '$q', InstagramService]);

NewsFeed.provider('InstagramServiceProvider',function(){
    return {
        $get: function(){
            return InstagramService;
        }
    }
});

NewsFeed.config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', 'FeedServiceProvider', '$compileProvider', Router]
);

NewsFeed.constant('env', env);
NewsFeed.constant('envConfig', feedConfig);

/*
 * Module Configuration
 */


/*
 * Module Controllers
 */
NewsFeed.controller(
    'HeaderController',
    ['$rootScope', '$scope', 'FeedService', 'envConfig', Controllers.HeaderController]
);

NewsFeed.controller(
    'PageController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', 'envConfig', Controllers.PageController]
);


NewsFeed.controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'envConfig', '$sce', Controllers.FeedSingleController]
);

NewsFeed.controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', 'categories', Controllers.FeedCategoryController]
);

NewsFeed.controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'posts', 'envConfig', Controllers.FeedListController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */

NewsFeed.directive('card', Directives.card);

/*
 * Module Directives
 */

module.exports = NewsFeed;