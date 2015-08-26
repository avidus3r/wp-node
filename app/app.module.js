'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');

//Controllers
var Controllers = require('./app.controllers');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', require('angular-ui-router')]);

//Modules
angular.module('NewsFeed').controller(
    'AppController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', Controllers.AppController]
);

angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', Controllers.FeedSingleController]
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

angular.module('NewsFeed').run(
    ['$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.previousState = null;
        $rootScope.currentState = null;
        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            $rootScope.$stateParams.previousState = from;
            $rootScope.$stateParams.previousStateParams = fromParams;
            $rootScope.$stateParams.currentState = to;
            $rootScope.$stateParams.currentStateParams = toParams;
        });
    }]
);

angular.module('NewsFeed').config(
    ['$stateProvider', '$urlRouterProvider', '$locationProvider', Router]
);

window.onerror = function(){
    console.error(arguments);
};