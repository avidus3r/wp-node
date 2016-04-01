'use strict';

var cardlist = function() {
    return {
        restrict: 'EA',
        $scope:{
            cards: '='
        },
        controller: function($scope, $attrs, FeedService, $rootScope, $q) {
            $scope.cards = [];
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
            $attrs.$observe('posttype',function(attr){
                $scope.cardType = attr;
                $scope.contentUrl = '/views/cards/' + attr + '.html';
            });

            $scope.cardListItems = FeedService.queryArticles(postType,numPosts,pageNum,skip, format).then(function(result){
                $scope.cards = result;
            });

            return $scope.cardListItems;
        },
        link:function($scope, $attrs){
            //$scope.cards = $scope.cardListItems;
        },
        template: '<div ng-include="\'/views/cards/cardlistItems.html\'"></div>'
    };
};

module.exports = cardlist;