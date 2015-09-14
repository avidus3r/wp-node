'use strict';

var FeedSingleController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, envConfig) {

    this.name = 'single';
    this.params = $routeParams;
    this.rootScope = $rootScope;
    this.FeedService = FeedService;
    this.route = $route;
    this.location = $location;
    this.envConfig = envConfig;
    this.scope = $scope;

    $scope.renderedOnce = false;

    if(!$routeParams.hasOwnProperty('slug')) return false;

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;
    $scope.currentView = 'post';
    $scope.pageTitle = null;
    $scope.renderedOnce = true;
    $scope.singlePostID = null;
    $scope.lastOffset = $scope.$parent.lastOffset || null;
    $scope.voteTally = 0;


    $scope.postPath = 'posts';

    $scope.offset = $scope.lastOffset ? '&offset=' + ($scope.lastOffset-1) : '';

    $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + $scope.offset;

    $scope.postParams = '?name=' + $routeParams.slug;

    $scope.getPost = function(){
        return FeedService.getPosts($scope.postPath, $scope.postParams).then(function(data){
            var item = data[0];

            $scope.initMeta(item);
            $scope.singlePostID = item.id;
            $scope.createFeedItem(item, $scope.feedItems.length);
            $scope.getPosts('feed/'+ $scope.singlePostID, $scope.pagingParams);
            return item;
        });
    };

    $scope.getPost();

    $scope.initMeta = function(post){
        // Standard meta
        $rootScope.metatags.title = post.title.rendered;
        $rootScope.metatags.description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.section = $routeParams.category;
        $rootScope.metatags.published_time = post.date;

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
        FeedService.getPosts(postPath, pagingParams).then(
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
                console.debug('Got notification: ' + update);
            }
        );
    };

    $scope.attachCommentsHandler = function(){
        $scope.$watch('$viewContentLoaded', function(){
            angular.element('#commentHook').on('click', function(){
                $scope.toggleComments();
            });
        });
    };

    $scope.toggleComments = function(){
        angular.element('.fb-wrapper').toggle();
        var currentState = angular.element('#commentHook span').text();
        var newState = currentState === '+ View Responses' ? '- Close Responses' : '+ View Responses';
        angular.element('#commentHook span').text(newState);
    };

    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index <= $scope.feedItemScrollAmount){
            $scope.add($scope.feedItems[index]);
        }
        if(index === $scope.feedItemScrollAmount){
            //console.log('next');
        }
    };

    $scope.getNext = function(){
        if($scope.feedItemPosition-1 === 0) return false;

        var itemPosition = $scope.feedItemPosition-1;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount+1;

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
            if(permalink.indexOf(category.slug) > -1){
                cat = category;
            }
        });

        return cat;
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

    $scope.resizeEmbed = function(embed){
        var iframe = embed;

        var maxWidth = iframe.closest('.post-content').width(); // Max width for the image
        var maxHeight = 10000;    // Max height for the image
        var ratio = 0;  // Used for aspect ratio

        var width = iframe[0].width;    // Current image width
        var height = iframe[0].height;  // Current image height


        // Check if the current width is larger than the max
        if(width > maxWidth){
            ratio = maxWidth / width;   // get ratio for scaling image
            iframe.css('width', maxWidth); // Set new width
            iframe.css('height', height * ratio);  // Scale height based on ratio
            height = height * ratio;    // Reset height to match scaled image
            width = width * ratio;    // Reset width to match scaled image
        }

        if(width < maxWidth){
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
            $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
            $scope.getPosts('feed/'+ $scope.singlePostID, $scope.pagingParams);
        }
        $scope.feedItemPosition += 1;
    };

    $scope.goToPage = function(e, lastIndex, linkParams){
        $scope.$parent.lastOffset = lastIndex + $scope.lastOffset;
        $location.url('/' + linkParams.category + '/' + linkParams.slug, {reload:true});
    };

    $scope.getVoteTally = function(){
        return $scope.voteTally;
    };

    $scope.attachVotingHandler = function(postID){
        var voteButtons = angular.element('.votes button');
        var votedHistory = null;

        if(typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null'){
            votedHistory = JSON.parse(localStorage.getItem('user_voted'));
            angular.forEach(votedHistory, function (item, index) {
                if(item.postID === postID){
                    var userVoted = item.voted;
                    console.log(userVoted);
                    voteButtons.parent().find('button[name="' + userVoted + '"]').addClass('voted');
                    voteButtons.attr('disabled','disabled');
                    return false;
                }
            });
        }
        voteButtons.on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            var button = angular.element(e.currentTarget);
            button.addClass('voted');
            var postID = button.data('post-id');
            var upOrDown = button.attr('name');
            var vote = upOrDown === 'up' ? 2 : 1;
            console.log('click', vote);
            var ls = [];
            var userLS = null;
            if(votedHistory){
                var items = JSON.parse(localStorage.getItem('user_voted'));
                items.push({postID:postID, voted:upOrDown});
                userLS = JSON.stringify(items);
            }else{
                ls.push({postID:postID, voted:upOrDown});
                userLS = JSON.stringify(ls);
            }
            localStorage.setItem('user_voted', userLS);
            var voteCount = button.parent().find('.vote-count').text();
            var count = voteCount === '' ? 1 : parseInt(voteCount)+1;
            button.parent().find('.vote-count').text(count);
            button.parent().find('button').attr('disabled','disabled');

            var req = FeedService.vote(postID, vote);
            req.addEventListener('load', function () {
                var result = this.responseText;
                console.log(result);
            });
        });
    };

};

module.exports = FeedSingleController;