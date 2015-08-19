'use strict';

var FeedCategoryController = function($scope, FeedService, $route, $routeParams, $location, $stateParams, $state) {

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
    $scope.currentView = 'list';

    var postPath = 'posts?_jsonp=JSON_CALLBACK';
    var pagingParams = '&per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;
    var isSingle = $stateParams.hasOwnProperty('slug');
    //var postParams = !isSingle ? '&category_name=' + $routeParams.category : '&name=' + $routeParams.slug;
    var postParams = '&category_name=' + $stateParams.category;
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
        console.log($scope.feedItemPosition);
        $scope.feedItemPosition += 1;
    };

    $scope.getNext = function(){
        console.log($scope);
        if($scope.currentView === 'single') return false;
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
        console.log(itemPosition,i,count);
        if(itemPosition % count === 0){
            while(i < (itemPosition+count)){
                console.log(i);
                $scope.add($scope.feedItems[i]);
                i += 1;
            }
        }
    };

    $scope.renderContent = function(content, index, fromClick){
        var feedItem = angular.element('.feed-item:eq('+ index +')');
        var post = feedItem.find('.post-content');

        if(!fromClick) post.html(content.rendered);

        /*if(index >= 5){
            angular.element('.feed-item:eq('+ (index-5) +')').find('iframe').remove();
        }*/
        if(fromClick) {
            var currentY = window.scrollY;
            $scope.currentView = 'single';
            angular.element('.feed-item:not(.feed-item:eq('+ index +'))').hide();
            var postTop = post.offset().top;
            window.scrollTo(0,Math.floor(currentY+postTop-20));

            post.closest('.post-view-type').find('.category').hide();

            var authorMetaEl = '<div class="author-meta"><div class="left"><span class="light-grey">By</span>' + $scope.feedItemElements[index].author_meta.name + '</div><div class="right" ng-bind-html="item.category[0].name">' + $scope.feedItemElements[index].category[0].name + '</div><span class="clearfix"></span></div>';

            var singleContentHeaderEl = angular.element('<h2/>').attr({class:'post-title'}).text($scope.feedItemElements[index].title.rendered);
            var singleContentEl = angular.element('<div/>')
                .attr({class:'post-content'})
                .html(content.rendered)
                .prepend(authorMetaEl)
                .prepend(singleContentHeaderEl);

            var singleEl = angular.element('<div/>').attr({class:'single current'}).append(singleContentEl);
            feedItem.append(singleEl);
            var expectedEmbed = singleEl.find('.post-content p').first();
            if(angular.element(expectedEmbed).find('iframe').length > 0){
                expectedEmbed.addClass('video-container');
            }

            $scope.changePage(index);

            var touchStart = null;
            var bottom = null;

            var onTouchMove = function (e) {
                if(touchStart - e.touches[0].clientY >= 30){

                    angular.element('.single.current').animate({top:'-100%'}, 500, function(e){
                        post.closest('.post-view-type').find('.category').show();
                        angular.element('.feed-item').show();


                        angular.element('.single.current').remove();
                        window.scrollTo(0,currentY);
                        window.removeEventListener('scroll', onSingleScroll);
                        window.removeEventListener('touchstart', onTouchStart);
                        window.removeEventListener('touchmove', onTouchMove);
                    });
                }
            };

            var onTouchStart = function(e) {
                touchStart = e.touches[0].clientY;

                window.addEventListener('touchmove', onTouchMove);
            };

            var onSingleScroll = function(e){
                if( (angular.element(document).height()-window.scrollY) === angular.element('.single.current').height() ){
                    window.addEventListener('touchstart', onTouchStart);
                }
            };
            window.addEventListener('scroll', onSingleScroll);

        }


    };

    $scope.changePage = function(index){
        $state.go('category.single');
        /*var newFeedItem = $scope.feedItems[index];
        var newSlug = '/'+ newFeedItem.category[0].slug + '/' + newFeedItem.slug;
        var stateObj = {page: newSlug};
        history.pushState(stateObj, newFeedItem.title, newSlug);
        var lastRoute = $route.current;
        $scope.$on('$locationChangeSuccess', function(event) {
            $route.current = lastRoute;
        });*/
    };

};

module.exports = FeedCategoryController;