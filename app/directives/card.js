'use strict';

var card = function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.contentUrl = '/views/cards/' + attrs.type + '.html';
            attrs.$observe('type',function(t){
                scope.contentUrl = '/views/cards/' + t + '.html';
            });
        },
        template: '<div class="card-item" ng-include="contentUrl"></div>'
    };
};

module.exports = card;