'use strict';

var gtm = function() {
    return {
        restrict: 'EA',
        controller: function($scope, $element, $attrs, $rootScope, app) {
            $scope.viewUrl = '/views/partials/ga.html';
            $scope.gtmID = $rootScope.getAppInfo('gtm_id');
        },
        template: '<div ng-include="viewUrl"></div>'
    };
};

module.exports = gtm;