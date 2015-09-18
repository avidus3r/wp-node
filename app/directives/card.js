'use strict';

var card = function() {
    return {
        templateUrl: function(elem, attr){
            return '/views/cards/' + attr.type + '.html';
        }
    };
};

module.exports = card;