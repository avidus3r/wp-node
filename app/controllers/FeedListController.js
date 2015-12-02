'use strict';

var FeedListController = function($rootScope, $scope, FeedService, InstagramService, $route, $routeParams, $location, data, app, appName, $sce, $compile) {

    this.name = 'list';
    this.$route = $route;
    this.$routeParams = $routeParams;
    this.$location = $location;

    $scope.package = {
        name: 'newsfeed'
    };
    $scope.appConfig = app[appName];
    $scope.feedItems = [];
    $scope.feedItemElements = [];
    $scope.feedItemPosition = 0;
    $scope.lastScroll = window.scrollY;
    $scope.feedItemScrollAmount = Number($scope.appConfig.scroll_amount);
    $scope.postPrefetchAt = Number($scope.appConfig.prefetch_at);
    $scope.postsPerPage = Number($scope.appConfig.per_page);
    $scope.pageNumber = 1;
    $scope.currentY = null;
    $scope.cardType = 'email';
    $scope.instagramPost = null;
    $scope.feedConfig = data.config;
    $scope.sponsors = data.sponsors;
    $scope.instagram = data.instagram;
    $scope.instagramItems = [];
    $scope.instagramIndex = 0;
    $scope.posts = data.posts;
    $scope.sponsorPosts = [];
    $scope.sponsorItems = [];
    $scope.sponsorCount = 0;
    $scope.feedPath = app[appName].feedPath;
    $scope.isSingle = false;
    $scope.singleParams = {};
    $scope.isMobile = $rootScope._isMobile();
    $scope.currentCategory = null;
    $scope.renderedSingleContent = null;
    $scope.useMongo = false;


    try {
        if (localStorage.getItem('post_offset') === "NaN") {
            localStorage.setItem('post_offset', '0');
        }
        $scope.postIndex = 0 || Number(localStorage.getItem('post_offset'));
    }catch(e){

    }

    $scope.splicedItems = 0;
    $scope.paged = 1;


    if($scope.instagram !== null){
        $scope.instagramItems = $scope.instagram.data.data;
    }

    $scope.errorCheck = function(){
        if($scope.post === 'error' || $scope.posts === 'error' || $scope.sponsors === 'error'){
            //window.location.href = 'http://splash.altdriver.com/';
            /*var errorHtml = '<section class="view-container"> <div class="wrapper app-error" style="padding:1em; margin-top:2em;"><h2>Uh oh...</h2><p>something went wrong</p><img style="max-width: 100%;" src="/images/error.jpg"></div></section>';
            angular.element('.app-main').html(errorHtml);*/
        }
    };

    $scope.errorCheck();


    if(data.post){
        $scope.isSingle = true;
        //add params
        $scope.post = data.post;

        var offset = '';

        try {
            var postOffset = Number(localStorage.getItem('post_offset'));
            if (localStorage.getItem('post_offset')) offset = '&offset=' + postOffset;
        }catch(e){

        }
        $scope.offset = offset;

        $scope.pagingParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber + $scope.offset;
        $scope.postParams = '?name=' + $routeParams.slug;

        $scope.currentView = 'post';
    }else if(data.posts){
        $scope.currentView = 'list';
    }else{
        $scope.currentView = 'sponsor';
    }

    if(!$routeParams.hasOwnProperty('slug') && $routeParams.hasOwnProperty('category')){
        $scope.currentView = 'category';
        $scope.currentCategory = $routeParams.category;
    }

    $scope.initMeta = function(post){
        // Standard meta
        $rootScope.metatags.title = document.title;
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

    if($scope.currentView === 'post'){
        $scope.initMeta($scope.post[0]);
    }

    $scope.decodeHtml = function(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    $scope.attachCommentsHandler = function(){
        $scope.$watch('$viewContentLoaded', function(){
            angular.element('.fb-wrapper').css({'height': '0', 'overflow':'hidden'});
        });
    };

    $scope.commentBtnHandler = function($event, $index, urlParams){
        if($routeParams.slug === urlParams.slug){
            $scope.toggleComments($event);
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

    $scope.getDBPosts = function(perPage, pageNum){
        return FeedService.getDBPosts(perPage, pageNum);
    };

    var postmap = [];

    $scope.createFeedItem = function(item,index){
        $scope.feedItems[$scope.feedItems.length] = item;
        if(index <= $scope.feedItemScrollAmount){
            $scope.feedItemElements[index] = $scope.feedItems[index];
            $scope.feedItemPosition += 1;
        }
    };

    $scope.sendImpression = function(sponsorPost){
        setTimeout(function(){
            //angular.module('NewsFeed').trackEvent('Sponsored Content', 'Impression', sponsorPost.sponsor.title + ' ' + sponsorPost.id, 1, {nonInteraction: true});
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
                //$scope.sendImpression(sponsorPost);
            }
        }

    };

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
        if ((window.innerHeight + window.scrollY) >= (angular.element('.app-main').height())) {
            angular.element('#loading-more').show();
            $scope.paged += 1;
            var state = {page: $scope.paged};
            history.pushState(state, 'page: '+ $scope.paged, '?page='+$scope.paged);
            angular.module('NewsFeed').trackPageView($scope.paged, document.title);
            if(!$scope.useMongo){
                $scope.getNext('');
            }else{

            }
            window.removeEventListener('scroll', $scope.onScroll);
        }else{
            angular.element('#loading-more').hide();
        }

        if($scope.sponsorPosts.length > 0){
            //$scope.trackSponsor();
        }
    };

    $scope.clearAds = function(){
        var adHeights = [];

        if($scope.isMobile) {
            adHeights.push(angular.element(angular.element('card[type="main-leaderboard"]')[0]).children(0).height());
            adHeights.push(angular.element(angular.element('card[type="post-half-page"]')[0]).children(0).height());
            adHeights.push(angular.element(angular.element('card[type="site-in-content"]')[0]).children(0).height());

            angular.element('card[type="main-leaderboard"]').css({
                'height': adHeights[0] + 'px',
                'width': '100%',
                'display': 'block'
            }).children().remove();
            angular.element('card[type="post-half-page"]').css({
                'height': adHeights[1] + 'px',
                'width': '100%',
                'display': 'block'
            }).children().remove();
            angular.element('card[type="site-in-content"]').css({
                'height': adHeights[2] + 'px',
                'width': '100%',
                'display': 'block'
            }).children().remove();
        }else{
            adHeights.push(angular.element(angular.element('card[type="main-leaderboard"]')[0]).children(0).height());
            angular.element('card[type="main-leaderboard"]').css({
                'height': adHeights[0] + 'px',
                'width': '100%',
                'display': 'block'
            }).children().remove();
        }
    };

    $scope.mapPosts = function(data){
        var pushedItems = 0;
        var pagedpostmap = [];
        angular.forEach(data, function (item, index) {
            item.type = 'post-list';
            if (Number($scope.appConfig.adsPerPage) > 0) {


                if ($scope.isMobile) {
                    if (index === 5) {
                        var adItem = {};
                        adItem.type = 'post-half-page';
                        pagedpostmap.push(adItem);
                        $scope.feedItemScrollAmount += 1;
                        pushedItems++;
                    }


                    if (index === 3) {
                        var siteInContentAdItem = {};
                        siteInContentAdItem.type = 'site-in-content';
                        pagedpostmap.push(siteInContentAdItem);
                        $scope.feedItemScrollAmount += 1;
                        pushedItems++;
                    }
                }
                if (index === 1) {
                    console.log('pushing mainleaderboard');
                    var mainLeaderboardAdItem = {};
                    mainLeaderboardAdItem.type = 'main-leaderboard';
                    pagedpostmap.push(mainLeaderboardAdItem);
                    $scope.feedItemScrollAmount += 1;
                    pushedItems++;
                }
            }

            if ($scope.sponsors !== null && $scope.sponsorItems.length > 0) {
                if (index > 0 && index % 2 === 0) {
                    if ($scope.sponsorCount < $scope.sponsorItems.length) {
                        pagedpostmap.push($scope.sponsorItems[$scope.sponsorCount]);
                        console.log('pushing sponsor: ', index);
                        $scope.sponsorCount++;
                        $scope.feedItemScrollAmount++;
                        pushedItems++;
                    }
                }
            }

            angular.forEach($scope.feedConfig.cards, function (item, cardIndex) {
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
                    if (card.type === 'instagram') {
                        if (index === Number(card.position)) {
                            if (typeof $scope.instagram !== 'undefined' && $scope.instagram !== null && $scope.instagram.data.data.length > $scope.instagramIndex) {
                                card.data = $scope.instagram.data.data[$scope.instagramIndex];
                                $scope.instagramIndex++;
                                pagedpostmap.push(card);
                                $scope.feedItemScrollAmount++;
                                pushedItems++;
                            } else {
                                card.type = 'social-follow';
                            }

                        }
                    }
                }
            });

            pagedpostmap.push(item);
        });

        $scope.$emit('next:done', pagedpostmap);

    };

    $scope.getNext = function(params){

        $scope.feedItemScrollAmount = Number($scope.appConfig.scroll_amount);
        $scope.clearAds();

        if($scope.currentView !== 'search') {
            $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.paged + params;

            if($scope.currentView === 'category'){
                $scope.feedPath = 'posts';
                $scope.postParams += '&category_name=' + $scope.currentCategory;
            }
            $scope.getPosts($scope.feedPath, $scope.postParams).then(
                function (data) { //success
                    if(data.length > 0) {
                        $scope.mapPosts(data);
                    }else{
                        angular.element('#loading-more').text('');
                        angular.element('#loading-more')
                            .append(
                            angular.element('<a/>')
                                .attr('href','/')
                                .text('You\'ve reached the end - Start Over')
                        );
                    }
                },
                function (reason) {   //error
                    console.error('Failed: ', reason);
                },
                function (update) {  //notification
                    console.info('Got notification: ' + update);
                }
            );
        }

        if($scope.currentView === 'search'){
            FeedService.search($routeParams.query, $scope.paged).then(
                function (data) { //success
                    if(data.length > 0) {
                        $scope.mapPosts(data);
                    }else{
                        angular.element('#loading-more').text('');
                        angular.element('#loading-more')
                            .append(
                            angular.element('<a/>')
                                .attr('href','/')
                                .text('No more search results - Go Back')
                        );
                    }
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
            if(item.type === 'post-list'){
                item.post_index = $scope.postIndex;
                $scope.postIndex++;
            }
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

    $scope.getShareLink = function(){
        var link = location.href;
        if(location.hash){
            link = link.replace(location.hash, '');
        }
        return link;
    };

    $scope.init = function() {
        var item = null;

        if($scope.posts !== null || $scope.post !== null) {
            if($scope.sponsors !== null && $scope.sponsors.length > 0)
            angular.forEach($scope.sponsors, function (item, index) {
                if (item.campaign_active === 'true') {
                    angular.forEach(item.campaigns.campaign_items, function (campaignItem, index) {
                        campaignItem.type = 'sponsor';
                        $scope.sponsorItems.push(campaignItem);
                    });
                }
            });
            $scope.shuffle($scope.sponsorItems);
            console.log($scope.sponsorItems.length);
        }

        if($scope.currentView === 'list' || $scope.currentView === 'search' || $scope.currentView === 'category') {

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

                    if($scope.currentView === 'category') item.type = 'post-list';

                    if(Number($scope.appConfig.adsPerPage) > 0){

                        if($scope.isMobile) {
                            if (index === 5) {
                                var adItem = {};
                                adItem.type = 'post-half-page';
                                postmap.push(adItem);
                                $scope.feedItemScrollAmount += 1;
                                pushedItems++;
                            }

                            if (index === 3) {
                                var siteInContentAdItem = {};
                                siteInContentAdItem.type = 'site-in-content';
                                postmap.push(siteInContentAdItem);
                                $scope.feedItemScrollAmount += 1;
                                pushedItems++;
                            }
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
                                card.data = $scope.instagram.data.data[$scope.instagramIndex];
                                $scope.instagramIndex++;
                                postmap.push(card);
                                $scope.feedItemScrollAmount+=1;
                                $scope.splicedItems++;
                                pushedItems++;
                            } else {
                                card.type = 'social-follow';
                            }

                        }
                    });

                    if($scope.sponsors !== null && $scope.sponsorItems.length > 0){
                        if (index > 0 && index %2 === 0) {
                            postmap.push($scope.sponsorItems[$scope.sponsorCount]);
                            $scope.sponsorCount++;
                            $scope.feedItemScrollAmount+=1;
                            pushedItems++;
                        }
                    }

                    postmap.push(item);

                });
            }
            angular.forEach(postmap, function (item, index) {
                if(item.type === 'post-list'){
                    item.post_index = $scope.postIndex;
                    $scope.postIndex++;
                }
                $scope.createFeedItem(item, $scope.feedItems.length);
            });
        }
        if($scope.currentView === 'sponsor' && $scope.sponsors !== null){

            if($scope.sponsors.length > 0) {
                angular.forEach($scope.sponsors, function (item, index) {
                    item.type = 'sponsor';
                    postmap.push(item);
                });
                angular.forEach(postmap, function (item, index) {
                    $scope.createFeedItem(item, $scope.feedItems.length);
                });
            }
        }
        if($scope.currentView === 'post') {
            item = $scope.post[0];


            $scope.singlePostID = item.id;
            item.type = 'post-single';

            item.post_index = $scope.postIndex;
            $scope.postIndex++;

            $scope.createFeedItem(item, $scope.feedItems.length);

            if (item.sponsor !== null) {
                //angular.module('NewsFeed').trackEvent('Sponsored Content', 'View', item.sponsor.title + ' ' + item.id, 1, null);
            }

            FeedService.getPosts($scope.feedPath, '?per_page=' + Number($scope.appConfig.per_page) + '&page=1&post__not_in=' + $scope.post[0].id + offset).then(
                function (data) {
                    $scope.currentView = 'list';
                    $scope.posts = data;
                    var postmap = [];

                    angular.forEach($scope.posts, function (item, index) {
                        item.type = 'post-list';

                        if(Number($scope.appConfig.adsPerPage) > 0){
                            if($scope.isMobile) {
                                if (index === 5) {
                                    var adItem = {};
                                    adItem.type = 'post-half-page';
                                    postmap.push(adItem);
                                    $scope.feedItemScrollAmount += 1;
                                    pushedItems++;
                                }

                                if (index === 3) {
                                    var siteInContentAdItem = {};
                                    siteInContentAdItem.type = 'site-in-content';
                                    postmap.push(siteInContentAdItem);
                                    $scope.feedItemScrollAmount += 1;
                                    pushedItems++;
                                }
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
                                    card.data = $scope.instagram.data.data[$scope.instagramIndex];
                                    $scope.instagramIndex++;
                                    postmap.push(card);
                                    $scope.feedItemScrollAmount+=1;
                                    $scope.splicedItems++;
                                    pushedItems++;
                                } else {
                                    card.type = 'social-follow';
                                }

                            }
                        });

                        if($scope.sponsors !== null && $scope.sponsorItems.length > 0){
                            if (index > 0 && index %2 === 0) {
                                if($scope.sponsorCount <= $scope.sponsorItems.length-1) {
                                    $scope.sponsorItems[$scope.sponsorCount].type = 'sponsor';
                                    postmap.push($scope.sponsorItems[$scope.sponsorCount]);
                                    $scope.sponsorCount++;
                                    $scope.feedItemScrollAmount += 1;
                                    pushedItems++;
                                }
                            }
                        }

                        postmap.push(item);
                    });

                    angular.forEach(postmap, function (item, index) {

                        if(item.type === 'post-list'){
                            item.post_index = $scope.postIndex;
                            $scope.postIndex++;
                        }
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

    $scope.countLines = function(el) {
        var divHeight = el[0].offsetHeight;
        var lineHeight = parseInt(el.css('line-height').replace('px',''));
        return divHeight / lineHeight;
    };

    $scope.renderContent = function(content,index, fromClick){

        //post.html(content);

        var feedItem = angular.element('.feed-item:eq('+ index +')');
        var post = feedItem.find('.post-content');
        var expectedEmbed = post.find('iframe');

        if(content.search('</iframe>') > -1) {
            var pieces = content.split('</iframe></p>');

            var glue = '</iframe></p><script type="text/javascript">var googletag = googletag || {}; googletag.cmd = googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];googletag.cmd.push(function() {var mapping2 = googletag.sizeMapping().addSize([0, 0], [[320, 50], [320, 100]]).addSize([1125, 200], [728, 90]).build();googletag.defineSlot("/110669458/post_companion_leaderboard_728x90", [[728, 90], [320, 50], [320, 100]], "div-gpt-ad-1434127859548-0").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1434127859548-0"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1434127859548-0"); });</script></div>';
            content = pieces.join(glue);
            content += '<div class="post-txt-more">Read More</div>';
        }
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

    $scope.$on('$viewContentLoaded', function(){
        angular.element('#loading-more').hide();
        angular.element('body').find('.sidebar').removeClass('ng-hide');

        if($scope.currentView === 'post'){
            $scope.$on('fbReady', function(){
                angular.element('#commentHook').on('click', function(e){
                    $scope.toggleComments(e);
                });

                if($location.hash() === 'comment') {
                    $scope.toggleComments(null);
                }
            });
        }

        setTimeout(function(){
            angular.element('.pa-share').on('click', function(){
                if(angular.element('.share-icon-wrapper').not('.ng-hide').length >1)
                    angular.element(angular.element('.share-icon-wrapper').not('.ng-hide')[0]).addClass('ng-hide');
            });
            angular.element('body').find('.post-txt-more').on('click', function(e){
                $rootScope.readMore(e);
            });
        },1500);
        if($scope.currentView === 'post') {
            setTimeout(function () {
                var textLines = Math.round(Math.floor($scope.countLines(angular.element('body').find('.ad-post-companion + p'))));
                if (textLines <= 3) {
                    angular.element('body').find('.post-txt-more').remove();
                } else {
                    angular.element('body').find('.ad-post-companion + p').css({'height': '3.85em'});
                }
            }, 250);
        }
        window.addEventListener('scroll', $scope.onScroll);
    });

    $scope.init();

    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedListController;