'use strict';

//Posts service used for posts REST endpoint
var PostService = function($resource) {
    return $resource('api/posts/:slug', {
        slug: '@slug'
    }, {
        update: {
            method: 'PUT'
        },
        query:{
            method: 'GET',
            url: 'api/posts',
            isArray: false
        }
    });
};

module.exports = PostService;