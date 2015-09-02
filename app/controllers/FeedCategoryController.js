'use strict';

var FeedCategoryController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $stateParams, $state, envConfig) {

    this.name = 'category';
    this.params = $routeParams;

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
    $scope.category = null;

    FeedService.getTerms('category').then(
        function(data){
            $scope.categories = data;
        },
        function(error){    

        },
        function(notification){

        }
    );

    $scope.$on('categoriesRetrieved', function(event, categories){
        angular.forEach(categories, function (category, index) {
            if(category.slug === $routeParams.category){
                $rootScope.$broadcast('categoryLoaded', category);
            }
        });
    });

    $scope.$on('categoryLoaded', function(event, category){
        $scope.category = category;
        // Standard meta
        $rootScope.metatags.title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.description = $scope.category.description;

        // Facebook meta
        $rootScope.metatags.fb_type = 'object';
        $rootScope.metatags.fb_title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.fb_description = $scope.category.description;
        $rootScope.metatags.fb_url = $scope.category.link;
        $rootScope.metatags.fb_image = 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png';

        // Twitter meta
        $rootScope.metatags.tw_card = 'summary_large_image';
        $rootScope.metatags.tw_title = $scope.category.name + ' Archives - alt_driver';
        $rootScope.metatags.tw_description = $scope.category.description;
        window.NewsFeed.metatags = $rootScope.metatags;
    });

    $scope.initMeta = function(){

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


    var postPath = 'posts?';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
    var isSingle = $stateParams.hasOwnProperty('slug');
    //var postParams = !isSingle ? '&category_name=' + $routeParams.category : '&name=' + $routeParams.slug;
    var postParams = 'category_name=' + $routeParams.category;
    var posts = null;

    posts = FeedService.getPosts(postPath, postParams + pagingParams);

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
            $scope.add($scope.feedItems[index]);
        }
    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
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
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        if($scope.feedItemPosition-1 === 0) return false;
        if($scope.currentView === 'single') return false;

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

            if($location.$$path.indexOf(category.slug) > -1){
                cat = category;
            }

        });

        return cat;
    };

    $scope.renderContent = function(content, index, fromClick){
        var feedItem = angular.element('.feed-item:eq('+ index +')');
        var post = feedItem.find('.post-content');
        var self = this;

        if(!fromClick) post.html(content.rendered);
        history.pushState({page: 'home'}, feedItem.title, '/' + $scope.feedItemElements[index].category[0].slug + '/');


        /*if(fromClick) {

            $scope.addSingle(content, index);

            var touchStart = null;
            var bottom = null;

            var onTouchMove = function (e) {
                console.log('touchmove');
                if(touchStart - e.touches[0].clientY >= 30){
                    post.closest('.post-view-type').find('.category').show();
                    angular.element('.feed-item').show();



                    angular.element('.single.current').fadeTo('fast',0, function(){

                    });

                    angular.element('.single.current').animate({height:'0'}, 'fast', function(e){
                        post.closest('.post-view-type').find('.category').show();
                        angular.element('.feed-item').show();


                        angular.element('.single.current').remove();

                        window.removeEventListener('scroll', onSingleScroll);
                        window.removeEventListener('touchstart', onTouchStart);
                        window.removeEventListener('touchmove', onTouchMove);
                    });
                }
            };

            var onTouchStart = function(e) {
                console.log('touch start');
                touchStart = e.touches[0].clientY;

                window.addEventListener('touchmove', onTouchMove);
            };

            var onSingleScroll = function(e){
                console.log('onscroll');
                if( (angular.element(window).scrollTop()+angular.element(window).height()) === angular.element(document).height() ){
                    window.addEventListener('touchstart', onTouchStart);
                }
            };



            //window.addEventListener('scroll', onSingleScroll);

        }*/


    };

    $scope.changeView = function($stateOptions){
        $state.go('single', $stateOptions, {reload:true});
    };

    $scope.addSingle = function(content, index){

        var wrapper = angular.element('.wrapper');
        var feedItem = angular.element('.feed-item:eq('+ index +')');
        //angular.element('.feed-item:not(:eq('+ index +'))').hide();

        var post = feedItem.find('.post-content');
        $scope.currentY = window.scrollY;

        $scope.currentView = 'single';

        angular.element(window).scrollTop(0);


        angular.element('#scroll-container').attr('infinite-scroll-disabled','true');
        //wrapper.css({visibility:'hidden'});
        //angular.element('body').css({ overflow:'hidden' });


        var authorMetaEl = '<div class="author-meta"><div class="left"><span class="light-grey">By</span>' + $scope.feedItemElements[index].author_meta.name + '</div><div class="right" ng-bind-html="item.category[0].name">' + $scope.feedItemElements[index].category[0].name + '</div><span class="clearfix"></span></div>';
        var shareFooter = '<div class="share-footer"><button type="button" class="btn glyphicon glyphicon-chevron-up"></button><button type="button" class="btn glyphicon glyphicon-chevron-down"></button><button type="button" class="btn glyphicon glyphicon-comment"></button><button type="button" class="btn btn-primary right glyphicon glyphicon-share-alt share"></button></div>';

        var singleContentHeaderEl = angular.element('<h2/>').attr({class:'post-title'}).html($scope.feedItemElements[index].title.rendered);
        var singleContentEl = angular.element('<div/>')
            .attr({class:'post-content'})
            .css({ overflow:'auto', margin:'0 auto' })
            .html(content.rendered)
            .prepend(shareFooter)
            .prepend(authorMetaEl)
            .prepend(singleContentHeaderEl);

        var singleEl = angular.element('<div/>')
            .attr({class:'single current'})
            .css( {width: post.width()+'px', 'margin-left': -(post.width()/2)+'px'} )
            .append(singleContentEl);

        var backButton = angular.element('<button/>').attr({class:'btn btn-primary back', type: 'button'}).text('back').on('click', function(e){ $scope.removeSingle(e, index) });


        singleEl.append(backButton);
        wrapper.parent().append(singleEl);
        wrapper.hide();
        var expectedEmbed = singleEl.find('.post-content p').first();
        if(angular.element(expectedEmbed).find('iframe').length > 0){
            expectedEmbed.addClass('video-container');
            $scope.resizeEmbed(expectedEmbed);
        }

        $scope.changePage(index);
    };

    $scope.resizeEmbed = function(embed){

        var iframe = angular.element(embed).find('iframe')[0];

        var maxWidth = iframe.closest('.single.current').width(); // Max width for the image
        var maxHeight = 10000;    // Max height for the image
        var ratio = 0;  // Used for aspect ratio

        var width = iframe.width;    // Current image width
        var height = iframe.height;  // Current image height


        // Check if the current width is larger than the max
        if(width > maxWidth){
            console.log(maxWidth, width,height);
            ratio = maxWidth / width;   // get ratio for scaling image
            angular.element(iframe).css('width', maxWidth); // Set new width
            angular.element(iframe).css('height', height * ratio);  // Scale height based on ratio
            height = height * ratio;    // Reset height to match scaled image
            width = width * ratio;    // Reset width to match scaled image
        }

        // Check if current height is larger than max
        if(height > maxHeight){
            ratio = maxHeight / height; // get ratio for scaling image
            angular.element(iframe).css('height', maxHeight);   // Set new height
            angular.element(iframe).css('width', width * ratio);    // Scale width based on ratio
            width = width * ratio;    // Reset width to match scaled image
            height = height * ratio;    // Reset height to match scaled image
        }

    };

    $scope.removeSingle = function(e, index){
        angular.element(e.currentTarget).closest('.single.current').remove();
        $scope.currentView = 'feed';

        //angular.element('.wrapper').css({visibility:'visible'});
        //angular.element('body').css({ overflow:'auto' });
        angular.element('.wrapper').show();
        angular.element('#scroll-container').attr('infinite-scroll-disabled','false');
        var stateObj = {pagePos: index};

        history.pushState(stateObj, index, '/' + $scope.feedItemElements[index].category[0].slug);
        window.scrollTo(0,$scope.currentY);

    };

    $scope.changePage = function(index){
        var newFeedItem = $scope.feedItems[index];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
    };

};

module.exports = FeedCategoryController;