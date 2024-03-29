'use strict';

var FeedService = function(app, appName, env, $http, $q){
    var feed = {};

    feed.categories = [];
    feed.navItems = [];
    feed.lastOffset = null;
    feed.singleId = null;

    feed.endpoints = app.env[env];

    feed.get = function(url, type){
        var deferred = $q.defer();

        switch(type){
            case 'get':

                $http.get(url)
                    .then(function (response) {

                        if(response.data.length === 0){
                            deferred.reject('end');
                        }

                        var res = response.data;
                        deferred.resolve(res);
                    }, function (response) {
                        console.error(response);
                        deferred.reject(response);
                    });
                break;
            case 'jsonp':
                $http.jsonp(url)
                    .then(function (response) {
                        var res = response.data;
                        deferred.resolve(res);
                    }, function (response) {
                        console.error(response);
                        deferred.reject(response);
                    });
                break;
        }

        return deferred.promise;
    };

    feed.getPosts = function(path, params) {
        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params + '&_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params;
        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){
            data = feed.get(jsonpUrl, 'jsonp');
        }

        return data;
    };

    feed.getArticles = function(numPosts, pageNum, skip){
        var url = '/api/articles/'+ numPosts + '/' + pageNum + '/' + skip || 0;
        return feed.get(url, 'get');
    };

    feed.getDBPosts = function(numPosts, pageNum, skip){
        var url = '/api/posts/'+ numPosts + '/' + pageNum + '/' + skip || 0;
        return feed.get(url, 'get');
    };

    feed.getDBPost = function(slug){
        var url = '/api/'+ slug;
        return feed.get(url, 'get');
    };

    feed.getDBCategoryPosts = function(category, numPosts, pageNum, skip){
        var url = '/api/category/'+ category + '/' + numPosts + '/' + pageNum + '/' + skip || 0;
        return feed.get(url, 'get');
    };

    feed.sponsor = function(name){
        var url = '/api/sponsor/' + name;
        return feed.get(url, 'get');
    };

    feed.search = function(query, numPosts, pageNum, skip) {
        var data = null;
        try{
            var url = '/api/search/'+query + '/' + numPosts + '/' + pageNum + '/' + skip || 0;
            data = feed.get(url, 'get');
        }catch(e){
            data = 'end';
        }
        return data;
    };

    feed.getSponsor = function(sponsorName) {
        var url = '/api/sponsor/' + name;
        return feed.get(url, 'get');
    };

    feed.getSponsors = function() {
        var url = '/api/sponsors';
        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){

        }

        return data;
    };

    feed.getCampaigns = function(path, params) {
        var deferred = $q.defer();
        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params + '&_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + path + params;

        try{
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
                        }else{
                            deferred.resolve(null);
                        }
                    });

                }, function (response) {
                    deferred.reject(response);
                });
        }catch(e){
            $http.jsonp(jsonpUrl)
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
                        }else{
                            deferred.resolve(null);
                        }
                    });

                }, function (response) {
                    deferred.reject(response);
                });
        }

        return deferred.promise;
    };

    feed.getCampaign = function(id) {
        //if(typeof id === 'undefined') return false;
        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'campaigns/' + id + '?_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'campaigns/' + id;
        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){
            data = feed.get(jsonpUrl, 'jsonp');
        }

        return data;
    };

    feed.vote = function(postID, voteVal){
        var url = '/api/vote/' + postID + '/' + voteVal;
        return feed.get(url, 'get');
    };

    feed.getPage = function(page){
        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'pages?name=' + page + '&_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'pages?name=' + page;
        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){
            data = feed.get(jsonpUrl, 'jsonp');
        }

        return data;
    };

    feed.getTerms = function(taxonomy){
        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'terms/' + taxonomy + '?per_page=0&_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'terms/' + taxonomy + '?per_page=0';
        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){
            data = feed.get(jsonpUrl, 'jsonp');
        }

        return data;
    };

    feed.getLegalMenu = function(name){
        var deferred = $q.defer();

        var jsonpUrl = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu?name='+encodeURIComponent(name) + '&_jsonp=JSON_CALLBACK';
        var url = feed.endpoints.remoteUrl + feed.endpoints.basePath + 'feed/menu?name='+encodeURIComponent(name);

        try{
            $http.get(url)
            .then(function (response) {
                var res = response.data;
                if (response.status !== 200) {
                    throw new Error('api error');
                }
                deferred.resolve(res);
                feed.navItems.push(res);
            }, function (response) {
                deferred.reject(response);
            });

        }catch(e){
            $http.jsonp(jsonpUrl)
                .then(function (response) {
                    var res = response.data;
                    deferred.resolve(res);
                    feed.navItems.push(res);
                }, function (response) {
                    deferred.reject(response);
                });
            console.log('caught');
        }

        return deferred.promise;
    };

    feed.getMainMenu = function(name){
        var deferred = $q.defer();

        var url = '/api/menu?name='+encodeURIComponent(name);

        try{

            $http.get(url)
                .then(function (response) {
                    var res = response.data;
                    if (response.status !== 200) {
                        throw new Error('api error');
                    }
                    deferred.resolve(res);
                    feed.navItems.push(res);
                }, function (response) {
                    deferred.reject(response);
                });



        }catch(e){
            deferred.reject(e);
        }

        return deferred.promise;
    };


    //static endpoints
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

    return feed;
};

module.exports = FeedService;