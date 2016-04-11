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

            var postType        = $attrs.posttype,
                numPosts        = $attrs.numposts,
                pageNum         = $attrs.pagenum,
                skip            = $attrs.skip,
                format          = $attrs.format,
                excerpt         = $attrs.excerpt,
                viewType        = $attrs.viewtype,
                viewTemplate    = $attrs.viewtemplate,
                showSharebar    = $attrs.sharebar,
                category        = $attrs.category;

            if(excerpt === 'false'){
                excerpt = false;
            }
            if(showSharebar === 'false'){
                showSharebar = false;
            }
            $scope.showExcerpt = excerpt;
            $scope.postType = postType;
            $scope.viewType = viewType;
            $scope.showSharebar = showSharebar;
            $scope.viewTemplate = viewTemplate;

            if(viewTemplate === 'post-single') $scope.viewType = 'column';
            if(typeof viewTemplate === 'undefined') $scope.viewTemplate = postType;
            if(typeof showSharebar === 'undefined') $scope.showSharebar = true;

            $scope.postCategory = category;

            $scope.cardListItems = FeedService.queryArticles(postType, numPosts, pageNum, skip, format, category).then(function(result){
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