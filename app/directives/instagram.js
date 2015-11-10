'use strict';

var instagram = function() {
    return {
        restrict: 'EA',
        controller: function($scope, $attrs, InstagramService) {
            $scope.grams = [];
            var maxId = $attrs.maxId;
            return InstagramService.get(1, 'nofilter', maxId).then(function(res){
                $scope.gram = res.data;
                return $scope.gram;
            });
        }
        //, template: '<a href="{{ gram.data.link }}" target="_blank"><img class="instagram-img" src="{{ gram.data.images.standard_resolution.url }}"></a>'
    };
};

module.exports = instagram;