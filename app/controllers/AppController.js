'use strict';


var AppController = function($rootScope, $scope, FeedService) {

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
};

module.exports = AppController;