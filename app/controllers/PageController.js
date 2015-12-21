'use strict';


var PageController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $sce, app) {

    this.name = 'page';
    $scope.routeParams = $location.$$path.replace('/','');
    $scope.page = null;


    $scope.getRouteParams = function(){
        return '';
    };

    angular.element('#loading-more').hide();

    $scope.getPage = function(){

        FeedService.getPage($scope.routeParams).then(
            function(res){
                $scope.page = res[0];
                $scope.content = $sce.trustAsHtml($scope.page.content.rendered);

            }
        );

    };

    $scope.getSubmit = function(){
        angular.element('#submitPage').css({'overflow':'hidden'});
        var iframeEl = angular.element('#submitPage').find('iframe');
        var iframe = document.querySelector('#submitIframe');

        setTimeout(function(){
            iframeEl.css({'margin-top':'0px'});
            angular.element('.view-container').height(angular.element(iframe).height());
        },3000);

        angular.element('#submitPage').css({'height':'100%', 'padding':'0'});
        angular.element('#submitPage').find('iframe').contents().find('#wpadminbar').hide();
        angular.element('#submitPage').find('iframe').contents().find('#main-head').hide();
    };

    $scope.getSubscribe = function(){
        angular.element('#subscribePage').css({'overflow':'hidden'});
        var iframeEl = angular.element('#subscribePage').find('iframe');
        iframeEl.css({'margin-top':'-50px', 'border':'none'});
        var iframe = document.querySelector('#subscribeIframe');

        setTimeout(function(){
            iframe.contentWindow.postMessage('hide elements','http://altdriver.altmedia.com');
            iframeEl.css({'margin-top':'0px'});
            angular.element('.view-container').height(angular.element(iframe).height());
        },3000);

        angular.element('#subscribePage').css({'height':'100%', 'padding':'0 1em'});
        angular.element('#subscribePage').find('iframe').contents().find('#wpadminbar').hide();
        angular.element('#subscribePage').find('iframe').contents().find('#main-head').hide();
    };

    $scope.$on('$viewContentLoaded', function(){
        var minHeight = window.innerHeight-100;
        angular.element('html, body, .view-container, #staticPage, .content, iframe').css({'min-height':minHeight+'px'});
        angular.element('strong').css({'font-weight': 'bold', 'font-size': '1.2em'});
        if($scope.routeParams === 'thanks'){

        }
        angular.element('body').addClass($scope.routeParams);
        setTimeout(function(){

        },500);

    });

};

module.exports = PageController;