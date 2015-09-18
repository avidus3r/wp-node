'use strict';

var FeedCategoryController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, envConfig, categories) {

    this.name = 'category';
    this.params = $routeParams;

    $scope.categories = categories;
    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.category = null;

    $scope.getParams = function(param, encode){
        var val = null;
        switch(param){
            case 'url':
                val = $location.$$absUrl;
                break;
            case 'urlPath':
                val = $location.$$path;
                break;
            case 'title':
                val = $scope.pageTitle;
                break;
        }

        val = encode ? encodeURIComponent(val) : val;
        return val;
    };


    var postPath = 'posts?';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
    var postParams = 'category_name=' + $routeParams.category;

    $scope.getPosts = function(){
        return FeedService.getPosts(postPath, postParams + pagingParams).then(
            function(data){ //success
                angular.forEach(data, function (item, index) {
                    $scope.createFeedItem(item, $scope.feedItems.length);
                });
                $scope.$emit('list:next');
            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                console.info('Got notification: ' + update);
            }
        );
    };

    $scope.getPosts();

    $scope.$watch('categoriesRetrieved', function (event, categories) {
        var scope = $scope;
        angular.forEach(categories, function (category, index) {
            if (category.slug === $routeParams.category) {
                scope.$emit('categoryLoaded', category);
            }
        });
    });

    $scope.$on('categoryLoaded', function (event, category) {

        $scope.category = category;
        // Standard meta
        $rootScope.metatags.title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.description = $scope.category.description;

        // Facebook meta
        $rootScope.metatags.fb_type = 'object';
        $rootScope.metatags.fb_title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.fb_description = $scope.category.description;
        $rootScope.metatags.fb_url = $scope.category.link;
        $rootScope.metatags.fb_image = 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png';

        // Twitter meta
        $rootScope.metatags.tw_card = 'summary_large_image';
        $rootScope.metatags.tw_title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.tw_description = $scope.category.description;
    });


    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index < $scope.feedItemScrollAmount){
            $scope.add($scope.feedItems[index]);
        }
    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){

            $scope.pageNumber += 1;
            FeedService.getPosts(postPath, postParams + '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber)
                .then(
                function(data){ //success
                    angular.forEach(data, function (item, index) {
                        $scope.createFeedItem(item, $scope.feedItems.length);
                    });
                    $scope.$emit('list:next');
                },
                function(reason){   //error
                    console.error('Failed: ', reason);
                },
                function(update) {  //notification
                    console.info('Got notification: ' + update);
                }
            );
        }
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        if($scope.feedItemPosition-1 === 0 || $scope.currentView === 'single') return false;

        var itemPosition = $scope.feedItemPosition-1;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount;
        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                $scope.add($scope.feedItems[i]);
                i += 1;
            }
        }
    };

    $scope.getCategory = function(categories, permalink){
        var cat = null;
        var catParent = null;

        angular.forEach(categories, function (category, index) {
            if(category.slug.replace('-','') === envConfig.site){
                catParent = category.term_id;
            }
        });
        angular.forEach(categories, function (category, index) {
            if(catParent){
                if(category.parent === catParent){
                    cat = category;
                }
            }
            if($location.$$path.indexOf(category.slug) > -1){
                cat = category;
            }
        });

        return cat;
    };

};

module.exports = FeedCategoryController;