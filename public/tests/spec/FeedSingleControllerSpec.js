require('.././app.mock');
describe('FeedSingleController', function(){
    var $controller;

    beforeEach(function() {
        beforeEach(angular.mock.module('NewsFeed'));
        inject(function (_$controller_) {
            $controller = _$controller_;
        });
    });

    describe('$scope.getPosts', function(){
        var posts = null;
        var $scope, controller;

        beforeEach(function() {
            $scope = {};
            $scope.$parent = {
                lastOffset:0
            };
            controller = $controller('FeedSingleController', { $scope: $scope, $routeParams:{category:'general', slug:'car-in-a-bag'} });
        });

        afterEach(function(){

        });


        it('should have posts', function(){
            expect($scope.feedItems).toBeDefined();
        });

    });

});