'use strict';

var InstagramService = function($http, $q) {
    var base = 'https://api.instagram.com/v1';

    var clientId = 'c913962bdd2c4da4a4a0608f1f91dd3a';
    return {
        'get': function(count, query) {
            try {


                var deferred = $q.defer();

                var request = '/users/1471501453/media/recent';
                var url = base + request;
                var config = {
                    'params': {
                        'client_id': clientId,
                        'count': count,
                        'callback': 'JSON_CALLBACK'
                    }
                };

                $http.jsonp(url, config).then(
                    function (res) {
                        deferred.resolve(res);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            }catch(e){
                throw new Error('Error resolving instagram');
            }
        }
    };
};

module.exports = InstagramService;