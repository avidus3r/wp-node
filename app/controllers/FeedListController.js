'use strict';

var FeedListController = function($rootScope, $scope, FeedService, InstagramService, $route, $routeParams, $location, data, envConfig) {

    this.name = 'list';
    this.$route = $route;
    this.$routeParams = $routeParams;
    this.$location = $location;

    $scope.package = {
        name: 'newsfeed'
    };

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 0;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 8;
    $scope.postsPerPage = 12;
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.currentY = null;
    $scope.cardType = 'email';
    $scope.instagramPost = null;
    $scope.feedConfig = data.config;
    $scope.sponsors = data.sponsors;

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

    if(data.posts === null) $scope.currentView = 'sponsor';

    $scope.postPath = 'posts';
    $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    $scope.getPosts = function(){
        console.log('getPosts');
        FeedService.getPostData('prod', $scope.postsPerPage, $scope.pageNumber).then(
            function(data){ //success
                var pagedpostmap = [];
                angular.forEach(data, function (item, index) {
                    item.type = 'post-list';
                    pagedpostmap.push(item);
                });

                angular.forEach($scope.feedConfig, function(item, index){
                    if(item.card.perPage === 'on') {

                        var card = item.card;

                        if(card.type === 'sponsor') {
                            if($scope.pageNumber <= $scope.sponsors.length) {
                                card = $scope.sponsors[$scope.pageNumber];
                                card.type = 'sponsor';
                                card.position = item.card.position;
                            }
                        }

                        if (card.type === 'instagram') {
                            if (typeof data.instagram !== 'undefined') {
                                card.data = data.instagram.data.data[0];
                            } else {
                                card.type = 'social-follow';
                            }
                        }

                        pagedpostmap.splice(card.position, 0, card);
                    }
                });
                angular.forEach(pagedpostmap, function (item, index) {
                    console.log(item, index);
                    $scope.createFeedItem(item, $scope.feedItems.length);
                });
            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                console.info('Got notification: ' + update);
            }
        );
    };

    var postmap = [];

    $scope.createFeedItem = function(item,index){
        $scope.feedItems[index] = item;
        if(index < $scope.feedItemScrollAmount){
            $scope.feedItemElements[index] = $scope.feedItems[index];
            $scope.feedItemPosition += 1;
        }
    };

    if($scope.currentView === 'list') {

        angular.forEach(data.posts, function (item, index) {
            item.type = 'post-list';
            postmap.push(item);
        });

        angular.forEach(data.config, function (item, index) {
            var card = item.card;
            if (card.type === 'sponsor') {
                card = data.sponsors[$scope.paged];
                card.type = 'sponsor';
                card.position = item.card.position;
            }
            if (card.type === 'instagram') {
                if (typeof data.instagram !== 'undefined' && data.instagram !== null) {
                    card.data = data.instagram.data.data[0];
                } else {
                    card.type = 'social-follow';
                }
            }

            postmap.splice(card.position, 0, card);

        });
    }

    if($scope.currentView === 'sponsor'){
        angular.forEach(data.sponsor, function (item, index) {
            item.type = 'sponsor';
            postmap.push(item);
        });
    }

    angular.forEach(postmap, function (item, index) {
        $scope.createFeedItem(item, $scope.feedItems.length);
    });

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;
            $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
            $scope.getPosts();
        }
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        var itemPosition = $scope.feedItemPosition;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount;
        console.log(itemPosition,i,count);
        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                $scope.add($scope.feedItems[i]);
                /*if(i % ($scope.postsPerPage-1) === 0){
                    $scope.paged += 1;
                    var state = {page: $scope.paged};
                    history.pushState(state, 'page: '+ $scope.paged, '/page/'+$scope.paged);
                    //window.addEventListener('scroll',$scope.updateUrl());
                }*/
                i += 1;
            }
        }
    };

    $scope.updateUrl = function(){

        var pagedElem = angular.element('.feed-item#feed-item-'+($scope.postsPerPage-1) * $scope.paged);

        if(pagedElem.length > 0){
            if(pagedElem.offset().top - angular.element(window).scrollTop() <= 50){

                window.history.pushState(null, null, '?page='+$scope.paged);
                window.removeEventListener('scroll', $scope.updateUrl);
                $scope.paged+=1;
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
            if(permalink.indexOf(category.slug) > -1){
                cat = category;
            }
        });

        return cat;
    };

    $scope.receiveMessage = function(event){
        if(typeof event.data === 'string') {
            if (event.data.search('action=plugin_ready') > -1) {
                $scope.$emit('fbReady');
            }
        }
    };

    $scope.$on('$viewContentLoaded', function(){
        angular.element('#loading-more').hide();

        setTimeout(function(){
            angular.element('.pa-share').on('click', function(){
                if(angular.element('.share-icon-wrapper').not('.ng-hide').length >1)
                    angular.element(angular.element('.share-icon-wrapper').not('.ng-hide')[0]).addClass('ng-hide');
            });
        },1500);
    });

    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight-75)) {
            angular.element('#loading-more').show();
        }else{
            angular.element('#loading-more').hide();
        }
    };

    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedListController;