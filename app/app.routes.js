'use strict';

var Router = function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/feedlist.html',
            controllerAs: 'list'
        })
        .when('/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/category.html',
            controllerAs: 'category'
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