'use strict';

var pubad = function() {
    return {
        restrict: 'EA',
        /*scope:{
            placementIndex: '=?placementIndex'
        },*/
        controller: function($scope, $element, $attrs, $rootScope, app) {

            //window.googletag = window.googletag || {};
            //window.googletag.cmd = window.googletag.cmd || [];
            //if(!$rootScope.adsEnabled) return;

            var platform = $rootScope._isMobile() ? 'mobile' : 'desktop';
            var ads = app.pubads[platform];
            $scope.isDesktop = false;
            $scope.placementIndex = null;
            $attrs.$observe('placementIndex',function(attr){
                $scope.placementIndex = attr;
            });
            if($scope.$parent && typeof $scope.$parent.item === 'undefined'){
                $scope.isDesktop = true;
                $scope.placementIndex = Number($element.attr('placementIndex'));
                $scope.currentPubad = ads[$scope.placementIndex];
                if(!$rootScope.gptAdSlots[$scope.placementIndex]) {
                    window.googletag.cmd.push(function () {
                        $rootScope.gptAdSlots[$scope.placementIndex] = window.googletag.defineSlot($scope.currentPubad.slot, $scope.currentPubad.dimensions, $scope.currentPubad.tagID).addService(window.googletag.pubads());
                    });
                }
            }else{
                $scope.isDesktop = false;
                $scope.placementIndex = $scope.$parent.item.placementIndex;
                $scope.currentPubad = ads[$scope.placementIndex];
                if(!$rootScope.gptAdSlots[$scope.placementIndex]) {
                    console.log($scope.currentPubad.slot);
                    window.googletag.cmd.push(function () {
                        $rootScope.gptAdSlots[$scope.placementIndex] = window.googletag.defineSlot($scope.currentPubad.slot, $scope.currentPubad.dimensions, $scope.currentPubad.tagID).addService(window.googletag.pubads());
                    });
                }
            }

            //console.debug($scope.currentPubad);

            $scope.pubadID = $scope.currentPubad.tagID;
            if(typeof $scope.currentPubad.dimensions[0] !== 'number'){
                $scope.pubadWidth = $scope.currentPubad.dimensions[0][0] + 'px';
                $scope.pubadHeight = $scope.currentPubad.dimensions[0][1] + 'px';
            }else{
                $scope.pubadWidth = $scope.currentPubad.dimensions[0] + 'px';
                $scope.pubadHeight = $scope.currentPubad.dimensions[1] + 'px';
            }

            if($scope.isDesktop){
                $scope.pubadHeight = 'auto';
            }

            //return $scope.currentPubad;
            /*$attrs.$observe('placementWidth',function(attr){
                $scope.placementWidth = attr;
            });
            $attrs.$observe('placementHeight',function(attr) {
                $scope.placementHeight = attr;
            });
            $attrs.$observe('elementID',function(attr) {a
                $scope.elementID = attr;
            });*/

            $scope.getPubad = function(adID, placementIndex, paged, isDesktop){
                var pubadID = app.pubads[platform][placementIndex].tagID;
                if(paged > 1){
                    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){

                        window.googletag.pubads().refresh();
                        /*setTimeout(function(){
                            window.googletag.cmd.push(function() {
                                window.googletag.cmd.push(function() { window.googletag.display(pubadID); });
                            });
                        },1000);*/

                    }else{

                        window.googletag.pubads().refresh();

                        /*setTimeout(function(){
                            window.googletag.cmd.push(function() {
                                window.googletag.cmd.push(function() { window.googletag.display(pubadID); });
                            });
                        },1000);*/
                    }
                }else{
                    setTimeout(function() {
                        window.googletag.cmd.push(function () {
                            //console.debug('googpush: window.googletag.display(' + pubadID + ')');
                            window.googletag.display(pubadID);
                        });
                    },1000);
                }
            }

        },
        template: '<div class="pubad" id="{{ pubadID }}" style="height:{{ pubadHeight }}; width:{{ pubadWidth }};" ng-init="getPubad(pubadId, placementIndex, paged, isDesktop)"></div>'
    };
};

module.exports = pubad;