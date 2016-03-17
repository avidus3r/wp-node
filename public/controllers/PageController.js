'use strict';


var PageController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $sce, app) {

    this.name = 'page';
    $scope.routeParams = $location.$$path.replace('/','');
    $scope.page = null;


    $scope.getRouteParams = function(){
        return '';
    };

    angular.element('#loading-more').hide();

    $scope.formErrors = null;

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

    $scope.validate = function(fields){
        var homewrecker = [];
        var happiness = false;

        angular.forEach(fields, function(item, index){
            var valerie = item.value;
            var reggie = null;
            angular.element(item).parent().removeClass('has-error');
            switch(item.type){
                case 'url':
                    reggie = /^(http(?:s)?\:\/\/[a-zA-Z0-9]+(?:(?:\.|\-)[a-zA-Z0-9]+)+(?:\:\d+)?(?:\/[\w\-]+)*(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
                    happiness = reggie.test(valerie);
                    if(!happiness) homewrecker.push(fields[index]);
                    break;
                case 'file':
                    happiness = valerie.length > 0;
                    if(!happiness) homewrecker.push(fields[index]);
                    break;
                case 'email':
                    reggie = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    happiness = reggie.test(valerie);
                    if(!happiness) homewrecker.push(fields[index]);
                    break;
                case 'text':
                    happiness = valerie.length > 0;
                    if(!happiness) homewrecker.push(fields[index]);
                    break;
            }

        });
        if(homewrecker.length > 0){
            $scope.formErrors = homewrecker;
            return false;
        }
        return true;
    };

    $scope.checkRequiredFields = function(){
        var deferred = new Promise(function(fulfill, reject) {
            var fields = angular.element('.submit-content-form').find('#file-upload, #link-url');
            angular.forEach(fields, function(item, index){

                switch (item.id) {
                    case "file-upload":
                        var fileCount = item.files.length;
                        if (fileCount > 0) {
                            angular.element('#link-url').removeAttr('required');
                        } else {
                            angular.element('#link-url').attr('required', 'required');
                        }
                        break;
                    case "link-url":
                        var linkVal = item.value;

                        if (linkVal.length > 0) {
                            angular.element('#file-upload').removeAttr('required');
                        } else {
                            angular.element('#file-upload').attr('required', 'required');
                        }
                        break;
                }
                fulfill();
            });
        });
        return deferred;
    };

    $scope.$on('$viewContentLoaded', function(){
        var minHeight = window.innerHeight-100;
        angular.element('html, body, .view-container, #staticPage, .content, iframe').css({'min-height':minHeight+'px'});
        angular.element('strong').css({'font-weight': 'bold', 'font-size': '1.2em'});
        if($scope.routeParams === 'thanks'){

        }
        angular.element('body').addClass($scope.routeParams);
        setTimeout(function(){
            angular.element('.submit-content-form input[type="submit"]').on('click', function(e){

                $scope.checkRequiredFields().then(function(){
                    angular.element('.submit-content-form').submit();
                });
                e.preventDefault();
            });
            angular.element('.submit-content-form').on('submit', function(e){

                var requiredFields = angular.element(e.currentTarget).find('input[required="required"]');
                var shouldIStayOrShouldIGo;
                $scope.checkRequiredFields().then(function(){
                    try{
                        shouldIStayOrShouldIGo = $scope.validate(requiredFields);
                        if(!shouldIStayOrShouldIGo){
                            angular.forEach($scope.formErrors, function(item, index){
                                angular.element(item).parent().addClass('has-error');
                            });
                        }

                        return shouldIStayOrShouldIGo;

                    }catch(e){
                        console.error(JSON.stringify(e));
                        return false;
                    }
                });

            });
        },500);
        window.removeEventListener('scroll');
    });

};

module.exports = PageController;