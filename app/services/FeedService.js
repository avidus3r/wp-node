'use strict';

var FeedService = function(envConfig, env, $http, $q){
    var feed = {};

    feed.endpoints = envConfig[env];

    feed.categories = [];
    feed.navItems = [];
    feed.lastOffset = null;
    feed.singleId = null;

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

    feed.getCampaigns = function(path, params) {
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params;
        $http.get(url)
            .then(function (response) {
                var res = response.data;
                angular.forEach(res,function(item, index){
                    if(item.campaign_active !== null){
                        var campaignID = item.parent;
                        feed.getCampaign(campaignID).then(
                            function(data){
                                deferred.resolve(data);
                            }
                        )
                    }
                });

            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getCampaign = function(id) {
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'campaigns/' + id;

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }
        );

        return deferred.promise;
    };

    feed.getPostData = function(env, postsPerPage, page) {
        var deferred = $q.defer();
        var formData = new FormData();
        formData.append('env',env);
        formData.append('postsPerPage',postsPerPage);
        formData.append('page',page);

        var url = '/getPosts/'+env + '/' + postsPerPage + '/' + page;
        $http.get(url)
            .then(function (response) {
                console.log(response);
                var res = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getData = function(url){
        var deferred = $q.defer();
        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    feed.vote = function(postID, voteVal){
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/vote/' + postID;

        var oReq = new XMLHttpRequest();

        oReq.open('POST', url, true);
        var formData = new FormData();
        formData.append('vote', voteVal);
        oReq.send(formData);
        return oReq;
    };

    feed.getPage = function(page){
        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'pages?name=' + page;

        $http.get(url)
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

    feed.getLegalMenu = function(name){
        var deferred = $q.defer();

        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu?name='+encodeURIComponent(name);

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
                feed.navItems.push(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.getMainMenu = function(name){
        var deferred = $q.defer();

        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu?name='+encodeURIComponent(name);

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
                feed.navItems.push(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    return feed;
};

module.exports = FeedService;