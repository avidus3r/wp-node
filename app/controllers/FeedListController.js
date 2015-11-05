'use strict';

var FeedListController = function($rootScope, $scope, FeedService, InstagramService, $route, $routeParams, $location, data, app, appName, $sce) {

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
    $scope.currentY = null;
    $scope.cardType = 'email';
    $scope.instagramPost = null;
    $scope.feedConfig = data.config;
    $scope.sponsors = data.sponsors;
    $scope.instagram = data.instagram;
    $scope.posts = data.posts;
    $scope.sponsorPosts = [];
    $scope.sponsorItems = [];
    $scope.sponsorCount = 0;
    $scope.feedPath = app[appName].feedPath;
    $scope.appConfig = app[appName];

    $scope.splicedItems = 0;
    $scope.paged = 1;


    if(data.post){
        $scope.post = data.post;
        $scope.lastOffset = localStorage.getItem('post_offset') || 0;
        if($scope.lastOffset === 0){
            localStorage.setItem('post_offset', 0);
        }
        $scope.offset = $scope.lastOffset ? '&offset=' + $scope.lastOffset : '';
        $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + $scope.offset;
        $scope.postParams = '?name=' + $routeParams.slug;
        var offset = '';
        var postOffset = localStorage.getItem('post_offset');

        if(parseInt(postOffset) > 2) postOffset = (postOffset);

        if(localStorage.getItem('post_offset')) offset = '&offset=' + postOffset;
        $scope.offset = offset;
        $scope.currentView = 'post';
    }else{
        $scope.currentView = 'list';
    }

    $scope.initMeta = function(post){
        // Standard meta
        $rootScope.metatags.title = $scope.decodeHtml(post.title.rendered);
        document.title = $scope.decodeHtml(post.title.rendered);
        $rootScope.metatags.description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.section = $routeParams.category;
        $rootScope.metatags.published_time = post.date;

        // Facebook meta
        $rootScope.metatags.fb_type = 'article';
        $rootScope.metatags.fb_title = $scope.decodeHtml(post.title.rendered);
        $rootScope.metatags.fb_description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.fb_url = post.link;
        $rootScope.metatags.fb_image = post.featured_image_src.original[0];

        // Twitter meta
        $rootScope.metatags.tw_card = 'summary_large_image';
        $rootScope.metatags.tw_title = $scope.decodeHtml(post.title.rendered);
        $rootScope.metatags.tw_description = angular.element(post.excerpt.rendered).text();
        $rootScope.metatags.tw_image = post.featured_image_src.medium[0];
    };

    $scope.decodeHtml = function(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
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

    $scope.shuffle = function(arr){
        for(var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    };

    if($scope.posts !== null && $scope.post !== null) {
        angular.forEach($scope.sponsors, function (item, index) {
            if (item.campaign_active === 'true') {
                angular.forEach(item.campaigns.campaign_items, function (campaignItem, index) {
                    campaignItem.type = 'sponsor';
                    $scope.sponsorItems.push(campaignItem);
                });
            }
        });
        $scope.shuffle($scope.sponsorItems);
    }
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

    if($scope.posts === null && $scope.post === null && $scope.sponsorItems !== null) $scope.currentView = 'sponsor';
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
            $scope.sponsorPosts.shift();
        },500);
    };

    $scope.trackSponsor = function(){
        var currentIndex = $scope.sponsorPosts[0]+$scope.splicedItems;

        if(angular.element('#feed-item-' + currentIndex + ':in-viewport').length > 0){
            var sponsorPost = $scope.feedItemElements[currentIndex];
            var scrollPos = angular.element('#feed-item-' + currentIndex).offset().top - angular.element(window).scrollTop();
            var inWindowAmount = window.innerHeight - angular.element('#feed-item-' + currentIndex).height();
            if(!$scope.feedItemElements[currentIndex].impressionSent && scrollPos <= inWindowAmount) {
                $scope.feedItemElements[currentIndex].impressionSent = true;
                $scope.sendImpression(sponsorPost);
            }
        }

    };

    if($scope.currentView === 'sponsor' && $scope.sponsors !== null){
        if($scope.sponsors.length > 0) {
            angular.forEach($scope.sponsors, function (item, index) {
                item.type = 'sponsor';
                postmap.push(item);
            });
        }
    }

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;

            if($scope.post){
                $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + '&post__not_in=' + $scope.singlePostID;
                $scope.getPosts('feed/', $scope.pagingParams);
            }

        }
        $scope.feedItemPosition += 1;
    };

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

    $scope.getNext = function(params){
        $scope.feedItemScrollAmount = 12;
        $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.paged + params;
        if($scope.currentView === 'list' || $scope.currentView === 'search') {
            $scope.getPosts($scope.feedPath, $scope.postParams).then(
                function (data) { //success

                    var pagedpostmap = [];
                    angular.forEach(data, function (item, index) {
                        item.type = 'post-list';
                        pagedpostmap.push(item);
                    });

                    angular.forEach($scope.feedConfig.cards, function (item, index) {
                        if (item.card.perPage === 'on') {

                            var card = item.card;

                            /*if (card.type === 'sponsor' && $scope.sponsorItems !== null && $scope.sponsorItems.length > ($scope.paged)) {
                             card = $scope.sponsorItems[$scope.paged];
                             card.type = 'sponsor';
                             card.position = Number(item.card.position);

                             pagedpostmap.splice((card.position*$scope.paged), 0, card);
                             $scope.splicedItems++;
                             $scope.sponsorPosts.push(card.position*$scope.paged);
                             }*/
                            /*if (card.type === 'instagram') {
                                if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null) {
                                    card.data = $scope.instagram.data.data[$scope.paged - 1];
                                } else {
                                    card.type = 'social-follow';
                                }
                                var cardPosition = ($scope.paged - 1) * $scope.postsPerPage + parseInt(card.position);
                                pagedpostmap.splice(cardPosition, 0, card);
                                $scope.splicedItems++;
                            }*/
                        }
                    });

                    /*if($scope.sponsors !== null) {
                        angular.forEach(pagedpostmap, function (item, index) {
                            if (index > 0 && index % 2 === 0) {
                                if ($scope.sponsorCount >= $scope.sponsorItems.length) {
                                    pagedpostmap.splice((index + $scope.sponsorCount), 0, $scope.sponsorItems[$scope.sponsorCount]);
                                    $scope.sponsorCount++;
                                }
                            }
                        });
                    }*/
                    /*angular.forEach(pagedpostmap, function (item, index) {
                        if (index > 0 && index % 4 === 0) {
                            var adItem = {};
                            adItem.type = 'post-half-page';
                            pagedpostmap.splice(index,0,adItem);
                        }
                    });*/
                    $scope.$emit('next:done', pagedpostmap);
                },
                function (reason) {   //error
                    console.error('Failed: ', reason);
                },
                function (update) {  //notification
                    console.info('Got notification: ' + update);
                }
            );
        }

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
            if(category.slug.replace('-','') === appName){
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


    $scope.init = function() {
        var item = null;
        if($scope.currentView === 'list' || $scope.currentView === 'search') {

            if($scope.posts.length === 0){
                $scope.feedConfig = null;
                item = {};
                item.type = 'post-'+$scope.currentView + '-empty';
                item.noresults = true;
                postmap.push(item);
            }
            else{
                var pushedItems = 0;

                angular.forEach($scope.posts, function (item, index) {
                    item.type = 'post-'+$scope.currentView;
                    /*if(item.sponsor !== null){
                     item.type = 'sponsor';
                     $scope.sponsorPosts.push(index);
                     }*/

                    if(Number($scope.appConfig.adsPerPage) > 0){
                        if (index === 5) {
                            var adItem = {};
                            adItem.type = 'post-half-page';
                            postmap.push(adItem);
                            $scope.feedItemScrollAmount+=1;
                            pushedItems++;
                        }

                        if (index === 3) {
                            var siteInContentAdItem = {};
                            siteInContentAdItem.type = 'site-in-content';
                            postmap.push(siteInContentAdItem);
                            $scope.feedItemScrollAmount+=1;
                            pushedItems++;
                        }


                        if (index === 1) {
                            console.log('pushing mainleaderboard');
                            var mainLeaderboardAdItem = {};
                            mainLeaderboardAdItem.type = 'main-leaderboard';
                            postmap.push(mainLeaderboardAdItem);
                            $scope.feedItemScrollAmount+=1;
                            pushedItems++;
                        }
                    }

                    angular.forEach($scope.feedConfig.cards, function (cardItem, cardIndex) {

                        var card = cardItem.card;

                        /*if (card.type === 'sponsor' && $scope.sponsorItems !== null && $scope.sponsorItems.length > ($scope.paged)) {
                         card = $scope.sponsorItems[$scope.paged];
                         card.type = 'sponsor';
                         card.position = Number(item.card.position);
                         postmap.splice(card.position, 0, card);
                         $scope.splicedItems++;
                         $scope.sponsorPosts.push(index);
                         }*/
                        if (card.type === 'instagram' && index === Number(card.position)) {
                            if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null) {
                                card.data = $scope.instagram.data.data[0];
                            } else {
                                card.type = 'social-follow';
                            }

                            postmap.push(card);
                            $scope.feedItemScrollAmount+=1;
                            $scope.splicedItems++;
                            pushedItems++;
                        }
                    });

                    if($scope.sponsors !== null){
                        if (index > 0 && index %2 === 0) {
                            postmap.push($scope.sponsorItems[$scope.sponsorCount]);
                            $scope.sponsorCount++;
                            $scope.feedItemScrollAmount+=1;
                        }
                    }

                    postmap.push(item);

                });

                /*angular.forEach(postmap, function (item, index) {
                 if (index > 0 && index % 1 === 0) {
                 var mainLeaderboardAdItem = {};
                 mainLeaderboardAdItem.type = 'main-leaderboard';
                 postmap.splice(index,0,mainLeaderboardAdItem);
                 }
                 });*/

                /*angular.forEach(postmap, function (item, index) {
                 if (index > 0 && index % 3 === 0) {
                 postmap.splice((index+$scope.sponsorCount), 0, $scope.sponsorItems[$scope.sponsorCount]);
                 $scope.sponsorCount++;
                 }
                 });*/

                /*angular.forEach(postmap, function (item, index) {
                 if (index > 0 && index % 4 === 0) {
                 var siteInContentAdItem = {};
                 siteInContentAdItem.type = 'site-in-content';
                 postmap.splice(index,0,siteInContentAdItem);
                 }
                 });*/

                /*angular.forEach(postmap, function (item, index) {
                 if (index > 0 && index % 7 === 0) {
                 var adItem = {};
                 adItem.type = 'post-half-page';
                 postmap.splice(index,0,adItem);
                 }
                 });*/

                //postmap.splice(5,0,{type:'main-leaderboard'});
            }
            angular.forEach(postmap, function (item, index) {
                $scope.createFeedItem(item, $scope.feedItems.length);
            });
        }
        if($scope.currentView === 'post') {
            item = $scope.post[0];

            $scope.initMeta(item);
            $scope.singlePostID = item.id;
            item.type = 'post-single';
            $scope.createFeedItem(item, $scope.feedItems.length);

            if (item.sponsor !== null) {
                angular.module('NewsFeed').trackEvent('Sponsored Content', 'View', item.sponsor.title + ' ' + item.id, 1, null);
            }

            FeedService.getPosts($scope.feedPath, '?per_page=12&page=1&post__not_in=' + $scope.post[0].id + offset).then(
                function (data) {
                    $scope.currentView = 'list';
                    $scope.posts = data;
                    var postmap = [];

                    angular.forEach($scope.posts, function (item, index) {
                        item.type = 'post-list';
                        postmap.push(item);
                        //$scope.createFeedItem(item, $scope.feedItems.length);
                    });

                    /*angular.forEach($scope.feedConfig.cards, function (item, index) {

                        var card = item.card;

                        if (card.type === 'sponsor' && $scope.sponsorItems !== null && $scope.sponsorItems.length > ($scope.paged)) {
                         card = $scope.sponsorItems[$scope.paged];
                         card.type = 'sponsor';
                         card.position = Number(item.card.position);
                         postmap.splice(card.position, 0, card);
                         $scope.splicedItems++;
                         $scope.sponsorPosts.push(index);
                         }
                        if (card.type === 'instagram') {
                            console.log(card);
                            if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null && $scope.instagram.data.data.length > ($scope.paged)) {
                                card.data = $scope.instagram.data.data[$scope.paged - 1];
                            } else {
                                card.type = 'social-follow';
                            }
                            postmap.splice(card.position, 0, card);
                        }
                    });
                    if ($scope.sponsors !== null) {
                        angular.forEach(postmap, function (item, index) {
                            if (index > 0 && index % 2 === 0) {
                                postmap.splice((index + $scope.sponsorCount), 0, $scope.sponsorItems[$scope.sponsorCount]);
                                $scope.sponsorCount++;
                            }
                        });
                    }*/
                    angular.forEach(postmap, function (item, index) {
                        $scope.createFeedItem(item, $scope.feedItems.length);
                    });
                },
                function (error) {

                },
                function (notification) {

                }
            );
        }
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

    $scope.init();

    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedListController;