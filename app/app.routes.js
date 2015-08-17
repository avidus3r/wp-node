'use strict';

var Router = function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/feedlist.html'
        })
        .when('/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/category.html'
        })
        .when('/:category/:slug', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/category.html'
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;