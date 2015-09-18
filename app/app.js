'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

var env = 'dev';

var feedConfig = {
    'prod': {
        remoteUrl: 'http://www.altdriver.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    },
    'dev':{
        remoteUrl: 'http://devaltdriver.wpengine.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    }
};

//Controllers
var Controllers = require('./app.controllers');

//Directives
var Directives = require('./app.directives');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', 'metatags']);


/*
 * Module Configuration
 */

NewsFeed.run(function(MetaTags, $rootScope){
    MetaTags.initialize();
    $rootScope.isMobile = function(){
        var mobileUAStr = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|Firefox|MSIE|Opera/i;
        var result = null;

        if ( mobileUAStr.test(navigator.userAgent) ){
            result = mobileUAStr.exec(navigator.userAgent);
            var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios ' : '';
            return ios + 'mobile ' + result[0].toLowerCase().replace(' ','-');
        }else if( desktopUAStr.test(navigator.userAgent) ){
            result = desktopUAStr.exec(navigator.userAgent);
            return 'desktop ' + result[0].toLowerCase().replace(' ','-');
        }else{
            return 'unknown';
        }
    };
});

NewsFeed.factory(
    'FeedService',
    ['envConfig', 'env', '$http', '$q', FeedService]
);

NewsFeed.provider('FeedServiceProvider',function(){
    return {
        $get: function(){
            return FeedService;
        }
    }
});

NewsFeed.config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', 'FeedServiceProvider', Router]
);

NewsFeed.constant('env', env);
NewsFeed.constant('envConfig', feedConfig);

/*
 * Module Configuration
 */


/*
 * Module Controllers
 */
NewsFeed.controller(
    'HeaderController',
    ['$rootScope', '$scope', 'FeedService', 'envConfig', Controllers.HeaderController]
);

NewsFeed.controller(
    'PageController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', 'envConfig', Controllers.PageController]
);


NewsFeed.controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', '$sce', Controllers.FeedSingleController]
);

NewsFeed.controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', 'categories', Controllers.FeedCategoryController]
);

NewsFeed.controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.FeedListController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */

NewsFeed.directive('card', Directives.card);

/*
 * Module Directives
 */


window.onerror = function(){
    console.error(arguments);
};

//window.NewsFeed = NewsFeed;