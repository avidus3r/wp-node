'use strict';

var FeedCategoryController = function($scope, FeedService, $route, $routeParams, $location) {

    this.name = 'category';
    this.params = $routeParams;

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
    //var isSingle = $routeParams.hasOwnProperty('slug');
    //var postParams = !isSingle ? '&category_name=' + $routeParams.category : '&name=' + $routeParams.slug;
    var postParams = '&category_name=' + $routeParams.category;
    var posts = null;

    console.log('catController');

    posts = FeedService.getPosts(postPath, postParams + pagingParams);

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

        if(index >= 5){
            angular.element('.feed-item:eq('+ (index-5) +')').find('iframe').remove();
        }
        if(fromClick) {
            var currentY = angular.element(window).scrollY;
            var postTop = post.offset().top;
            window.scrollTo(0,Math.floor(currentY+postTop-20));
            $scope.changePage(index);
            var src = angular.element(post.find('iframe')).attr('src');
            var autoplay = src.indexOf('?') === -1 ? '?autoplay=1' : '&autoplay=1';
            angular.element(post.find('iframe')).attr('src', src + autoplay).css({'max-width':'100%'});

            post.closest('.post-view-type').addClass('single').removeClass('category');

            var authorMetaEl = '<div class="author-meta"><p class="left"><span class="light-grey">By</span>' + $scope.feedItemElements[index].author.name + '</p><p class="right" ng-bind-html="item.category[0].name">' + $scope.feedItemElements[index].category[0].name + '</p><span class="clearfix"></span></div>';

            post.prepend('<h2 class="post-title">' + $scope.feedItemElements[index].title.rendered + '</h2>' + authorMetaEl);
            angular.element('.single').height(window.innerHeight);
        }


    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        $scope.feedItemPosition += 1;
    };

    $scope.changePage = function(index){
        var newFeedItem = $scope.feedItems[index];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
    };

};

module.exports = FeedCategoryController;