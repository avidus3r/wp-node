'use strict';


var PageController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $sce, envConfig) {

    this.name = 'page';
    $scope.routeParams = $location.$$path.replace('/','');
    $scope.page = null;

    $scope.getRouteParams = function(){
        return '';
    };
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

};

module.exports = PageController;