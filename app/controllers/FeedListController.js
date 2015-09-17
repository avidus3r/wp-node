'use strict';

var FeedListController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, envConfig) {

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
    $scope.feedItemScrollAmount = 5;
    $scope.postPrefetchAt = 10;
    $scope.postsPerPage = 25;
    $scope.pageNumber = 1;
    $scope.currentView = 'list';
    $scope.currentY = null;
    $scope.cardType = 'email';

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

    $scope.getCardType = function(){
        var cardType = $scope.cardType === 'email' ? 'follow' : 'email';
        console.log(cardType);
        $scope.cardType = cardType;
        return $scope.cardType;
    };

    $scope.postPath = 'posts';
    $scope.postParams = '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber;

    $scope.getPosts = function(){
        return FeedService.getPosts($scope.postPath, $scope.postParams).then(
            function(data){ //success
                angular.forEach(data, function (item, index) {
                    $scope.createFeedItem(item, $scope.feedItems.length);
                });
            },
            function(reason){   //error
                console.error('Failed: ', reason);
            },
            function(update) {  //notification
                alert('Got notification: ' + update);
            }
        );
    };

    $scope.posts = $scope.getPosts();

    $scope.createFeedItem = function(item,index){
        $scope.feedItems.push(item);
        if(index < $scope.feedItemScrollAmount){
            $scope.feedItemElements.push($scope.feedItems[index]);
            $scope.feedItemPosition += 1;
        }
    };

    $scope.add = function(item){
        $scope.feedItemElements.push(item);
        if($scope.feedItemPosition % $scope.postPrefetchAt === 0){
            $scope.pageNumber += 1;
            FeedService.getPosts($scope.postPath, '?per_page=' + $scope.postsPerPage + '&page=' + $scope.pageNumber)
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

    $scope.getSubmit = function(){

        angular.element('#submitPage').css({'overflow':'hidden'});
        var iframeEl = angular.element('#submitPage').find('iframe');
        iframeEl.css({'margin-top':'-50px', 'border':'none'});
        var iframe = document.querySelector('#submitIframe');

        setTimeout(function(){

            iframe.contentWindow.postMessage('hi','http://devaltdriver.wpengine.com');
            iframeEl.css({'margin-top':'0px'});
            angular.element('.view-container').height(angular.element(iframe).height());
        },3000);

        angular.element('.view-container').css({'height':'100%'});
        angular.element('#submitPage').css({'height':'100%', 'padding':'0'});
        angular.element('html').css({'height':'100%'});
        angular.element('body').css({'height':'100%'});

        angular.element('#submitPage').find('iframe').contents().find('#wpadminbar').hide();
        angular.element('#submitPage').find('iframe').contents().find('#main-head').hide();

        /*FeedService.getPage('submit').then(function(res){
         angular.element('#submitPage').find('.content').html(res[0].content.rendered);
         angular.element('#submitPage').find('.content').find('form').attr('action','/submit');
         angular.element('#submitPage').find('.content').find('form').append('<input type="hidden" name="remoteHost" value="' + envConfig.remoteUrl + '/submit">');
         });*/
    };

    $scope.voteLoad = function(postID, index){
        var voteButton = angular.element('.votes:eq(' + index + ')').find('button');
        var votedHistory = null;
        if(typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null'){
            votedHistory = JSON.parse(localStorage.getItem('user_voted'));
            angular.forEach(votedHistory, function (item, index) {
                if(item.postID === postID){
                    var userVoted = item.voted;
                    console.log(userVoted);
                    voteButton.parent().find('button[name="' + userVoted + '"]').addClass('voted');
                    voteButton.attr('disabled','disabled');
                    return false;
                }
            });
        }
    };

    $scope.vote = function(postID, vote, $event){
        $event.preventDefault();
        var voteButton = angular.element($event.currentTarget);
        var votedHistory = null;

        if(typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null') {
            votedHistory = JSON.parse(localStorage.getItem('user_voted'));
        }
        voteButton.addClass('voted');
        var upOrDown = voteButton.attr('name');
        var voteVal = upOrDown === 'up' ? 2 : 1;

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
        var voteCount = voteButton.parent().find('.vote-count').text();
        var count = voteCount === '' ? 1 : parseInt(voteCount)+1;
        voteButton.parent().find('.vote-count').text(count);
        voteButton.parent().find('button').attr('disabled','disabled');

        var req = FeedService.vote(postID, voteVal);
        req.addEventListener('load', function () {
            var result = this.responseText;
            console.log(result);
        });
    };

    $scope.commentBtnHandler = function($event, $index, urlParams){
        if($routeParams === urlParams){
            $scope.$broadcast('toggleComments');
        }else{
            urlParams.slug = urlParams.slug + '#comment';
            $scope.goToPage($event, $index, urlParams);
        }
    };

    $scope.goToPage = function($event, $index, linkParams){
        window.location.href = '/' + linkParams.category + '/' + linkParams.slug;
    };

    $scope.receiveMessage = function(event){
        if(typeof event.data === 'string') {
            if (event.data.search('action=plugin_ready') > -1) {
                $scope.$emit('fbReady');
            }
        }
    };

    window.addEventListener('message', $scope.receiveMessage);

};

module.exports = FeedListController;