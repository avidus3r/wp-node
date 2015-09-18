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

};

module.exports = PageController;