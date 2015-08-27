'use strict';

var FeedService = function($http, $q){
    var feed = {};

    feed.endpoints = {
        url: 'http://local.altdriver.com',
        remoteUrl: 'http://devaltdriver.wpengine.com',
        basePath: '/wp-json/wp/v2/'
    };

    feed.categories = [];

    feed.getPosts = function(path, params) {
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params;

        $http.jsonp(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getTerms = function(taxonomy){
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'terms/' + taxonomy + '?_jsonp=JSON_CALLBACK&per_page=0';

        $http.jsonp(url)
            .then(function (response) {
                var res = response.data;
                feed.categories = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    return feed;
};

module.exports = FeedService;