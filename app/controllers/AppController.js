'use strict';

var AppController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $stateParams, $state, ogMeta) {
    $scope.collapseNav = function(){
        if(!angular.element('.navbar-toggle').hasClass('collapsed')){
            angular.element('.navbar-toggle').click();
        }
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
};

module.exports = AppController;