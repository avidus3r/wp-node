'use strict';

var Router = function($stateProvider, $urlRouterProvider, $locationProvider) {
    //$urlRouterProvider.otherwise('/');
    $stateProvider
        .state('index', {
            controller: 'FeedListController',
            url: '/',
            templateUrl: '/views/feedlist.html'
        })
        .state('category', {
            controller: 'FeedCategoryController',
            url: '/{category:[-a-z]{1,99}}',
            templateUrl: '/views/category.html'
        })
        .state('single', {
            controller: 'FeedSingleController',
            url: '/{category:[-a-z]{1,99}}/{slug:[-a-z]{1,99}}',
            templateUrl: '/views/single.html'
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;