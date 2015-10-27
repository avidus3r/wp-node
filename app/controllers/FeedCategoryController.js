'use strict';

var FeedCategoryController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, data, envConfig) {

    this.name = 'category';
    this.params = $routeParams;

    $scope.categories = data.categories;
    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.feedItemScrollAmount = 12;
    $scope.postPrefetchAt = 12;
    $scope.postsPerPage = 12;
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.category = null;
    $scope.instagramPost = null;
    $scope.feedConfig = data.config;
    $scope.sponsors = data.sponsors;
    $scope.instagram = data.instagram;
    $scope.posts = data.posts;
    $scope.sponsorPosts = [];

    $scope.splicedItems = 0;
    $scope.paged = 1;

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


    var postPath = 'posts';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
    var postParams = 'category_name=' + $routeParams.category;

    $scope.getPosts = function(path, params){
        return FeedService.getPosts(path, params);
    };

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

        }
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.paged + '&category_name=' + $routeParams.category;
        $scope.getPosts(postPath, $scope.postParams).then(
            function(data){ //success

                var pagedpostmap = [];
                angular.forEach(data, function (item, index) {
                    item.type = 'post-list';
                    pagedpostmap.push(item);
                });

                /*angular.forEach($scope.feedConfig.cards, function(item, index){
                    if(item.card.perPage === 'on') {

                        var card = item.card;

                        *//*if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                         card = $scope.sponsors[$scope.paged];
                         card.type = 'sponsor';
                         card.position = Number(item.card.position);

                         pagedpostmap.splice((card.position*$scope.paged), 0, card);
                         }*//*
                        if (card.type === 'instagram') {
                            if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null) {
                                card.data = $scope.instagram.data.data[$scope.paged-1];
                            } else {
                                card.type = 'social-follow';
                            }
                            var cardPosition = ($scope.paged-1) * $scope.postsPerPage + parseInt(card.position);
                            console.log(cardPosition);
                            pagedpostmap.splice(cardPosition, 0, card);
                        }
                    }
                });*/

                $scope.$emit('next:done', pagedpostmap);
            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                console.info('Got notification: ' + update);
            }
        );
        /*if($scope.feedItemPosition-1 === 0 || $scope.currentView === 'single') return false;

         var itemPosition = $scope.feedItemPosition-1;
         var i = itemPosition;
         var count = $scope.feedItemScrollAmount;
         if(itemPosition % count === 0){
         while(i < (itemPosition+count)){
         $scope.add($scope.feedItems[i]);
         i += 1;
         }
         }*/
    };

    var postmap = [];

    if($scope.currentView === 'list' || $scope.currentView === 'search') {

        if($scope.posts.length === 0){
            $scope.feedConfig = null;
            var item = {};
            item.type = 'post-'+$scope.currentView + '-empty';
            item.noresults = true;
            postmap.push(item);
        }
        else{
            angular.forEach($scope.posts, function (item, index) {
                item.type = 'post-'+$scope.currentView;
                if(item.sponsor !== null){
                    item.type = 'sponsor';
                    $scope.sponsorPosts.push(index);
                }
                postmap.push(item);
            });

            var adItem = {};
            adItem.type = 'ad-category';
            postmap.splice(3,0,adItem);

            /*angular.forEach($scope.feedConfig.cards, function (item, index) {

                var card = item.card;

                *//*if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                 console.log(card);
                 card = $scope.sponsors[$scope.paged];
                 card.type = 'sponsor';
                 card.position = Number(item.card.position);
                 postmap.splice(card.position, 0, card);
                 }*//*
                if (card.type === 'instagram') {
                    if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null) {
                        card.data = $scope.instagram.data.data[0];
                    } else {
                        card.type = 'social-follow';
                    }
                    $scope.splicedItems += 1;
                    console.log('splicing instagram');
                    postmap.splice(card.position, 0, card);
                }
            });*/
        }
    }

    angular.forEach(postmap, function (item, index) {
        $scope.createFeedItem(item, $scope.feedItems.length);
    });

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

    $scope.$on('$viewContentLoaded', function(){
        angular.element('#loading-more').hide();

        setTimeout(function(){
            angular.element('.pa-share').on('click', function(){
                if(angular.element('.share-icon-wrapper').not('.ng-hide').length > 1)
                    angular.element(angular.element('.share-icon-wrapper').not('.ng-hide')[0]).addClass('ng-hide');
            });
        },1500);

        window.addEventListener('scroll', $scope.onScroll);
    });



    $scope.$on('next:done', function($event, posts){
        window.addEventListener('scroll', $scope.onScroll);
        angular.forEach(posts, function (item, index) {
            $scope.add(item, $scope.feedItems.length-1);
        });
    });

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

    $scope.onScroll = function(){
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight-1500)) {
            angular.element('#loading-more').show();
            $scope.paged += 1;
            var state = {page: $scope.paged};
            history.pushState(state, 'page: '+ $scope.paged, '?page='+$scope.paged);
            angular.module('NewsFeed').trackPageView();
            $scope.getNext();
            window.removeEventListener('scroll', $scope.onScroll);
        }else{
            angular.element('#loading-more').hide();
        }

        if($scope.sponsorPosts.length > 0){
            $scope.trackSponsor();
        }
    };

};

module.exports = FeedCategoryController;