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
                        /*var igItems = res.data.data;
                        igItems.forEach(function(item,index,igItems){
                            var text = item.caption.text;
                            var str = text.substring(text.indexOf('#'),text.length);
                            var tags = str.match(/^#[a-z0-9\s#]+/g).toString();
                            console.log(tags);
                            //tags = tags.substring(0,tags.length-1).split(' ');
                            var postIndex = index;
                            var tagLinks = null;
                            res.data.data[postIndex].caption.text = res.data.data[postIndex].caption.text.replace(tags, '');


                        });*/
                        //console.log(res);
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