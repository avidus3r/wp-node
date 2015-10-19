var mongoose    = require('mongoose'),
    async       = require('async');

require(process.cwd() + '/lib/connection.js');

var Post = mongoose.model('Post');

var data = require(process.cwd() + '/data/posts_1.json');

var addPosts = function(callback){
    Post.create(data, function(error){
        if(error){
            console.error('Error: ' + error);
        }

        console.info('done adding posts');
        callback();
    });
};

async.series([addPosts],function(error){
    if(error){
        console.error('Error: ', error);
    }

    mongoose.connection.close();
    console.log('done!');
});