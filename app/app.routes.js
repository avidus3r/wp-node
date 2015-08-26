'use strict';

var Router = function($routeProvider, $locationProvider) {
    //$urlRouterProvider.otherwise('/');
    $routeProvider.
        when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/feedlist.html'
        })
        .when('/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/category.html'
        })
        .when('/:category/:slug', {
            controller: 'FeedSingleController',
            templateUrl: '/views/single.html'
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;