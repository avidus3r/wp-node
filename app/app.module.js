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



angular.module('NewsFeed', ['ngRoute', 'ngSanitize', 'ngResource', 'infinite-scroll']);

angular.module('NewsFeed').controller('FeedSingleController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', FeedSingleController]);
angular.module('NewsFeed').controller('FeedCategoryController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', FeedCategoryController]);
angular.module('NewsFeed').controller('FeedListController', ['$scope', 'FeedService', '$route', '$routeParams', '$location', FeedListController]);

angular.module('NewsFeed').factory('FeedService', ['$http', '$q', FeedService]);

angular.module('NewsFeed').config(['$routeProvider', '$locationProvider', Router]);
