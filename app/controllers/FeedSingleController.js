'use strict';

var FeedSingleController = function($scope, FeedService, $route, $routeParams, $location, $sce, $stateParams, $state) {

    this.name = 'single';
    this.params = $routeParams;

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;

    var postPath = 'posts?_jsonp=JSON_CALLBACK';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    var postParams = '&name=' + $stateParams.slug;


    var posts = FeedService.getPosts(postPath, postParams);

    posts.then(function(data){
        var item = data[0];
        for(var prop in item){
            if(prop === 'content'){
                item[prop] = $scope.trustContent(item[prop]);
            }
        }
        $scope.createFeedItem(item, $scope.feedItems.length);
        $scope.getPosts(postPath, pagingParams);
    });

    $scope.getPosts = function(postPath, pagingParams){
        posts = FeedService.getPosts(postPath, pagingParams);
        posts.then(
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
                alert('Got notification: ' + update);
            }
        );
    };

    $scope.trustContent = function(content){
        return $sce.trustAsHtml(content.rendered);
    };

    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index < $scope.feedItemScrollAmount){
            $scope.add($scope.feedItems[index]);
        }
    };

    $scope.getNext = function(){
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;
            FeedService.getPosts(postPath, postParams + '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber);
        }
        var itemPosition = $scope.feedItemPosition-1;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount;
        console.log(itemPosition,i,count);
        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                console.log(i);
                $scope.add($scope.feedItems[i]);
                i += 1;
            }
        }
    };

    $scope.goBack = function(){
        $state.go('category', {category:$stateParams.previousStateParams.category},{location:true});
    };

    $scope.renderContent = function(content,index, fromClick){
        console.log(content);
        var post = angular.element('.feed-item:eq('+ index +')').find('.post-content');
        post.html(content.rendered);

    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        $scope.feedItemPosition += 1;
    };

    $scope.changePage = function(){
        var newFeedItem = $scope.feedItems[$scope.feedItemPosition-1];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
    };
};

module.exports = FeedSingleController;