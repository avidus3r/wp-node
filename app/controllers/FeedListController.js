'use strict';

var FeedListController = function($rootScope, $scope, FeedService, InstagramService, $route, $routeParams, $location, posts, envConfig) {

    this.name = 'list';
    this.$route = $route;
    this.$routeParams = $routeParams;
    this.$location = $location;

    $scope.package = {
        name: 'newsfeed'
    };

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.currentY = null;
    $scope.cardType = 'email';
    $scope.instagramPost = null;
    $scope.instagramIndex = 5;
    $scope.emailSignupIndex = 3;
    $scope.socialFollowIndex = 1;
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

    $scope.postPath = 'posts';
    $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    $scope.emailSignup = {'type': 'email-signup'};
    $scope.socialFollow = {'type': 'social-follow'};

    $scope.getPosts = function(){
        console.log('getPosts');
        FeedService.getPostData('prod', $scope.postsPerPage, $scope.pageNumber).then(
            function(data){ //success
                angular.forEach(data, function (item, index) {
                    item.type = 'post-list';
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

    InstagramService.get(1, 'nofilter').then(function(res){
        var gram = res.data.data[0];
        gram.type = 'instagram';
        $scope.instagramPost = gram;
        var postmap = [];

        angular.forEach(posts, function (item, index) {
            if(index === $scope.emailSignupIndex){
                postmap.push($scope.emailSignup);
                $scope.splicedItems+=1;
            }

            if(index === $scope.instagramIndex){
                postmap.push($scope.instagramPost);
                //$scope.createFeedItem($scope.instagramPost, index);
                $scope.splicedItems+=1;
            }
            item.type = 'post-list';
            postmap.push(item);
        });
        angular.forEach(postmap, function (item, index) {
            $scope.createFeedItem(item, $scope.feedItems.length);
        });
    });

    $scope.createFeedItem = function(item,index){
        $scope.feedItems[index] = item;
        if(index < $scope.feedItemScrollAmount){
            $scope.feedItemElements[index] = $scope.feedItems[index];
            $scope.feedItemPosition += 1;
        }
    };

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
        var itemPosition = $scope.feedItemPosition-($scope.splicedItems-1);
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount;

        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                $scope.add($scope.feedItems[i]);
                if(i % ($scope.postsPerPage-1) === 0){
                    $scope.paged += 1;
                    var state = {page: $scope.paged};
                    history.pushState(state, 'page: '+ $scope.paged, '/page/'+$scope.paged);
                    //window.addEventListener('scroll',$scope.updateUrl());
                }
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