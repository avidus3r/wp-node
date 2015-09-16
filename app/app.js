'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

var feedConfig = {
    url: 'http://local.altdriver.com',
    remoteUrl: 'http://www.altdriver.com',
    basePath: '/wp-json/wp/v2/',
    site: 'altdriver'
};

//Controllers
var Controllers = require('./app.controllers');

//Directives
var Directives = require('./app.directives');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', 'metatags']);

/*
 * Module Controllers
 */

angular.module('NewsFeed').controller(
    'AppController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.AppController]
);

angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', '$sce', Controllers.FeedSingleController]
);

angular.module('NewsFeed').controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.FeedCategoryController]
);

angular.module('NewsFeed').controller(
    'FeedListController',
    ['$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.FeedListController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */

angular.module('NewsFeed').directive('card', Directives.card);

/*
 * Module Directives
 */


/*
 * Module Configuration
 */

angular.module('NewsFeed').run(function(MetaTags){
    MetaTags.initialize();
});

angular.module('NewsFeed').config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', '$rootScopeProvider', Router]
);

angular.module('NewsFeed').constant('envConfig', feedConfig);

angular.module('NewsFeed').factory(
    'FeedService',
    ['envConfig', '$http', '$q', FeedService]
);

/*
 * Module Configuration
 */


window.onerror = function(){
    console.error(arguments);
};

window.NewsFeed = NewsFeed;