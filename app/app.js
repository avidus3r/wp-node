'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');

//Controllers
var Controllers = require('./app.controllers');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', require('angular-ui-router')]);

//Modules
angular.module('NewsFeed').controller(
    'AppController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', 'ogMeta', Controllers.AppController]
);

angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', 'ogMeta', Controllers.FeedSingleController]
);

angular.module('NewsFeed').controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', 'ogMeta', Controllers.FeedCategoryController]
);

angular.module('NewsFeed').controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', 'ogMeta', Controllers.FeedListController]
);

angular.module('NewsFeed').factory(
    'FeedService',
    ['$http', '$q', FeedService]
);

/*angular.module('NewsFeed').run(
    ['$rootScope', '$state', '$stateParams',
    function ($rootScope,   $state,   $stateParams) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.previousState = null;
        $rootScope.currentState = null;
        $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            $rootScope.$stateParams.previousState = from;
            $rootScope.$stateParams.previousStateParams = fromParams;
            $rootScope.$stateParams.currentState = to;
            $rootScope.$stateParams.currentStateParams = toParams;
        });
    }]
);*/

angular.module('NewsFeed').config(
    ['$routeProvider', '$locationProvider', Router]
);

angular.module('NewsFeed').factory('ogMeta', function() {
    return {
        type        : '',
        title       : '',
        description : '',
        url         : '',
        image       : ''
    }
});

angular.module('NewsFeed').directive('ogMeta',function(ogMeta){
    return {
        restrict: 'E',
        template: '<meta property="og:type" content="{{ ogMeta.type }}"><meta property="og:title" content="alt_driver - {{ ogMeta.title }}"><meta property="og:description" content="{{ ogMeta.description }}"><meta property="og:url" content="{{ ogMeta.url }}"><meta property="og:image" content="{{ ogMeta.image }}">',
        link: function(scope) {
            scope.ogMeta = ogMeta
        }
    }

});

window.onerror = function(){
    console.error(arguments);
};