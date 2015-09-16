'use strict';


var AppController = function($rootScope, $scope, FeedService, envConfig) {

    this.name = 'app';

    $scope.collapseNav = function(){
        if(!angular.element('.navbar-toggle').hasClass('collapsed')){
            angular.element('.navbar-toggle').click();
        }
    };

    $scope.navItems = [];

    $scope.isMobile = function(){
        var mobileUAStr = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|Firefox|MSIE|Opera/i;
        var result = null;

        if ( mobileUAStr.test(navigator.userAgent) ){
            result = mobileUAStr.exec(navigator.userAgent);
            return 'mobile ' + result[0].toLowerCase().replace(' ','-');
        }else if( desktopUAStr.test(navigator.userAgent) ){
            result = desktopUAStr.exec(navigator.userAgent);
            return 'desktop ' + result[0].toLowerCase().replace(' ','-');
        }else{
            return 'unknown';
        }
    };

    $scope.getTerms = function(){
        return FeedService.getTerms('category').then(
            function(data){
                $scope.categories = data;
                $rootScope.$broadcast('categoriesRetrieved', $scope.categories);

            },
            function(error){

            },
            function(notification){

            }
        );
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

    $scope.getNavItems = function(){
        return FeedService.getNavItems().then(
            function(data){
                angular.forEach(data, function (item, index) {
                    item.slug = item.url.substring(item.url.lastIndexOf('category/')+9, item.url.length).replace('/','');
                    $scope.navItems.push(item);
                });
            },
            function(error){

            },
            function(notification){

            }
        );
    };

    $scope.getTerms();
    $scope.getNavItems();

    $scope.addUploadBtn = function(){

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

};

module.exports = AppController;