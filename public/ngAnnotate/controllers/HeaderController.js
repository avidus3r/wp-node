'use strict';


var HeaderController = function($rootScope, $scope, FeedService, $route, $routeParams, $location, app) {

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
                $scope.renderMenu();
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
        angular.forEach($scope.menuItems, function (item, index) {
            angular.forEach(item, function (navItem, index) {
                if (navItem.object === 'page') {
                    navItem.class = 'legal';
                    navItem.slug = navItem.url.substring(navItem.url.lastIndexOf('.com/') + 5, navItem.url.length).replace('/', '');
                }
                if (navItem.object === 'category') {
                    navItem.slug = 'category/' + navItem.url.substring(navItem.url.lastIndexOf('category/') + 9, navItem.url.length).replace('/', '');
                }
                $scope.navItems.push(navItem);
            });
        });
    };

    $scope.navClick = function(){
        angular.module('NewsFeed').trackEvent('navigation.main','click','menu button',1,null);
    };



    $scope.getMainMenu();

};

module.exports = HeaderController;