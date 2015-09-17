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
 * Module Controllers
 */
angular.module('NewsFeed').controller(
    'HeaderController',
    ['$rootScope', '$scope', 'FeedService', 'envConfig', Controllers.HeaderController]
);

angular.module('NewsFeed').controller(
    'PageController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', 'envConfig', Controllers.PageController]
);


angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', '$sce', Controllers.FeedSingleController]
);

angular.module('NewsFeed').controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.FeedCategoryController]
);

angular.module('NewsFeed').controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', Controllers.FeedListController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */

angular.module('NewsFeed').directive('card', Directives.card);

/*
 * Module Directives
 */


/*
 * Module Configuration
 */

angular.module('NewsFeed').run(function(MetaTags, $rootScope){
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

angular.module('NewsFeed').config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', '$rootScopeProvider', Router]
);

angular.module('NewsFeed').constant('env', env);
angular.module('NewsFeed').constant('envConfig', feedConfig);

angular.module('NewsFeed').factory(
    'FeedService',
    ['envConfig', 'env', '$http', '$q', FeedService]
);

/*
 * Module Configuration
 */


window.onerror = function(){
    console.error(arguments);
};

//window.NewsFeed = NewsFeed;