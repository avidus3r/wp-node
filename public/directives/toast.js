'use strict';
//TODO
// move android hide/show inside the directive
var toast = function() {
    return {
        restrict: 'E',
        transclude: true,
        controller: function($scope, $element, $attrs, $window) {
            var presist = $attrs['presist'];
            var message = $attrs['message'];
            var delay = $attrs['delay'];
            var scroll = $attrs['scroll'];
            var button = $attrs['button'];
            var action = $attrs['action'];
            var toastId = $attrs['toastid'];
            var frequency = $attrs['frequency'];
            var android = $attrs['android'];
            var date = new Date();
            var localDate = localStorage.getItem('toast' + toastId);
            //check date to show or hide toast 
            if (localDate != 'undefined' && localDate != undefined && localDate != 'null' && localDate != null) {
                localDate = new Date(localDate);
                if (localDate.getMonth() == date.getMonth()) {
                    if (localDate.getDate() > date.getDate() - frequency) {
                        $scope.hideToast = true;
                    }
                } else {
                    $scope.hideToast = true;
                }
            }
            // check to make sure presist or delay is set 
            if (presist == 'false' && delay == '') {
                delay = 1000;
            }
            //hide action button if no button action specified 
            if (button == '' || action == '') {
                $scope.hideToastAction = true;
            }
            // set button action 
            $scope.toastActionLink = action;
            // set button message 
            angular.element(document.getElementById('toastActionButton')).text(button);
            // set message of the toast
            angular.element(document.getElementById('toastMessage')).text(message);
            // hide or show close button 
            if (presist == 'false') {
                $scope.hideToastClose = true;
            } else {
                $scope.hideToastClose = false;
            }
            // hide toast on timer 
            if (delay != '') {
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.hideToast = true;
                    });
                }, delay);
            }
            // remove or keep on sroll 
            if (scroll == 'false') {
                angular.element($window).bind("scroll", function() {
                    $scope.$apply(function() {
                        $scope.hideToast = true;
                    });
                });
            }
            //add close button local storage event 
            $scope.closeToast = function() {
                localStorage.setItem('toast' + toastId, date);
                $scope.hideToast = true;
            };
            // show for android items
            if (android == 'true') {
                var ua = navigator.userAgent.toLowerCase();
                var isAndroid = ua.indexOf("android") > -1;
                if (isAndroid) {
                    slideInToast();
                }
            }

            function slideInToast() {
                $(document).ready(function(){
                    $('.toast').slideToggle({
                        direction: "up"
                    }, 300)
                });
            }
        },
        link: function(scope, el, attrs, ctrl, transclude) {
            var content = transclude();
            content = content[1];
            console.log(content);
            if (transclude().length > 1) {
                angular.element(document.getElementById('toastWrapper')).empty();
                angular.element(document.getElementById('toastWrapper')).html(content);
            }
        },
        template: '<div id="toastWrapper" class="toastContainer" ng-hide="hideToast"><div ng-hide="hideToast" class="toast"><h4 id="toastMessage"></h4><div ng-click="closeToast()" ng-hide="hideToastClose" class="toast-button toast-close ga-toast-close">Close</div><a ng-href="{{toastActionLink}}"><div ng-hide="hideToastAction" id="toastActionButton" class="toast-button ga-toast-button">Download</div></a></div></div>'
    };
};

module.exports = toast;