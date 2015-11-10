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
        iframeEl.css({'margin-top':'-50px', 'border':'none'});
        var iframe = document.querySelector('#submitIframe');

        setTimeout(function(){

            iframe.contentWindow.postMessage('hide elements','http://altdriver.wpengine.com');
            iframeEl.css({'margin-top':'0px'});
            angular.element('.view-container').height(angular.element(iframe).height());
        },3000);


        angular.element('#submitPage').css({'height':'100%', 'padding':'0'});

        angular.element('#submitPage').find('iframe').contents().find('#wpadminbar').hide();
        angular.element('#submitPage').find('iframe').contents().find('#main-head').hide();

        /*FeedService.getPage('submit').then(function(res){
         angular.element('#submitPage').find('.content').html(res[0].content.rendered);
         angular.element('#submitPage').find('.content').find('form').attr('action','/submit');
         angular.element('#submitPage').find('.content').find('form').append('<input type="hidden" name="remoteHost" value="' + envConfig.remoteUrl + '/submit">');
         });*/
    };

    $scope.$on('$viewContentLoaded', function(){
        var minHeight = window.innerHeight;
        angular.element('html, body, .view-container, #staticPage, .content').css({'min-height':minHeight+'px'});
        angular.element('strong').css({'font-weight': 'bold', 'font-size': '1.2em'});
    });

};

module.exports = PageController;