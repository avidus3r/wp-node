'use strict';

var Router = function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: 'FeedListController',
            templateUrl: '/views/feedlist.html',
            controllerAs: 'list',
            reloadOnSearch: false
        })
        .when('/:category', {
            controller: 'FeedCategoryController',
            templateUrl: '/views/category.html',
            reloadOnSearch: false
        })
        .when('/:category/:slug', {
            controller: 'FeedSingleController',
            templateUrl: '/views/single.html',
            reloadOnSearch: false
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
};

module.exports = Router;