'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

//Controllers
var Controllers = require('./app.controllers');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', require('angular-ui-router'), 'metatags']);

angular.module('NewsFeed').run(function(MetaTags){
    MetaTags.initialize();
});

//Modules
angular.module('NewsFeed').controller(
    'AppController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', Controllers.AppController]
);

angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', Controllers.FeedSingleController]
);

angular.module('NewsFeed').controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', Controllers.FeedCategoryController]
);

angular.module('NewsFeed').controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', Controllers.FeedListController]
);

angular.module('NewsFeed').factory(
    'FeedService',
    ['$http', '$q', FeedService]
);

angular.module('NewsFeed').config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', '$rootScopeProvider', Router]
);

window.onerror = function(){
    console.error(arguments);
};