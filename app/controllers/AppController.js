'use strict';

var AppController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, $stateParams, $state) {
    $scope.collapseNav = function(){
        if(!angular.element('.navbar-toggle').hasClass('collapsed')){
            angular.element('.navbar-toggle').click();
        }
    };

    FeedService.getTerms('category').then(
        function(data){
            $scope.categories = data;
        },
        function(error){

        },
        function(notification){

        }
    );

    $scope.changeState = function(newState, params, options){
        $rootScope.$state.go(newState, params, options);
    };
};

module.exports = AppController;