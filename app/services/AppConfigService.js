'use strict';

var AppConfigService = function($http, $q) {
    var base = '/getenv';

    return {
        'get': function() {
            try {
                var deferred = $q.defer();

                var url = base;

                $http.get(url).then(
                    function (res) {
                        deferred.resolve(res);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            }catch(e){
                throw new Error('Error resolving config');
            }
        }
    };
};

module.exports = AppConfigService;