'use strict';

var instagram = function() {
    return {
        restrict: 'EA',
        controller: function($scope, $attrs, InstagramService) {
            var gram = $scope.$parent.item.data;
            $scope.gram = gram;
            return $scope.gram;
        }
    };
};

module.exports = instagram;