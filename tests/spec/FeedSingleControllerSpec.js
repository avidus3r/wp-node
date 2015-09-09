describe('FeedSingleController', function(){
    beforeEach(module('NewsFeed'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    describe('$scope.getPosts', function(){
        var $scope, controller;
        var posts = null;

        beforeEach(function() {
            $scope = {};
            $scope.$parent = {
                lastOffset:0
            };
            controller = $controller('FeedSingleController', { $scope: $scope, $routeParams:{category:'general', slug:'car-in-a-bag'} });
        });

        afterEach(function(){

        });

        it('should have a defined response', function(){
            expect($scope.getPost()).toBeDefined();
        });

        it('should have posts', function(){
            expect($scope.feedItems).toBeDefined();
        });

    });

});