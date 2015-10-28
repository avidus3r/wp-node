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
    $scope.feedItemScrollAmount = 12;
    $scope.postPrefetchAt = 12;
    $scope.postsPerPage = 12;
    /*$scope.feedItemScrollAmount = Number(data.config.env[0].scroll_amount);
    $scope.postPrefetchAt = Number(data.config.env[0].prefetch_at);
    $scope.postsPerPage = Number(data.config.env[0].per_page);*/
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.currentY = null;
    $scope.cardType = 'email';
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

    if($scope.posts === null && $scope.sponsors !== null) $scope.currentView = 'sponsor';
    if($routeParams.hasOwnProperty('query')) $scope.currentView = 'search';

    $scope.postPath = 'posts';
    $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    $scope.getPosts = function(path, params){
        return FeedService.getPosts(path, params);
    };

    var postmap = [];

    $scope.createFeedItem = function(item,index){
        $scope.feedItems[$scope.feedItems.length] = item;
        if(index < $scope.feedItemScrollAmount){
            $scope.feedItemElements[index] = $scope.feedItems[index];
            $scope.feedItemPosition += 1;
        }
    };

    $scope.sendImpression = function(sponsorPost){
        setTimeout(function(){
            angular.module('NewsFeed').trackEvent('Sponsored Content', 'Impression', sponsorPost.sponsor.title + ' ' + sponsorPost.id, 1, {nonInteraction: true});
        },500);
    };

    $scope.trackSponsor = function(){
        for(var i=0;i<$scope.sponsorPosts.length;i++){
            var currentIndex = $scope.sponsorPosts[i] + $scope.splicedItems;
            if(angular.element('#feed-item-' + currentIndex + ':in-viewport').length > 0){
                var sponsorPost = $scope.feedItemElements[currentIndex];
                var scrollPos = angular.element('#feed-item-' + currentIndex).offset().top - angular.element(window).scrollTop();
                var inWindowAmount = window.innerHeight - angular.element('#feed-item-' + currentIndex).height();
                if(!$scope.feedItemElements[currentIndex].impressionSent && scrollPos <= inWindowAmount) {
                    $scope.feedItemElements[currentIndex].impressionSent = true;
                    $scope.sendImpression(sponsorPost);
                }
            }
        }
    };

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

            angular.forEach($scope.feedConfig.cards, function (item, index) {

                var card = item.card;

                /*if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                    console.log(card);
                    card = $scope.sponsors[$scope.paged];
                    card.type = 'sponsor';
                    card.position = Number(item.card.position);
                    postmap.splice(card.position, 0, card);
                }*/
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
            });

            //postmap.splice(5,0,{type:'main-leaderboard'});
        }
    }

    if($scope.currentView === 'sponsor' && $scope.sponsors !== null){
        if($scope.sponsors.length > 0) {
            angular.forEach($scope.sponsors, function (item, index) {
                item.type = 'sponsor';
                postmap.push(item);
            });
        }
    }

    angular.forEach(postmap, function (item, index) {
        $scope.createFeedItem(item, $scope.feedItems.length);
    });

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;

        }
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.paged;
        $scope.getPosts('feed/', $scope.postParams).then(
            function(data){ //success

                var pagedpostmap = [];
                angular.forEach(data, function (item, index) {
                    item.type = 'post-list';
                    pagedpostmap.push(item);
                });

                angular.forEach($scope.feedConfig.cards, function(item, index){
                     if(item.card.perPage === 'on') {

                     var card = item.card;

                     /*if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                         card = $scope.sponsors[$scope.paged];
                         card.type = 'sponsor';
                         card.position = Number(item.card.position);

                         pagedpostmap.splice((card.position*$scope.paged), 0, card);
                     }*/
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
                 });

                $scope.$emit('next:done', pagedpostmap);
            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                console.info('Got notification: ' + update);
            }
        );


        /*var itemPosition = $scope.feedItemPosition;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount;

        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                $scope.add($scope.feedItems[i]);
                if(i % ($scope.postsPerPage-1) === 0){

                }
                i += 1;
            }
        }*/
    };

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
        angular.element('body').find('.sidebar').removeClass('ng-hide');
        setTimeout(function(){
            angular.element('.pa-share').on('click', function(){
                if(angular.element('.share-icon-wrapper').not('.ng-hide').length >1)
                    angular.element(angular.element('.share-icon-wrapper').not('.ng-hide')[0]).addClass('ng-hide');
            });
        },1500);

        window.addEventListener('scroll', $scope.onScroll);
    });


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


    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedListController;