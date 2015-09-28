'use strict';

var angular = require('angular');

//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

var env = 'dev';

var feedConfig = {
    'prod': {
        remoteUrl: 'http://www.altdriver.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    },
    'dev':{
        remoteUrl: 'http://devaltdriver.wpengine.com',
        basePath: '/wp-json/wp/v2/',
        site: 'altdriver'
    }
};

//Controllers
var Controllers = require('./app.controllers');

//Directives
var Directives = require('./app.directives');

//Services
var FeedService = require('./services/FeedService');
var InstagramService = require('./services/InstagramService');

//Routes
var Router = require('./app.routes');


//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', 'metatags']);


/*
 * Module Configuration
 */

NewsFeed.run(function(MetaTags, $rootScope, FeedService, $routeParams, $sce){
    MetaTags.initialize();
    $rootScope.isMobile = function(){
        var mobileUAStr = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|Firefox|MSIE|Opera/i;
        var result = null;

        if ( mobileUAStr.test(navigator.userAgent) ){
            result = mobileUAStr.exec(navigator.userAgent);
            var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios ' : '';
            return ios + 'mobile ' + result[0].toLowerCase().replace(' ','-');
        }else if( desktopUAStr.test(navigator.userAgent) ){
            result = desktopUAStr.exec(navigator.userAgent);
            return 'desktop ' + result[0].toLowerCase().replace(' ','-');
        }else{
            return 'unknown';
        }
    };

    //$rootScope.lastIndex = 0;

    $rootScope.decodeHtml = function(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    $rootScope.voteLoad = function(postID, index){
        var voteButton = angular.element('.votes:eq(' + index + ')').find('button');
        var votedHistory = null;

        if(typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null'){
            votedHistory = JSON.parse(localStorage.getItem('user_voted'));
            angular.forEach(votedHistory, function (item, index) {
                if(item.postID === postID){
                    var userVoted = item.voted;
                    setTimeout(function(){
                        var votedOn = angular.element('.view-container').find('#votes-' + item.postID).find('button');
                        votedOn.parent().find('button[name="' + userVoted + '"]').addClass('voted');
                        votedOn.attr('disabled','disabled');
                        return false;
                    },50);
                }
            });
        }
    };

    $rootScope.vote = function(postID, vote, $event){
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
        var voteCount = voteButton.closest('.post-actions').find('.vote-count').text();
        var count = voteCount === 0 ? 1 : parseInt(voteCount)+1;

        voteButton.closest('.post-actions').find('.vote-count').text(count);
        voteButton.parent().find('button').attr('disabled','disabled');

        var req = FeedService.vote(postID, voteVal);
        req.addEventListener('load', function () {
            var result = this.responseText;
        });
    };

    $rootScope.commentBtnHandler = function($event, $index, urlParams){
        if($routeParams === urlParams){
            $rootScope.$broadcast('toggleComments');
        }else{
            urlParams.slug = urlParams.slug + '#comment';
            $rootScope.goToPage($event, $index, urlParams);
        }
    };

    $rootScope.goToPage = function($event, $index, linkParams){
        //localStorage.setItem('post_offset', JSON.stringify({offset: $index}));
        window.location.href = '/' + linkParams.category + '/' + linkParams.slug;
    };

    $rootScope.getSMSLink = function(link){
        return $rootScope.isMobile().indexOf('ios') > -1 ? 'sms:&body='+link : 'sms:?body='+link;
    };

    $rootScope.getTrusted = function(val){
        return $sce.trustAsHtml(val);
    };
});

NewsFeed.factory(
    'FeedService',
    ['envConfig', 'env', '$http', '$q', FeedService]
);

NewsFeed.provider('FeedServiceProvider',function(){
    return {
        $get: function(){
            return FeedService;
        }
    }
});

NewsFeed.factory('InstagramService', ['$http', '$q', InstagramService]);

NewsFeed.provider('InstagramServiceProvider',function(){
    return {
        $get: function(){
            return InstagramService;
        }
    }
});

NewsFeed.config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', 'FeedServiceProvider', '$compileProvider', Router]
);

NewsFeed.constant('env', env);
NewsFeed.constant('envConfig', feedConfig);

/*
 * Module Configuration
 */


/*
 * Module Controllers
 */
NewsFeed.controller(
    'HeaderController',
    ['$rootScope', '$scope', 'FeedService', 'envConfig', Controllers.HeaderController]
);

NewsFeed.controller(
    'PageController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', 'envConfig', Controllers.PageController]
);


NewsFeed.controller(
    'FeedSingleController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'envConfig', '$sce', Controllers.FeedSingleController]
);

NewsFeed.controller(
    'FeedCategoryController',
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'envConfig', 'categories', Controllers.FeedCategoryController]
);

NewsFeed.controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'posts', 'envConfig', Controllers.FeedListController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */

NewsFeed.directive('card', Directives.card);

/*
 * Module Directives
 */


window.onerror = function(){
    console.error(arguments);
};

//window.NewsFeed = NewsFeed;