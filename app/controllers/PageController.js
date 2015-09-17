'use strict';


var PageController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, envConfig) {

    this.name = 'page';
    $scope.routeParams = $location.$$path.replace('/','');

    $scope.getRouteParams = function(){
        return '';
    };
    $scope.getPage = function(){
        FeedService.getPage($scope.routeParams).then(
            function(res){
                angular.element('#staticPage').find('.content').html(res[0].content.rendered);
            }
        );
    };

};

module.exports = PageController;