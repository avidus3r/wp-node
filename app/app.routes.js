'use strict';

var Router = function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('index', {
            controller: 'FeedListController',
            url: '/',
            templateUrl: '/views/feedlist.html'
        })
        .state('category', {
            controller: 'FeedCategoryController',
            url: '/:category',
            templateUrl: '/views/category.html'
        })
        .state('category.single', {
            controller: 'FeedSingleController',
            url: '/:slug',
            templateUrl: '/views/single.html'
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;