'use strict';

var angular = require('angular');
require('angular-route');
require('angular-sanitize');
require('angular-resource');
require('ng-infinite-scroll');

var FeedSingleController = require('./controllers/FeedSingleController');
var FeedCategoryController = require('./controllers/FeedCategoryController');
var FeedListController = require('./controllers/FeedListController');

var FeedService = require('./services/FeedService');
var Router = require('./app.routes');



angular.module('NewsFeed', ['ngRoute', 'ngSanitize', 'ngResource', 'infinite-scroll', require('angular-ui-router')]);

angular.module('NewsFeed').controller('FeedSingleController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', FeedSingleController]);
angular.module('NewsFeed').controller('FeedCategoryController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', FeedCategoryController]);
angular.module('NewsFeed').controller('FeedListController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', FeedListController]);

angular.module('NewsFeed').factory('FeedService', ['$http', '$q', FeedService]);

angular.module('NewsFeed').run(['$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
]);

angular.module('NewsFeed').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', Router]);

window.onerror = function(){
    console.error(arguments);
};