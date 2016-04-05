'use strict';

var cardlist = function() {
    return {
        restrict: 'EA',
        scope:{
            posttype: '='
        },
        controller: function($scope, $attrs, FeedService, $rootScope, $sce) {
            console.log(typeof $rootScope.getFeaturedImage);
            $scope.cards = [];
            $scope.cardListItems = null;
            $scope.displayAds = true;

            var postType = $attrs.posttype,
                numPosts = $attrs.numposts,
                pageNum = $attrs.pagenum,
                skip = $attrs.skip,
                format = $attrs.format,
                excerpt = $attrs.excerpt;

            if(excerpt){
                $scope.showExcerpt = true;
            }

            $scope.postType = postType;

            $scope.cardListItems = FeedService.queryArticles(postType,numPosts,pageNum,skip, format).then(function(result){
                $scope.cards = result;
            });

            return $scope.cardListItems;
        },
        link:function($scope, $attrs){
            $scope.cards = $scope.cardListItems;
        },
        template: '<div ng-include="\'/views/cards/cardlistItems.html\'"></div>'
    };
};

module.exports = cardlist;