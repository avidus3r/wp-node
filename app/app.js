'use strict';

var angular     = require('angular'),
    mongoose    = require('mongoose'),
    jQuery      = window.jQuery;


//Angular Dependencies
require('ng-infinite-scroll');
require('../assets/js/angular-metatags.min');

var env = 'stage';

if(/stage/i.test(window.location.hostname)){
    env = 'stage';
}
if(/dev/i.test(window.location.hostname)){
    env = 'dev';
}

var host = window.location.host;

var appName = host.substring(0,host.indexOf('.'));
var config = null;
var feedConfig = null;
var appConfig = null;

switch(appName){
    case 'altdriver':
        config = {
            app: {
                name: 'altdriver',
                title: 'alt_driver',
                per_page:'12',
                prefetch_at:'8',
                scroll_amount:'6',
                fb_appid:'638692042912150',
                ga:'UA-66153561-1'
            },
            env: {
                prod: {
                    remoteUrl: 'http://www.altdriver.com',
                    basePath: '/wp-json/wp/v2/'
                },
                stage:{
                    remoteUrl: 'http://altdriver.staging.wpengine.com',
                    basePath: '/wp-json/wp/v2/'
                },
                dev:{
                    remoteUrl: 'http://devaltdriver.wpengine.com',
                    basePath: '/wp-json/wp/v2/'
                }
            }
        };
        break;
    case 'driversenvy':
        config = {
            app: {
                name: 'driversenvy',
                title: 'Driver\'s Envy',
                per_page:'12',
                prefetch_at:'8',
                scroll_amount:'6',
                fb_appid:'638692042912150'
            },
            env: {
                prod: {
                    remoteUrl: 'http://driversenvy.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                },
                stage:{
                    remoteUrl: 'http://driversenvy.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                },
                dev:{
                    remoteUrl: 'http://driversenvy.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                }
            }
        };
        break;
    case 'upshift':
        config = {
            app: {
                name: 'upshift',
                title: 'UPSHIFT',
                per_page:'12',
                prefetch_at:'8',
                scroll_amount:'6',
                fb_appid:'638692042912150'
            },
            env: {
                prod: {
                    remoteUrl: 'http://upshift.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                },
                stage:{
                    remoteUrl: 'http://upshift.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                },
                dev:{
                    remoteUrl: 'http://upshift.altdrivermedia.com',
                    basePath: '/wp-json/wp/v2/'
                }
            }
        };
        break;
}

feedConfig = config.env;
appConfig = config.app;

//Controllers
var Controllers = require('./app.controllers');

//Directives
var Directives = require('./app.directives');

//Services
var FeedService = require('./services/FeedService');
var InstagramService = require('./services/InstagramService');
var AppConfigService = require('./services/AppConfigService');

//Routes
var Router = require('./app.routes');

//Models
//var Post = mongoose.model('Post');
//var Posts = require('./models/post');

//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'infinite-scroll', 'metatags']);


/*
 * Module Configuration
 */

NewsFeed.run(function(MetaTags, $rootScope, FeedService, $routeParams, $sce){
    MetaTags.initialize();

    $rootScope.orientation = null;

    if(!localStorage.getItem('post_offset') || localStorage.getItem('post_offset') === 'null'){
        localStorage.setItem('post_offset', 0);
    }

    $rootScope._isMobile = function(){
        var mobileUAStr = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|Firefox|MSIE|Opera/i;

        if ( mobileUAStr.test(navigator.userAgent) ){
            return true;
        }else if( desktopUAStr.test(navigator.userAgent) ){
            return false;
        }else{
            return true;
        }
    };

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

    $rootScope.gaID = appConfig.ga;
    $rootScope.app = appConfig;

    $rootScope.getOrientation = function(){
        if(!$rootScope.orientation){
            $rootScope.orientation = (window.outerWidth > window.outerHeight) ? 'landscape' : 'portrait';
        }
        return $rootScope.orientation;
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

        //@ltDr1v3r!
        var voteButton = angular.element($event.currentTarget);
        var votedHistory = null;

        if(typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null') {
            votedHistory = JSON.parse(localStorage.getItem('user_voted'));
        }
        voteButton.addClass('voted');
        var upOrDown = voteButton.attr('name');
        var voteVal = upOrDown === 'up' ? 2 : 1;

        angular.module('NewsFeed').trackEvent('voting', 'click', postID + ' - ' + upOrDown, 1, null);
        $event.preventDefault();

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
        var count = null;

        if(upOrDown === 'up'){
            count = voteCount === 0 ? 1 : parseInt(voteCount)+1;
        }else{
            count = parseInt(voteCount)-1;
        }

        voteButton.closest('.post-actions').find('.vote-count').text(count);
        voteButton.parent().find('button').attr('disabled','disabled');

        var req = FeedService.vote(postID, voteVal);
        req.addEventListener('load', function () {
            var result = this.responseText;
        });

        if(voteButton.closest('.post-actions').find('.vote-count').text() === '1'){
            voteButton.closest('.post-actions').find('.pointsTxt').text('point');
        }else{
            voteButton.closest('.post-actions').find('.pointsTxt').text('points');
        }
    };

    $rootScope.commentBtnHandler = function($event, $index, urlParams){
        if($routeParams === urlParams){
            $rootScope.$broadcast('toggleComments');
        }else{
            angular.module('NewsFeed').trackEvent('postactions:comments','click',urlParams.slug,1,null);
            urlParams.slug = urlParams.slug + '#comment';
            $rootScope.goToPage($event, $index, urlParams);
        }
    };

    $rootScope.goToPage = function($event, $index, linkParams){
        var page = typeof linkParams === 'object' ? '/' + linkParams.category + '/' + linkParams.slug : linkParams;
        var postOffset = $index === 0 ? 0 : $index;
        localStorage.setItem('post_offset', postOffset);
        window.location.href = page;
    };

    $rootScope.goToCategory = function(category){
        //$scope.collapseNav();
        angular.module('NewsFeed').trackEvent('navigation.category', 'click', category, 1, null);
        window.location.href = '/' + category;
    };

    $rootScope.getSMSLink = function(link){
        return $rootScope.isMobile().indexOf('ios') > -1 ? 'sms:&body='+link : 'sms:?body='+link;
    };

    $rootScope.getTrusted = function(val){
        return $sce.trustAsHtml(val);
    };

    $rootScope.search = function(){
        window.location.href = '/search/' + encodeURIComponent(angular.element('input[name="s"]').val());
    };

    if(/mobile/i.test($rootScope.isMobile())){
        window.addEventListener('resize',function(e){
            $rootScope.orientation = (e.currentTarget.outerWidth > e.currentTarget.outerHeight) ? 'landscape' : 'portrait';
            angular.element('body').removeClass('landscape portrait').addClass($rootScope.orientation);
        }, false);
    }

    $rootScope.shareItemClick = function($event, slug){
        angular.module('NewsFeed').trackEvent('postactions:share:' + angular.element($event.currentTarget).attr('class'),'click',slug,1,null);
    };

    $rootScope.shareClick = function($event, slug){
        if(angular.element($event.currentTarget).closest('.post-actions').find('.share-icon-wrapper').hasClass('ng-hide')){

            angular.element($event.currentTarget).closest('.post-actions').find('.share-icon-wrapper').removeClass('ng-hide');
            angular.module('NewsFeed').trackEvent('postactions:share:open','click',slug,1,null);
        }else{
            angular.element($event.currentTarget).closest('.post-actions').find('.share-icon-wrapper').addClass('ng-hide');
            angular.module('NewsFeed').trackEvent('postactions:share:close','click',slug,1,null);
        }
        var shareTop = angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').height() + angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').offset().top;
        if( shareTop > (window.innerHeight+window.scrollY)){
            var diff = angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').offset().top - window.innerHeight;
            var s = window.scrollY + angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').height()+10;
            window.scrollTo(0,s);
        }
    };

    $rootScope.trackEvent = function(eventCategory, eventAction, eventLabel, eventValue, fieldsObject){
        angular.module('NewsFeed').trackEvent(eventCategory, eventAction, eventLabel, eventValue, fieldsObject);
    };

    $rootScope.getFeaturedImage = function(img, attr){
        var attrs = {'src': 0, 'width': 1, 'height': 2};

        if(/ios/i.test($rootScope.isMobile())){
            return img.large[attrs[attr]];
        }
        else if(/mobile/i.test($rootScope.isMobile())){
            return img.medium[attrs[attr]];
        }
        else if(/desktop/i.test($rootScope.isMobile())){
            return img.original[attrs[attr]];
        }
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


NewsFeed.factory('AppConfigService', ['$http', '$q', AppConfigService]);

NewsFeed.provider('AppConfigServiceProvider',function(){
    return {
        $get: function(){
            return AppConfigService;
        }
    }
});


NewsFeed.constant('env', env);
NewsFeed.constant('envConfig', feedConfig);


NewsFeed.config(
    ['$routeProvider', '$locationProvider', 'MetaTagsProvider', 'FeedServiceProvider', 'InstagramServiceProvider', 'env', '$compileProvider', Router]
);

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
    ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', 'data', 'envConfig', Controllers.FeedCategoryController]
);

NewsFeed.controller(
    'FeedListController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'envConfig', Controllers.FeedListController]
);

NewsFeed.controller(
    'PostsController',
    ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'envConfig', Controllers.PostsController]
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