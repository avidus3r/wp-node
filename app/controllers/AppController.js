'use strict';

var AppController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $stateParams, $state, ogMeta) {

    this.name = 'app';

    $scope.collapseNav = function(){
        if(!angular.element('.navbar-toggle').hasClass('collapsed')){
            angular.element('.navbar-toggle').click();
        }
    };

    $scope.navItems = [];

    $scope.isMobile = function(){
        if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ){
            return 'mobile';
        }else{
            return 'desktop';
        }
        //return true;
    };

    FeedService.getTerms('category').then(
        function(data){
            $scope.categories = data;
            $rootScope.$broadcast('categoriesRetrieved', $scope.categories);
        },
        function(error){

        },
        function(notification){

        }
    );

    FeedService.getNavItems().then(
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

    $scope.addUploadBtn = function(){

    };
};

module.exports = AppController;