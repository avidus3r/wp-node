'use strict';

var PostsController = function($rootScope, $scope, PostService, InstagramService, $route, $routeParams, $location) {

    $scope.currentView = 'list';

    $scope.find = function() {
        PostService.query(function(posts) {
            $scope.posts = posts;
        });
    };

    $scope.findOne = function() {
        PostService.get({
            slug: $routeParams.slug
        }, function(post) {
            $scope.post = post;
        });
    };

    $scope.getFeaturedImage = function(img, attr){
        var attrs = {'src': 0, 'width': 1, 'height': 2};

        if(/ios/i.test($rootScope.isMobile())){
            return img.medium[attrs[attr]];
        }
        else if(/mobile/i.test($rootScope.isMobile())){
            return img.medium[attrs[attr]];
        }
        else if(/desktop/i.test($rootScope.isMobile())){
            return img.original[attrs[attr]];
        }
    };

    $scope.getCategory = function(categories, permalink){
        var cat = null;
        var catParent = null;

        angular.forEach(categories, function (category, index) {
            if(catParent){
                if(category.parent === catParent){
                    cat = category;
                }
            }
            if(permalink.indexOf(category.slug) > -1){
                cat = category;
            }
        });

        return cat;
    };

};

module.exports = PostsController;