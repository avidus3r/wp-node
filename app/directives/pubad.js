'use strict';

var pubad = function() {
    return {
        restrict: 'E',
        controller: function($scope, $element, $attrs, $rootScope, app) {

            var platform = $rootScope._isMobile() ? 'mobile' : 'desktop';
            var ads = app.pubads[platform];


            $scope.placementIndex = $scope.$parent.item.placementIndex;
            $scope.currentPubad = ads[$scope.placementIndex];

            $scope.pubadID = $scope.currentPubad.tagID;
            if(typeof $scope.currentPubad.dimensions[0] !== 'number'){
                $scope.pubadWidth = $scope.currentPubad.dimensions[0][0] + 'px';
                $scope.pubadHeight = $scope.currentPubad.dimensions[0][1] + 'px';
            }else{
                $scope.pubadWidth = $scope.currentPubad.dimensions[0] + 'px';
                $scope.pubadHeight = $scope.currentPubad.dimensions[1] + 'px';
            }

            //return $scope.currentPubad;
            /*$attrs.$observe('placementWidth',function(attr){
                $scope.placementWidth = attr;
            });
            $attrs.$observe('placementHeight',function(attr) {
                $scope.placementHeight = attr;
            });
            $attrs.$observe('elementID',function(attr) {
                $scope.elementID = attr;
            });*/

            $scope.getPubad = function(adID, $element){
                console.log(adID, $element);
            }

        },
        template: '<div class="pubad" id="{{ pubadID }}" style="height:{{ pubadHeight }}; width:{{ pubadWidth }};" ng-init="getPubad(pubadId, $element)"></div>'
    };
};

module.exports = pubad;