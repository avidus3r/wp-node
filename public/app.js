'use strict';

var angular = require('angular'),
    jQuery = window.jQuery,
    env = null,
    host = null,
    appName = null;

//Angular Dependencies
require('./vendor/angular-metatags.min');
require('./config/config');

function getQueryParamValue(variable) {

    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function init() {
    env = 'prod';
    host = window.location.host;

    //appName = localStorage.getItem('appName');

    if (!appName) {
        appName = host.substring(0, host.lastIndexOf('.com'));

        if (appName.indexOf('local.') > -1 || appName.indexOf('beta.') > -1 || appName.indexOf('www.') > -1) {
            appName = appName.replace(appName.substring(0, appName.indexOf('.') + 1), '');
        }
    }

}

window.onerror = function(errorMessage, errorScript, lineNumber, columnNumber, error) {
    console.error(errorMessage, errorScript, lineNumber, columnNumber, error);
};

init();

//Main Module
var NewsFeed = angular.module('NewsFeed', [require('angular-route'), require('angular-sanitize'), require('angular-resource'), 'metatags', 'NewsFeed.config']);


/*
 * Module Configuration
 */
// Routes
var Router = require('./config/app.routes.js');

// Constants
NewsFeed.constant('env', env);
NewsFeed.constant('appName', appName);

NewsFeed.config(
    ['$routeProvider', '$resourceProvider', '$locationProvider', 'MetaTagsProvider', 'FeedServiceProvider', 'InstagramServiceProvider', 'env', 'app', 'appName', '$compileProvider', Router]
);
/*
 * Module Configuration
 */


/*
 * Module Services
 */
//Services
var Services = require('./services/app.services');
var FeedService = Services.FeedService;
var InstagramService = Services.InstagramService;

NewsFeed.factory('FeedService', ['app', 'appName', 'env', '$http', '$q', FeedService]);
NewsFeed.provider('FeedServiceProvider', function() {
    return {
        $get: function() {
            return FeedService;
        }
    }
});

NewsFeed.factory('InstagramService', ['$http', '$q', InstagramService]);
NewsFeed.provider('InstagramServiceProvider', function() {
    return {
        $get: function() {
            return InstagramService;
        }
    }
});
/*
 * Module Services
 */



/*
 * Module Controllers
 */
//Controllers
var Controllers = require('./controllers/app.controllers.js');

NewsFeed.controller(
    'HeaderController', ['$rootScope', '$scope', 'FeedService', 'app', Controllers.HeaderController]
);

NewsFeed.controller(
    'PageController', ['$rootScope', '$scope', 'FeedService', '$route', '$routeParams', '$location', '$sce', 'app', Controllers.PageController]
);

NewsFeed.controller(
    'FeedListController', ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'app', 'appName', '$sce', '$q', Controllers.FeedListController]
);

NewsFeed.controller(
    'CategoryController', ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'app', 'appName', '$sce', '$q', Controllers.CategoryController]
);

NewsFeed.controller(
    'HomeController', ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'app', 'appName', '$sce', '$q', Controllers.HomeController]
);

NewsFeed.controller(
    'PostsController', ['$rootScope', '$scope', 'FeedService', 'InstagramService', '$route', '$routeParams', '$location', 'data', 'app', Controllers.PostsController]
);

/*
 * Module Controllers
 */


/*
 * Module Directives
 */
//Directives
var Directives = require('./directives/app.directives.js');

NewsFeed.directive('card', Directives.card);
NewsFeed.directive('instagram', ['InstagramService', Directives.instagram]);
NewsFeed.directive('cardlist', ['FeedService', '$rootScope', '$sce', Directives.cardlist]);
NewsFeed.directive('pubad', ['$rootScope', 'app', Directives.pubad]);
NewsFeed.directive('gtm', ['$rootScope', 'app', Directives.gtm]);
//NewsFeed.directive('toast', ['$rootScope', 'app', Directives.toast]);

/*
 * Module Directives
 */

//run
NewsFeed.run(function(MetaTags, $rootScope, FeedService, $routeParams, $sce, app) {
    MetaTags.initialize();

    var feedConfig = app.env;
    var appConfig = app;
    $rootScope.appConfig = app;
    $rootScope.orientation = null;
    $rootScope.gptAdSlots = [];
    $rootScope.adKeyPairs = [];
    $rootScope.gptReady = null;
    $rootScope.readyInterval = null;
    $rootScope.adsEnabled = true;
    $rootScope.browserHeight = document.documentElement.clientWidth;
    // $rootScope.toastHide= false;
    $rootScope.platform = _isMobile() ? 'mobile' : 'desktop';
    $rootScope.year = new Date().getFullYear();

    $rootScope.currentCategory = null;

    if (location.pathname === '/articles') {
        $rootScope.adsEnabled = false;
    } else {
        $rootScope.adsEnabled = true;
    }

    if (location.href.indexOf('local.') > -1) {
        $rootScope.displayAds = false;
    }
    $rootScope.displayAds = true;
    try {

        if (!localStorage.getItem('post_offset') || localStorage.getItem('post_offset') === 'null' || localStorage.getItem('post_offset') === 'undefined') {
            localStorage.setItem('post_offset', 0);
        }
    } catch (e) {

    }

    $rootScope.isHome = function() {
        return location.pathname === '/';
    };

    $rootScope.isCategory = function() {
        return location.href.indexOf('/category/') > -1;
    };

    $rootScope.getCategory = function(categories, permalink, item) {
        var cat = null;
        var catParent = null;

        if(typeof categories === 'undefined'){
            var categories = [];
            categories[0] = {slug:item.type};
        }

        /*angular.forEach(categories, function (category, index) {
         if(category.slug.replace('-','') === appName){
         catParent = category.term_id;
         }
         });*/

        /*angular.forEach(categories, function(category, index) {
            if (catParent) {
                if (category.parent === catParent) {
                    cat = category;
                }
            }
            if (permalink.indexOf(category.slug) > -1) {
                cat = category;
            }
        });*/

        cat = categories[0];

        return cat;
    };

    $rootScope.readMore = function($el) {
        var openHeight = 'auto';
        var closedHeight = null;
        if (!angular.element('.ad-post-companion + p').hasClass('reading')) {
            closedHeight = angular.element('.ad-post-companion + p').css('height');
            angular.element('.ad-post-companion + p').addClass('reading');
            angular.element('.ad-post-companion + p').css({
                'height': openHeight
            });
            angular.element($el.currentTarget).remove();
        }
    };

    $rootScope._isMobile = function() {
        var mobileUAStr = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|iPad|Firefox|MSIE|Opera/i;

        if (mobileUAStr.test(navigator.userAgent)) {
            return true;
        } else if (desktopUAStr.test(navigator.userAgent)) {
            return false;
        } else {
            return true;
        }
    };

    $rootScope.getAppPath = function() {
        return appName + '/';
    };



    $rootScope.isMobile = function() {
        var mobileUAStr = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|iPad|Firefox|MSIE|Opera/i;
        var result = null;



        if (mobileUAStr.test(navigator.userAgent)) {
            result = mobileUAStr.exec(navigator.userAgent);
            var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios ' : '';
            return ios + 'mobile ' + result[0].toLowerCase().replace(' ', '-');
        } else if (desktopUAStr.test(navigator.userAgent)) {
            result = desktopUAStr.exec(navigator.userAgent);
            return 'desktop ' + result[0].toLowerCase().replace(' ', '-');
        } else {
            return 'unknown';
        }
    };

    $rootScope.gaID = appConfig.ga;
    $rootScope.app = appConfig;

    $rootScope.getOrientation = function() {
        if (!$rootScope.orientation) {
            $rootScope.orientation = (window.outerWidth > window.outerHeight) ? 'landscape' : 'portrait';
        }
        return $rootScope.orientation;
    };

    if ($rootScope.isCategory()) angular.element('body').addClass('category');
    angular.element('body').addClass($rootScope.isMobile());
    angular.element('body').addClass($rootScope.getOrientation());
    angular.element('body').addClass($rootScope.app.name);
    angular.element('head').append('<link rel="stylesheet" type="text/css" href="/css/site/' + $rootScope.app.name + '.css">');

    //$rootScope.lastIndex = 0;

    $rootScope.decodeHtml = function(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    $rootScope.formatExcerpt = function(excerpt) {
        return excerpt.replace('http://altdriver.altmedia.com', 'http://www.altdriver.com').replace('http://altdriver.staging.altmedia.com', 'http://staging.altdriver.com');
    };

    $rootScope.loadGif = function(item, $event) {
        var postContainer = angular.element($event.currentTarget).closest('.post-content');
        var originalView = postContainer.html();
        $rootScope.currentGifItem = item;
        $rootScope.currentGifEvt = $event;

        postContainer.css({
            'height': postContainer.height() + 'px'
        });

        postContainer.find('.post-title, .item-cat, .featured-image').hide();
        var imgContainer = angular.element($event.currentTarget).parent();
        imgContainer.hide();

        var gif = angular.element(item.content.rendered);
        gif.find('img').css({
            'max-width': '100%',
            'height': 'auto'
        }).on('click', function(e) {
            e.preventDefault();
            postContainer.html(originalView);
            angular.element(postContainer.find('.gif-btn')).on('click', function(e) {

                $rootScope.loadGif($rootScope.currentGifItem, e);
            });
        });
        postContainer.prepend(gif);
    };

    $rootScope.voteLoad = function(postID, index) {
        var voteButton = angular.element('.votes:eq(' + index + ')').find('button');
        var votedHistory = null;

        try {
            if (typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null') {


                votedHistory = JSON.parse(localStorage.getItem('user_voted'));
                angular.forEach(votedHistory, function(item, index) {
                    if (item.postID === postID) {
                        var userVoted = item.voted;
                        setTimeout(function() {
                            var votedOn = angular.element('.view-container').find('#votes-' + item.postID).find('button');
                            votedOn.parent().find('button[name="' + userVoted + '"]').addClass('voted');
                            votedOn.attr('disabled', 'disabled');
                            return false;
                        }, 50);
                    }
                });
            }
        } catch (e) {


        }
    };

    $rootScope.attachCommentsHandler = function() {
        $rootScope.$watch('$viewContentLoaded', function() {
            angular.element('.fb-wrapper').css({
                'height': '0',
                'overflow': 'hidden'
            });
        });
    };

    $rootScope.renderContent = function(content, index, fromClick) {

        //post.html(content);


        var feedItem = angular.element('.feed-item:eq(' + index + ')');
        var post = feedItem.find('.post-content');
        var expectedEmbed = post.find('iframe');
        var fbEmbed = post.find('.fb-video');
        if (location.host.indexOf('app.altdriver') === -1) {
            if (content.search('</iframe>') > -1 && $rootScope.displayAds) {

                var pieces = content.split('</iframe></p>');
                if (pieces.length === 1) {
                    pieces = content.split('</iframe> </p>');
                }
                var glue = $rootScope.getAdvertisementGlue();

                content = pieces.join(glue);
                content += '<div class="post-txt-more ga-post-more">Read More</div>';
            }
        }
        if (expectedEmbed.length > 0 && fbEmbed.length === 0) {
            expectedEmbed.addClass('video-container');
            $rootScope.resizeEmbed(expectedEmbed);
        }

        if (fbEmbed.length > 0) {

            fbEmbed.addClass('video-container').addClass('fb-embed').css({
                width: '100%'
            });
            $rootScope.resizeEmbed(fbEmbed);
        }

        return $sce.trustAsHtml(content);
    };

    $rootScope.getAdvertisementGlue = function() {
        var glue = '';
        switch ($rootScope.appConfig.name) {
            case 'altdriver':
                if ($rootScope.platform === 'desktop') {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag || {}; googletag.cmd = window.googletag.cmd || [];var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [728,90]).build();window.googletag.defineSlot("/110669458/AD_Desktop_Companion_Leaderboard", [728, 90], "div-gpt-ad-1448906851482-0").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-0"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-0"); });</script></div>';
                } else {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag || {}; googletag.cmd = window.googletag.cmd || [];var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [[300, 50], [320, 50]]).build();window.googletag.defineSlot("/110669458/AD_Mobile_Companion_Flex", [[300, 50], [320, 50]], "div-gpt-ad-1448906851482-6").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-6"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-6"); });</script></div>';
                }
                break;
            case 'driversenvy':
                if ($rootScope.platform === 'desktop') {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [728,90]).build();window.googletag.defineSlot("/110669458/DE_Desktop_Companion_Leaderboard", [728, 90], "div-gpt-ad-1448906851482-0").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-0"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-0"); });</script></div>';
                } else {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [[300, 50], [320, 50]]).build();window.googletag.defineSlot("/110669458/DE_Mobile_Companion_Flex", [[300, 50], [320, 50]], "div-gpt-ad-1448906851482-6").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-6"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-6"); });</script></div>';
                }
                break;
            case 'mamashares':
                if ($rootScope.platform === 'desktop') {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [728,90]).build();window.googletag.defineSlot("/110669458/MS_Desktop_Companion_Leaderboard", [728, 90], "div-gpt-ad-1448906851482-0").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-0"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-0"); });</script></div>';
                } else {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [[300, 50], [320, 50]]).build();window.googletag.defineSlot("/110669458/MS_Mobile_Companion_Flex", [[300, 50], [320, 50]], "div-gpt-ad-1448906851482-6").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-6"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-6"); });</script></div>';
                }
                break;
            case 'upshift':
                if ($rootScope.platform === 'desktop') {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [728,90]).build();window.googletag.defineSlot("/110669458/UP_Desktop_Companion_Leaderboard", [728, 90], "div-gpt-ad-1448906851482-0").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-0"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-0"); });</script></div>';
                } else {
                    glue = '</iframe></p><script type="text/javascript">var googletag = window.googletag = window.googletag || {}; window.googletag.cmd = window.googletag.cmd || [];(function() {var gads = document.createElement("script");gads.async = true;gads.type = "text/javascript";var useSSL = "https:" == document.location.protocol;gads.src = (useSSL ? "https:" : "http:") +"//www.googletagservices.com/tag/js/gpt.js";var node = document.getElementsByTagName("script")[0];node.parentNode.insertBefore(gads, node);})();</script><script type="text/javascript">var gptAdSlots = [];window.googletag.cmd.push(function() {var mapping2 = window.googletag.sizeMapping().addSize([0, 0], [[300, 50], [320, 50]]).build();window.googletag.defineSlot("/110669458/UP_Mobile_Companion_Flex", [[300, 50], [320, 50]], "div-gpt-ad-1448906851482-6").defineSizeMapping(mapping2).addService(googletag.pubads());googletag.pubads().enableSingleRequest();googletag.pubads().collapseEmptyDivs();googletag.enableServices();});</script><div class="ad-post-companion" id="div-gpt-ad-1448906851482-6"><script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1448906851482-6"); });</script></div>';
                }
                break;
        }
        return glue;
    };

    $rootScope.resizeEmbed = function(embed) {
        var iframe = embed;

        var maxWidth = iframe.closest('.post-content').width(); // Max width for the image
        var maxHeight = 10000; // Max height for the image
        var ratio = 0; // Used for aspect ratio

        var width = iframe[0].width; // Current image width
        var height = iframe[0].height; // Current image height


        // Check if the current width is larger than the max
        if (width > maxWidth) {
            ratio = maxWidth / width; // get ratio for scaling image
            iframe.css('width', maxWidth); // Set new width
            iframe.css('height', height * ratio); // Scale height based on ratio
            height = height * ratio; // Reset height to match scaled image
            width = width * ratio; // Reset width to match scaled image
        }

        if (width < maxWidth) {
            ratio = maxWidth / width; // get ratio for scaling image
            iframe.css('width', maxWidth); // Set new width
            iframe.css('height', height * ratio); // Scale height based on ratio
            height = height * ratio; // Reset height to match scaled image
            width = width * ratio; // Reset width to match scaled image
        }

        // Check if current height is larger than max
        if (height > maxHeight) {
            ratio = maxHeight / height; // get ratio for scaling image
            iframe.css('height', maxHeight); // Set new height
            iframe.css('width', width * ratio); // Scale width based on ratio
            width = width * ratio; // Reset width to match scaled image
            height = height * ratio; // Reset height to match scaled image
        }

    };

    $rootScope.vote = function(postID, vote, $event) {

        //@ltDr1v3r!
        try {
            var voteButton = angular.element($event.currentTarget);
            var votedHistory = null;

            if (typeof localStorage.getItem('user_voted') === 'string' && localStorage.getItem('user_voted') !== 'null') {
                votedHistory = JSON.parse(localStorage.getItem('user_voted'));
            }
            voteButton.addClass('voted');
            var upOrDown = voteButton.attr('name');
            var voteVal = upOrDown === 'up' ? 2 : 1;

            angular.module('NewsFeed').trackEvent('voting', 'click', postID + ' - ' + upOrDown, 1, null);
            $event.preventDefault();

            var ls = [];
            var userLS = null;
            if (votedHistory) {
                var items = JSON.parse(localStorage.getItem('user_voted'));
                items.push({
                    postID: postID,
                    voted: upOrDown
                });
                userLS = JSON.stringify(items);
            } else {
                ls.push({
                    postID: postID,
                    voted: upOrDown
                });
                userLS = JSON.stringify(ls);
            }
            localStorage.setItem('user_voted', userLS);
            var voteCount = voteButton.closest('.post-actions').find('.vote-count').text();
            var count = null;

            if (upOrDown === 'up') {
                count = voteCount === 0 ? 1 : parseInt(voteCount) + 1;
            } else {
                count = parseInt(voteCount) - 1;
            }

            voteButton.closest('.post-actions').find('.vote-count').text(count);
            voteButton.parent().find('button').attr('disabled', 'disabled');

            var req = FeedService.vote(postID, voteVal);

            if (voteButton.closest('.post-actions').find('.vote-count').text() === '1') {
                voteButton.closest('.post-actions').find('.pointsTxt').text('point');
            } else {
                voteButton.closest('.post-actions').find('.pointsTxt').text('points');
            }
        } catch (e) {
            console.debug(e);
        }
    };

    $rootScope.commentBtnHandler = function($event, $index, urlParams) {
        var samePage = false;
        for (var prop in $routeParams) {
            samePage = $routeParams[prop] === urlParams[prop];
        }

        if (samePage) {
            $rootScope.toggleComments($event);
        } else {
            urlParams.slug = urlParams.slug + '#comment';
            $rootScope.goToPage($event, $index, urlParams);
        }
    };

    $rootScope.toggleComments = function(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if ($rootScope.comments === 1) {
            angular.element('.fb-wrapper').css({
                'height': '0'
            });
            $rootScope.comments = 0;
        } else {
            angular.element('.fb-wrapper').css({
                'height': 'auto'
            });
            $rootScope.comments = 1;
        }
    };

    $rootScope.goToPage = function($event, $index, linkParams) {
        $event.preventDefault();
        var page = typeof linkParams === 'object' ? '/' + linkParams.category + '/' + linkParams.slug + '/' : linkParams;
        var postOffset = angular.element($event.currentTarget).closest('.feed-item').data('post-index');

        if (Number(postOffset) === 0) {
            //postOffset = 1;
        }


        try {
            localStorage.setItem('post_offset', postOffset);
        } catch (e) {
            console.debug(e);
        }
        window.location.href = page;
    };

    $rootScope.goToCategory = function(category) {
        //$scope.collapseNav();
        angular.module('NewsFeed').trackEvent('navigation.category', 'click', category, 1, null);
        window.location.href = '/' + category;
        $rootScope.currentCategory = category;
    };

    $rootScope.getSMSLink = function(link) {
        return $rootScope.isMobile().indexOf('ios') > -1 ? 'sms:&body=' + link : 'sms:?body=' + link;
    };

    $rootScope.getTrusted = function(val) {
        return $sce.trustAsHtml(val);
    };

    $rootScope.search = function() {
        window.location.href = '/search/' + encodeURIComponent(angular.element('input[name="s"]').val());
    };

    if (/mobile/i.test($rootScope.isMobile())) {
        window.addEventListener('resize', function(e) {
            $rootScope.orientation = (e.currentTarget.outerWidth > e.currentTarget.outerHeight) ? 'landscape' : 'portrait';
            angular.element('body').removeClass('landscape portrait').addClass($rootScope.orientation);
        }, false);
    }

    $rootScope.shareItemClick = function($event, slug) {
        angular.module('NewsFeed').trackEvent('postactions:share:' + angular.element($event.currentTarget).attr('class'), 'click', slug, 1, null);
    };

    $rootScope.shareClick = function($event, slug, $index) {
        angular.element('.share-icon-wrapper').not(':eq(' + $index + ')').removeClass('ng-hide').addClass('ng-hide');
        var shareBtn = angular.element($event.currentTarget).parent().parent().next();
        if (shareBtn.hasClass('ng-hide')) {

            shareBtn.removeClass('ng-hide');
            angular.module('NewsFeed').trackEvent('postactions:share:open', 'click', slug, 1, null);
        } else {
            shareBtn.addClass('ng-hide');
            angular.module('NewsFeed').trackEvent('postactions:share:close', 'click', slug, 1, null);
        }

        var shareTop = angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').height() + angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').offset().top;
        if (shareTop > (window.innerHeight + window.scrollY)) {
            var diff = angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').offset().top - window.innerHeight;
            var s = window.scrollY + angular.element($event.currentTarget.closest('.post-actions')).find('.flexshare').height() + 10;
            window.scrollTo(0, s);
        }
    };

    $rootScope.trackEvent = function(eventCategory, eventAction, eventLabel, eventValue, fieldsObject) {
        angular.module('NewsFeed').trackEvent(eventCategory, eventAction, eventLabel, eventValue, fieldsObject);
    };

    $rootScope.getFeaturedThumbnail = function(img, attr) {
        var attrs = {
            'src': 0,
            'width': 1,
            'height': 2
        };

        if (img.thumbnail[0].indexOf('https://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
            img.thumbnail[0] = img.thumbnail[0].replace('https://s3-us-west-2.amazonaws.com/assets.altdriver', 'http://media.altdriver.com');
        }

        return img.thumbnail[attrs[attr]];
    };

    // $rootScope.getFeaturedImage = function(img, attr) {

    // var attrs = {
    //     'src': 0,
    //     'width': 1,
    //     'height': 2
    // };
    //     if (img.original[0].indexOf('https://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
    //         img.original[0] = img.original[0].replace('https://s3-us-west-2.amazonaws.com/assets.altdriver', 'http://media.altdriver.com');
    //     }
    //     if (img.medium[0].indexOf('https://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
    //         img.medium[0] = img.medium[0].replace('https://s3-us-west-2.amazonaws.com/assets.altdriver', 'http://media.altdriver.com');
    //     }

    //     if (img.original[0].indexOf('http://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
    //         img.original[0] = img.original[0].replace('http://s3-us-west-2.amazonaws.com/assets.altdriver', 'http://media.altdriver.com');
    //     }
    //     if (img.medium[0].indexOf('http://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
    //         img.medium[0] = img.medium[0].replace('http://s3-us-west-2.amazonaws.com/assets.altdriver', 'http://media.altdriver.com');
    //     }



    //     if (/ios/i.test($rootScope.isMobile())) {
    //         return img.medium[attrs[attr]];
    //     } else if (/mobile/i.test($rootScope.isMobile())) {
    //         return img.medium[attrs[attr]];
    //     } else if (/desktop/i.test($rootScope.isMobile())) {
    //         return img.original[attrs[attr]];
    //     }
    // };

    $rootScope.getFeaturedImage = function(img, attr) {

        var attrs = {
            'src': 0,
            'width': 1,
            'height': 2
        };

        if (img.original[0].indexOf('https://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
            img.original[0] = img.original[0].replace('https://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/', '');
        }
        if (img.medium[0].indexOf('https://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
            img.medium[0] = img.medium[0].replace('https://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/', '');
        }

        if (img.original[0].indexOf('http://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
            img.original[0] = img.original[0].replace('http://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/', '');
        }
        if (img.medium[0].indexOf('http://s3-us-west-2.amazonaws.com/assets.altdriver') > -1) {
            img.medium[0] = img.medium[0].replace('http://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/', '');
        }



        if (/ios/i.test($rootScope.isMobile())) {
            return img.medium[attrs[attr]];
        } else if (/mobile/i.test($rootScope.isMobile())) {
            return img.medium[attrs[attr]];
        } else if (/desktop/i.test($rootScope.isMobile())) {
            return img.original[attrs[attr]];
        }
    };

    $rootScope.getAppInfo = function(param) {
        return appConfig[param];
    };

    $rootScope.setTargeting = function(key, value, init) {
        var obj = {
            'key': key,
            'value': value
        };
        $rootScope.adKeyPairs.push(obj);
        if (init) $rootScope.initAds();
    };

    /*$rootScope.initSidebarAd = function(placementIndex){
        $rootScope.readyInterval = window.setInterval(function(){
            if($rootScope.gptReady === true){
                angular.element('.sidebar .dt-ad').html('<pubad placementIndex="' + placementIndex + '"></pubad>');
                window.clearInterval($rootScope.readyInterval);
            }
        },100);

    };*/

    $rootScope.initGpt = function() {
        console.log('initGpt');
        window.googletag = window.googletag || {};
        window.googletag.cmd = window.googletag.cmd || [];
        (function() {
            var gads = document.createElement('script');
            gads.async = true;
            gads.type = 'text/javascript';
            var useSSL = 'https:' === document.location.protocol;
            gads.src = (useSSL ? 'https:' : 'http:') +
                '//www.googletagservices.com/tag/js/gpt.js';
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(gads, node);
        })();
    };

    $rootScope.initAds = function() {
        console.log('initAds');
        if (location.pathname === '/adtest') {
            $rootScope.testAds();
            return;
        }
        //if(!$rootScope.adsEnabled) return;


        var platform = $rootScope._isMobile() ? 'mobile' : 'desktop';
        var ads = app.pubads[platform];

        window.googletag.cmd.push(function() {

            window.googletag.pubads().enableSingleRequest();
            window.googletag.pubads().collapseEmptyDivs();
            window.googletag.enableServices();
            if ($rootScope.adKeyPairs.length > 0) {
                var totalTargets = $rootScope.adKeyPairs.length;
                for (var i = 0; i < totalTargets; i++) {
                    console.log($rootScope.adKeyPairs[i].key, $rootScope.adKeyPairs[i].value);
                    window.googletag.pubads().setTargeting($rootScope.adKeyPairs[i].key, $rootScope.adKeyPairs[i].value);
                }
            }
        });

        $rootScope.gptReady = true;

    };

    $rootScope.getQueryParamValue = function(variable) {

        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    };

    $rootScope.testAds = function() {
        window.googletag = window.googletag || {};
        window.googletag.cmd = window.googletag.cmd || [];
        (function() {
            var gads = document.createElement('script');
            gads.async = true;
            gads.type = 'text/javascript';
            var useSSL = 'https:' === document.location.protocol;
            gads.src = (useSSL ? 'https:' : 'http:') +
                '//www.googletagservices.com/tag/js/gpt.js';
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(gads, node);
        })();

        var platform = $rootScope._isMobile() ? 'mobile' : 'desktop';
        var ads = app.pubads[platform];

        window.googletag.cmd.push(function() {
            window.googletag.pubads().enableSingleRequest();
            window.googletag.pubads().collapseEmptyDivs();
            window.googletag.enableServices();

            if ($rootScope.getQueryParamValue('campaign') !== null) {
                if ($rootScope.getQueryParamValue('campaign').length > 0) {
                    window.googletag.pubads().setTargeting('campaign', $rootScope.getQueryParamValue('campaign'));
                } else {
                    window.googletag.pubads().setTargeting('campaign', 'testing');
                }

            } else {
                window.googletag.pubads().setTargeting('campaign', 'testing');
            }
        });

    };

});