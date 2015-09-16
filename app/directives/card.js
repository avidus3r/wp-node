'use strict';

var card = function() {
    return {
        restrict: 'E',
        scope: {
            type: '=type'
        },
        templateUrl: '/views/card.html'
    };
};

module.exports = card;