'use strict';

var FeedListController = function($scope, FeedService, $route, $routeParams, $location) {

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
    $scope.feedItemScrollAmount = 3;
    $scope.postPrefetchAt = 7;
    $scope.postsPerPage = 15;
    $scope.pageNumber = 1;

    $scope.isMobile = function(){
        return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
        //return true;
    };

    var postPath = 'posts';
    var postParams = '?_jsonp=JSON_CALLBACK&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    var posts = FeedService.getPosts(postPath, postParams);

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

    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index < $scope.feedItemScrollAmount){
            $scope.feedItemElements.push($scope.feedItems[index]);
        }
    };

    $scope.getNext = function(){
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
                        alert('Got notification: ' + update);
                    }
                );
        }
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

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        $scope.feedItemPosition += 1;
    };

    $scope.renderContent = function(content,index, fromClick){

        var post = angular.element('.feed-item:eq('+ index +')').find('.post-content');

        var videoSrc = angular.element(content.rendered).find('iframe').attr('src');
        if(typeof videoSrc !== 'undefined') {
            var videoID = videoSrc.substr(videoSrc.lastIndexOf('/') + 1, videoSrc.length);
            post.attr('id', videoID);
        }

        post.html(content.rendered);

        if(index >= 5){
            angular.element('.feed-item:eq('+ (index-5) +')').find('iframe').remove();
        }
        if(fromClick) {
            $scope.changePage();
            var src = angular.element(post.find('iframe')).attr('src');
            var autoplay = src.indexOf('?') === -1 ? '?autoplay=1' : '&autoplay=1';
            angular.element(post.find('iframe')).attr('src', src + autoplay).css({'max-width':'100%'});
        }
    };

    $scope.changePage = function(){
        var newFeedItem = $scope.feedItems[$scope.feedItemPosition-1];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
    };
}
module.exports = FeedListController;