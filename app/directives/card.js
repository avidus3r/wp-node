'use strict';

var card = function() {
    return {
        restrict: 'E',
        controller: function($scope, $element, $attrs) {
            $scope.contentUrl = '/views/cards/' + $attrs.type + '.html';
            $attrs.$observe('type',function(attr){
                $scope.cardType = attr;
                $scope.contentUrl = '/views/cards/' + attr + '.html';
            });
            $attrs.$observe('error',function(attr) {
                $scope.errorClass = attr;
            });
        },
        template: '<div class="card-item {{ cardType }} {{ errorClass }}" ng-include="contentUrl"></div>'
    };
};

module.exports = card;