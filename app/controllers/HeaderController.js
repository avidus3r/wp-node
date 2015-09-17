'use strict';


var HeaderController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, envConfig) {

    this.name = 'app';

    $scope.collapseNav = function(){
        if(!angular.element('.navbar-toggle').hasClass('collapsed')){
            angular.element('.navbar-toggle').click();
        }
    };

    $scope.menuItems = [];
    $scope.navItems = [];
    $scope.mainMenu = null;
    $scope.legalMenu = null;

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

    $scope.getMainMenu = function(){

        FeedService.getMainMenu('Main Menu').then(
            function(data){
                $scope.mainMenu = data;
                $scope.menuItems.push(data);
                $scope.getLegalMenu();
            },
            function(error){

            },
            function(notification){

            }
        );
    };

    $scope.getLegalMenu = function(){
        FeedService.getLegalMenu('Legal Menu').then(
            function(data){
                $scope.legalMenu = data;
                $scope.menuItems.push(data);
                $scope.renderMenu();
            }
        );
    };

    $scope.renderMenu = function(){
        //var menuItems = Object.assign($scope.mainMenu, $scope.legalMenu);
        angular.forEach($scope.menuItems, function (item, index) {
            angular.forEach(item, function (navItem, index) {
                if (navItem.object === 'page') {
                    navItem.class = 'hidden-md-altd';
                    navItem.slug = navItem.url.substring(navItem.url.lastIndexOf('.com/') + 5, navItem.url.length).replace('/', '');
                }
                if (navItem.object === 'category') {
                    navItem.slug = 'category/' + navItem.url.substring(navItem.url.lastIndexOf('category/') + 9, navItem.url.length).replace('/', '');
                }
                $scope.navItems.push(navItem);
            });
        });
        console.log($scope.navItems.length);
    };


    $scope.getTerms();
    $scope.getMainMenu();

};

module.exports = HeaderController;