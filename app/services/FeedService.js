'use strict';

var FeedService = function(app, appName, env, $http, $q){
    var feed = {};

    feed.categories = [];
    feed.navItems = [];
    feed.lastOffset = null;
    feed.singleId = null;

    feed.endpoints = app[appName].env[env];

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

    feed.search = function(query) {

        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'posts/?s=' + query;

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }
        );

        return deferred.promise;
    };

    feed.getSponsor = function(sponsorName) {

        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'sponsors/?name=' + sponsorName;

        $http.get(url)
            .then(function (response) {
                var res = response.data;

                feed.getCampaign(res[0].id).then(function(response){
                    var res = response;
                    deferred.resolve(res);
                });
            }
        );

        return deferred.promise;
    };

    feed.getSponsors = function() {

        var deferred = $q.defer();
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'sponsors/';

        $http.get(url)
            .then(function (response) {
                var res = response.data;
                deferred.resolve(res);
            }
        );

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
                var res = response.data;
                deferred.resolve(res);
            }, function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    feed.posts = function(postsPerPage, page) {
        var deferred = $q.defer();

        var url = '/posts/' + postsPerPage + '/' + page;
        $http.get(url)
            .then(function (response) {
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

        var oReq = new XMLHttpRequest();

        oReq.open('GET', url, true);
        oReq.send();

        oReq.addEventListener("load", function () {
            var result = JSON.parse(this.responseText);
            deferred.resolve(result);
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

        var oReq = new XMLHttpRequest();

        oReq.open('GET', url, true);
        oReq.send();

        oReq.addEventListener("load", function () {
            var result = JSON.parse(this.responseText);
            deferred.resolve(result);
            feed.navItems.push(result);
        });

        /*$http.get(url)
         .then(function (response) {
         var res = response.data;
         deferred.resolve(res);
         feed.navItems.push(res);
         }, function (response) {
         deferred.reject(response);
         });*/

        return deferred.promise;
    };

    feed.getMainMenu = function(name){
        var deferred = $q.defer();

        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu?name='+encodeURIComponent(name);

        var oReq = new XMLHttpRequest();

        oReq.open('GET', url, true);
        oReq.send();

        oReq.addEventListener("load", function () {
            var result = JSON.parse(this.responseText);
            deferred.resolve(result);
            feed.navItems.push(result);
        });

        /*$http.get(url)
         .then(function (response) {
         var res = response.data;
         deferred.resolve(res);
         feed.navItems.push(res);
         }, function (response) {
         deferred.reject(response);
         });*/

        return deferred.promise;
    };

    return feed;
};

module.exports = FeedService;