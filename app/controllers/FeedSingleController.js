'use strict';

var FeedSingleController = function($scope, FeedService, $routeParams) {
    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 3;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 15;
    $scope.pageNumber = 1;

    var postPath = 'posts?_jsonp=JSON_CALLBACK';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    var postParams = '&name=' + $routeParams.slug;


    var posts = FeedService.getPosts(postPath, postParams);

    posts.then(function(data){
        angular.forEach(data, function (item, index) {
            $scope.createFeedItem(item, $scope.feedItems.length);
        });
    });

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

    $scope.renderContent = function(content,index, fromClick){
        var post = angular.element('.feed-item:eq('+ index +')').find('.post-content');

        var videoSrc = angular.element(content.rendered).find('iframe').attr('src');
        var videoID = videoSrc.substr(videoSrc.lastIndexOf('/')+1, videoSrc.length);
        post.attr('id', videoID);

        post.html(content.rendered);
        post.css({'height': post.height()+'px'});
        if(index >= 5){
            angular.element('.feed-item:eq('+ (index-5) +')').find('iframe').remove();
        }
        if(fromClick) {
            var src = angular.element(post.find('iframe')).attr('src');
            var autoplay = src.indexOf('?') === -1 ? '?autoplay=1' : '&autoplay=1';
            angular.element(post.find('iframe')).attr('src', src + autoplay).css({'max-width':'100%'});
        }
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
}

module.exports = FeedSingleController;