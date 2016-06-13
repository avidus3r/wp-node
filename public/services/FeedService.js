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

    feed.getDBPosts = function(numPosts, pageNum, skip, notIn){
        skip = skip || 0;
        var url = '/apiV2/posts/' + skip;
        return feed.get(url, 'get');
    };

    feed.getHomePosts = function(which, sidekickConfig){
        var data = null;
        if(which === 1){
            //get current index from this
            data = feed.getHeroPosts(4,1,0);
        }else {
            data = feed.getSidekick(sidekickConfig);
        }
        return data;
    };

    feed.getHeroPosts = function(numPosts, pageNum, skip){
        var url = '/api/heros/'+ numPosts + '/' + pageNum + '/' + skip || 0;
        return feed.get(url, 'get');
    };

    feed.queryDBPosts = function(query, numPosts, pageNum, skip){
        var url = '/api/trending/' + query + '/' + numPosts + '/' + pageNum + '/' + skip || 0;
        var data = feed.get(url, 'get');
        return data;
    };

    feed.queryArticles = function(type, numPosts, pageNum, skip, format, category){
        skip = skip || 0;

        if(typeof category === 'string' && category !== '' && category !== null) category = '&category=' + category;
        if(typeof format === 'string' && format !== '' && format !== null) format = '&format=' + format;

        var url = '/api/articles/' + type + '?perPage=' + numPosts + '&page=' + pageNum + '&skip=' + skip + category + format;

        var data = feed.get(url, 'get');
        return data;
    };

    feed.getSidekick = function(sidekickConfig){
        var deferred = $q.defer();
        var mixinType = sidekickConfig.mixin.type;
        var mixinItemsCount = sidekickConfig.mixin.count;
        var mixinFormat = sidekickConfig.mixin.format;
        var mixinOffset = sidekickConfig.mixin.offset;

        var sidekickOffset = sidekickConfig.offset;
        var sidekickDefaultType = sidekickConfig.defaultType;
        var sidekickDefaultFormat = sidekickConfig.defaultFormat;
        var sidekickTotal = sidekickConfig.totalItems;
        var sidekickCount = 0;

        var mixinUrl = '/api/articles/' + mixinType + '?perPage=' + mixinItemsCount + '&page=1&skip=' + mixinOffset + '&format=' + mixinFormat;
        var mixinData = feed.get(mixinUrl, 'get');

        var sidekicks = [];

        var data = null;
        var url = '';

        mixinData.then(
            function(res){
                var mixinActualCount = res.length;
                if(res.hasOwnProperty('data')){
                    if(res.data.status === 404) mixinActualCount = 0;
                }
                for(var i=0;i<mixinActualCount;i++){
                    sidekicks.push(res[i]);
                }
                sidekickCount = sidekickTotal-mixinActualCount;

                if(sidekickDefaultType === 'post'){
                    url = '/api/articles/post?perPage=' + sidekickCount + '&page=1&skip=' + sidekickOffset;
                }else{
                    url = '/api/articles/' + sidekickDefaultType + '?perPage=' + sidekickCount + '&page=1&skip=' + sidekickOffset + '&format=' + mixinFormat;
                }


                try{
                    data = feed.get(url, 'get');

                    data.then(function(result){
                        for(var i=0;i<result.length;i++){
                            sidekicks.push(result[i]);
                            deferred.resolve(sidekicks);
                        }
                    });
                }catch(e){

                }

            }, function(err){
                url = '/api/articles/post?perPage=5&page=1&skip=4&format=video';
                data = feed.get(url, 'get');

                data.then(function(result){
                    for(var i=0;i<result.length;i++){
                        sidekicks.push(result[i]);
                        deferred.resolve(sidekicks);
                    }
                });
            }
        );

        return deferred.promise;
    };

    feed.getDBPost = function(category, slug){
        var url = '/api/'+ slug;
        console.log(category, slug);
        if(category === 'partner-post' || category === 'animated-gif'){
            url = '/api/type/' + category + '/' + slug;
            console.log('getDBPost: ', url);
        }

        return feed.get(url, 'get');
    };

    feed.getPostType = function(type){
        console.log('getPostType: ', type);
        var url = '/api/type/' + type;
        return feed.get(url, 'get');
    };

    feed.getImageBuffer = function(url){
        var deferred = $q.defer();
        delete $http.defaults.headers.common['X-Requested-With'];
        $http.get(url, {responseType: "arraybuffer"})
            .then(function (response) {
                deferred.resolve(response);
            });

        return deferred.promise;
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

    feed.getCampaigns = function() {
        console.log('FeedService :: getCampaigns');
        var url = '/api/campaigns';

        var data = null;

        try{
            data = feed.get(url, 'get');
        }catch(e){

        }

        return data;
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