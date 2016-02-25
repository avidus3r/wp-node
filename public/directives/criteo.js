'use strict';

var criteo = function() {
    return {
        restrict: 'EA',
        controller: function($scope) {
            $scope.viewUrl = '/views/cards/criteo.html';
        },
        template: '<div ng-include="viewUrl"></div>'
    };
};

module.exports = criteo;