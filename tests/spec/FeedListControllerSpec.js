describe('FeedListController', function(){
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
            controller = $controller('FeedListController', { $scope: $scope });
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