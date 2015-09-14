'use strict';

var FeedService = function(envConfig, $http, $q){
    var feed = {};
    feed.endpoints = {
        url: 'http://local.altdriver.com',
        remoteUrl: 'http://altdriver.staging.wpengine.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    };

    feed.categories = [];
    feed.navItems = [];
    feed.lastOffset = null;

    feed.getPosts = function(path, params) {
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params;
        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getData = function(){
        var deferred = $q.defer();
        deferred.resolve('data');
        return deferred.promise;
    };

    feed.vote = function(postID, voteVal){
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/vote/' + postID;

        $http.post(url, {vote: voteVal})
            .then(function (response) {
                var res = response.data;
                feed.categories = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getTerms = function(taxonomy){
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'terms/' + taxonomy + '?per_page=0';

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                feed.categories = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getNavItems = function(){
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu';

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                feed.navItems = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    return feed;
};

module.exports = FeedService;