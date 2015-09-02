'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

var feedConfig = {
    url: 'http://local.altdriver.com',
    remoteUrl: 'http://devaltdriver.wpengine.com',
    basePath: '/wp-json/wp/v2/',
    site: 'altdriver'
};

//Controllers
var Controllers = require('./app.controllers');

//Services
var FeedService = require('./services/FeedService');

//Routes
var Router = require('./app.routes');


//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', require('angular-ui-router'), 'metatags']);


angular.module('NewsFeed').factory(
    'envConfig',
    ['$http', '$q',
        function($http, $q){

            var config = {};

            config.loadConfig = function(){
                var deferred = $q.defer();
                var url = 'config.json';

                $http.get(url)
                    .then(function (response) {
                        var res = response.data;
                        deferred.resolve(res);
                    }, function (response) {
                        deferred.reject(response);
                    });

                return deferred.promise;
            };

            return config;
        }
    ]
);

angular.module('NewsFeed').run(function(MetaTags){
    MetaTags.initialize();
});

angular.module('NewsFeed').constant('envConfig', feedConfig);

angular.module('NewsFeed').factory(
    'FeedService',
    ['envConfig', '$http', '$q', FeedService]
);

//Modules
angular.module('NewsFeed').controller(
    'AppController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state', Controllers.AppController]
);

angular.module('NewsFeed').controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', '$stateParams', '$state','envConfig', Controllers.FeedSingleController]
);

angular.module('NewsFeed').controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', 'envConfig', Controllers.FeedCategoryController]
);

angular.module('NewsFeed').controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$stateParams', '$state', 'envConfig', Controllers.FeedListController]
);

/*angular.module('NewsFeed').provider('envConfig', function EnvConfigProvider(){
    this.get = [envConfig];
});*/



angular.module('NewsFeed').config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', '$rootScopeProvider', Router]
);

window.onerror = function(){
    console.error(arguments);
};

window.NewsFeed = NewsFeed;