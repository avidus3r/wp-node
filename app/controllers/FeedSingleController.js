'use strict';

var FeedSingleController = function($rootScope, $scope, FeedService, InstagramService, $route, $routeParams, $location, data, envConfig, $sce) {

    this.name = 'single';
    this.params = $routeParams;
    this.scope = $scope;

    $scope.renderedOnce = false;

    if(!$routeParams.hasOwnProperty('slug')) return false;

    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 1;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = Number(data.config.env[0].scroll_amount);
    $scope.postPrefetchAt = Number(data.config.env[0].prefetch_at);
    $scope.postsPerPage = Number(data.config.env[0].per_page);
    $scope.pageNumber = 1;
    $scope.currentView = 'post';
    $scope.pageTitle = null;
    $scope.renderedOnce = true;
    $scope.singlePostID = null;
    $scope.lastOffset = localStorage.getItem('post_offset') || 0;
    $scope.voteTally = 0;
    $scope.fbReady = false;
    $scope.comments = 0;
    $scope.instagramPost = null;
    $scope.feedConfig = data.config;
    $scope.sponsors = data.sponsors;
    $scope.instagram = data.instagram;
    $scope.paged = 1;

    if($scope.lastOffset === 0){
        localStorage.setItem('post_offset', 0);
    }

    $scope.postPath = 'posts';
    $scope.offset = $scope.lastOffset ? '&offset=' + $scope.lastOffset : '';
    $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + $scope.offset;
    $scope.postParams = '?name=' + $routeParams.slug;

    $scope.$on('$viewContentLoaded', function(){
       $scope.onViewLoaded();
    });

    $scope.post = data.post;
    if($scope.post[0].sponsor !== null){
        $scope.post[0].campaignActive = true;
    }

    var offset = '';
    var postOffset = localStorage.getItem('post_offset');

    if(parseInt(postOffset) > 2) postOffset = (postOffset);

    if(localStorage.getItem('post_offset')) offset = '&offset=' + postOffset;
    $scope.offset = offset;



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

    $scope.attachCommentsHandler = function(){
        $scope.$watch('$viewContentLoaded', function(){
            angular.element('.fb-wrapper').css({'height': '0', 'overflow':'hidden'});
        });
        $scope.$on('fbReady', function(){
            angular.element('#commentHook').on('click', function(e){
                $scope.toggleComments(e);
            });
            if($location.hash() === 'comment'){
                setTimeout(function(){
                    $scope.toggleComments(null);
                },1000);
            }

        });
    };

    $scope.commentBtnHandler = function($event, $index, urlParams){
        if($routeParams.slug === urlParams.slug){
            $scope.toggleComments(null);
        }else{
            urlParams.slug = urlParams.slug + '#comment';
            $rootScope.goToPage($event, $index, urlParams);
        }
    };

    $scope.toggleComments = function(event){
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        if($scope.comments === 1){
            angular.element('.fb-wrapper').css({'height': '0'});
            $scope.comments = 0;
        }else{
            angular.element('.fb-wrapper').css({'height': 'auto'});
            $scope.comments = 1;
        }
    };

    $scope.createFeedItem = function(item,index){
        $scope.feedItems[index] = item;

        if(index <= $scope.feedItemScrollAmount){
            $scope.add($scope.feedItems[index]);
        }
    };

    $scope.getNext = function(){
        if($scope.feedItemPosition-1 === 0) return false;

        $scope.getPosts.then(
            function(data){ //success
                var pagedpostmap = [];
                angular.forEach(data, function (item, index) {
                    item.type = 'post-list';
                    pagedpostmap.push(item);
                });

                /*angular.forEach($scope.feedConfig.cards, function(item, index){
                 if(item.card.perPage === 'on') {

                 var card = item.card;
                 console.log(card);
                 if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                 card = $scope.sponsors[$scope.paged];
                 card.type = 'sponsor';
                 card.position = item.card.position;
                 pagedpostmap.splice(card.position, 0, card);
                 }
                 if (card.type === 'instagram') {
                 if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null && $scope.instagram.data.data.length > ($scope.paged)) {
                 card.data = $scope.instagram.data.data[$scope.paged-1];
                 } else {
                 card.type = 'social-follow';
                 }
                 pagedpostmap.splice(card.position, 0, card);
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


        /*var itemPosition = $scope.feedItemPosition-1;
        var i = itemPosition;
        var count = $scope.feedItemScrollAmount+1;

        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                $scope.add($scope.feedItems[i]);
                if(i % ($scope.postsPerPage-1) === 0){
                    $scope.paged += 1;
                    var state = {page: $scope.paged};
                    history.pushState(state, 'page: '+ $scope.paged, '?page='+$scope.paged);
                    angular.module('NewsFeed').trackPageView();
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

    $scope.renderContent = function(content,index, fromClick){

        //post.html(content);

        var feedItem = angular.element('.feed-item:eq('+ index +')');
        var post = feedItem.find('.post-content');
        var expectedEmbed = post.find('iframe');


        if(expectedEmbed.length > 0){
            expectedEmbed.addClass('video-container');
            $scope.resizeEmbed(expectedEmbed);
        }
        return $sce.trustAsHtml(content);
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
            $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + '&post__not_in=' + $scope.singlePostID;
            $scope.getPosts('feed/', $scope.pagingParams);
        }
        $scope.feedItemPosition += 1;
    };

    $scope.goToPage = function(e, lastIndex, linkParams){
        var currentOffset = localStorage.getItem('post_offset');
        var newOffset = parseInt(currentOffset)+lastIndex;
        localStorage.setItem('post_offset', newOffset);
        window.location.href = '/' + linkParams.category + '/' + linkParams.slug;
    };

    $scope.getVoteTally = function(){
        return $scope.voteTally;
    };

    $scope.onViewLoaded = function(){
        angular.element('#loading-more').hide();

        setTimeout(function(){
            angular.element('.pa-share').on('click', function(){
                if(angular.element('.share-icon-wrapper').not('.ng-hide').length >1)
                    angular.element(angular.element('.share-icon-wrapper').not('.ng-hide')[0]).addClass('ng-hide');
            });
        },1500);
        window.addEventListener('scroll', $scope.onScroll);
    };

    $scope.onScroll = function(){
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight-1000)) {
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
    };

    $scope.receiveMessage = function(event){
        if(typeof event.data === 'string') {
            if (event.data.search('action=plugin_ready') > -1) {
                $scope.$emit('fbReady');
            }
        }
    };

    //return FeedService.getPosts($scope.postPath, $scope.postParams).then(function(data){
    var item = $scope.post[0];
    $scope.initMeta(item);
    $scope.singlePostID = item.id;
    item.type = 'post-single';
    $scope.createFeedItem(item, $scope.feedItems.length);

    FeedService.getPosts('feed', '?per_page=12&page=1&post__not_in=' + $scope.post[0].id + offset).then(
        function (data) {
            $scope.posts = data;
            var postmap = [];

            angular.forEach($scope.posts, function (item, index) {
                item.type = 'post-list';
                postmap.push(item);
                //$scope.createFeedItem(item, $scope.feedItems.length);
            });

            /*angular.forEach($scope.feedConfig.cards, function (item, index) {

                var card = item.card;

                if (card.type === 'sponsor' && $scope.sponsors !== null && $scope.sponsors.length > ($scope.paged)) {
                    console.log(card);
                    card = $scope.sponsors[$scope.paged];
                    card.type = 'sponsor';
                    card.position = item.card.position;
                    postmap.splice(card.position, 0, card);
                }
                if (card.type === 'instagram') {
                    console.log(card);
                    if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null && $scope.instagram.data.data.length > ($scope.paged)) {
                        card.data = $scope.instagram.data.data[$scope.paged-1];
                    } else {
                        card.type = 'social-follow';
                    }
                    postmap.splice(card.position, 0, card);
                }
            });*/

            angular.forEach(postmap, function (item, index) {
                $scope.createFeedItem(item, $scope.feedItems.length);
            });
        },
        function (error) {

        },
        function (notification) {

        }
    );

    $scope.getPosts = function(path, params){
        return FeedService.getPosts(path,params);
    };

    $scope.trackEvent = function(eventCategory, eventAction, eventLabel, eventValue, fieldsObject){
        angular.module('NewsFeed').trackEvent(eventCategory, eventAction, eventLabel, eventValue, fieldsObject);
    };

    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedSingleController;