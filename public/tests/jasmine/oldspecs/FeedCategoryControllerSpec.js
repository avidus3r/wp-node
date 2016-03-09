require('../src/app.mock.js');
describe('FeedCategoryController', function(){
    beforeEach(angular.mock.module('NewsFeed'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    describe('$scope.getPosts', function(){
        var $scope, controller;
        var posts = null;

        beforeEach(function() {
            $scope = {};
            controller = $controller('FeedCategoryController', { $scope: $scope, $routeParams:{category:'general'} });
        });

        afterEach(function(){

        });

        it('should have a defined response', function(){
            expect($scope.getPosts()).toBeDefined();
        });

        it('should have posts', function(){
            expect($scope.feedItems).toBeDefined();
        });

    });

});