'use strict';

var FeedSingleController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $sce, $stateParams, $state) {

    this.name = 'single';
    this.params = $routeParams;

    $scope.renderedOnce = false;

    if(!$routeParams.hasOwnProperty('slug') || $scope.renderedOnce) return false;

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;
    $scope.pageTitle = null;
    $scope.renderedOnce = true;

    var postPath = 'posts';
    var pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    var postParams = '?name=' + $routeParams.slug;


    var posts = FeedService.getPosts(postPath, postParams);

    posts.then(function(data){
        var item = data[0];

        $scope.initMeta(item);

        $scope.createFeedItem(item, $scope.feedItems.length);
        $scope.getPosts('feed/'+ item.id, pagingParams);
    });

    $scope.initMeta = function(post){
        // Standard meta
        $rootScope.metatags.title = post.title.rendered;
        $rootScope.metatags.description = angular.element(post.excerpt.rendered).text();

        // Facebook meta
        $rootScope.metatags.fb_type = 'article';
        $rootScope.metatags.fb_title = post.title.rendered;
        $rootScope.metatags.fb_description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.fb_url = post.link;
        $rootScope.metatags.fb_image = post.featured_image_src.medium[0];

        // Twitter meta
        $rootScope.metatags.tw_card = 'summary_large_image';
        $rootScope.metatags.tw_title = post.title.rendered;
        $rootScope.metatags.tw_description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.tw_image = post.featured_image_src.medium[0];
    };

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

    $scope.getPosts = function(postPath, pagingParams){
        posts = FeedService.getPosts(postPath, pagingParams);
        posts.then(
            function(data){ //success
                angular.forEach(data, function (item, index) {
                    $scope.createFeedItem(item, $scope.feedItems.length);
                });
                angular.element('#scroll-container').attr('infinite-scroll-disabled', 'false');

            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                alert('Got notification: ' + update);
            }
        );
    };

    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index <= $scope.feedItemScrollAmount){
            $scope.add($scope.feedItems[index]);
        }
        if(index === $scope.feedItemScrollAmount){
            console.log('next');
            //$scope.getNext();
        }
    };

    $scope.getNext = function(){
        console.log('getNext');

        var itemPosition = $scope.feedItemPosition-1;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount+1;
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

        var feedItem = angular.element('.feed-item:eq('+ index +')');
        var post = feedItem.find('.post-content');

        post.html(content);

        var expectedEmbed = post.find('iframe');


        if(expectedEmbed.length > 0){
            expectedEmbed.addClass('video-container');
            $scope.resizeEmbed(expectedEmbed);
        }
    };

    $scope.trustContent = function(content){
        return $sce.trustAsHtml(content.rendered);
    };

    $scope.resizeEmbed = function(embed){
        var iframe = embed;

        var maxWidth = iframe.closest('.post-content').width(); // Max width for the image
        var maxHeight = 10000;    // Max height for the image
        var ratio = 0;  // Used for aspect ratio

        var width = iframe[0].width;    // Current image width
        var height = iframe[0].height;  // Current image height


        // Check if the current width is larger than the max
        if(width > maxWidth){
            console.log(maxWidth, width,height);
            ratio = maxWidth / width;   // get ratio for scaling image
            iframe.css('width', maxWidth); // Set new width
            iframe.css('height', height * ratio);  // Scale height based on ratio
            height = height * ratio;    // Reset height to match scaled image
            width = width * ratio;    // Reset width to match scaled image
        }

        // Check if current height is larger than max
        if(height > maxHeight){
            ratio = maxHeight / height; // get ratio for scaling image
            iframe.css('height', maxHeight);   // Set new height
            iframe.css('width', width * ratio);    // Scale width based on ratio
            width = width * ratio;    // Reset width to match scaled image
            height = height * ratio;    // Reset height to match scaled image
        }

    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;
            FeedService.getPosts(postPath, postParams + '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber)
                .then   (
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
        $scope.feedItemPosition += 1;
    };

    $scope.changeView = function($stateOptions){
        $state.go('single', $stateOptions, {reload:true, location:'replace'});
    };

    $scope.changePage = function(){
        var newFeedItem = $scope.feedItems[$scope.feedItemPosition-1];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
    };
};

module.exports = FeedSingleController;