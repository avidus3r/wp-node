var mongoose = require('mongoose'),
    Post = mongoose.model('Post');

function getPost(postId, callback){
    var schema = require('post-schema.json');
    var fields = [];

    for(var prop in schema){
        fields.push(prop);
    }
    fields.join(', ');
    Post.findOne({
        _id: postId
    }).populate(fields).exec(callback);
}

function getPosts(perPage, page, callback){
    Post.find().limit(perPage).sort().exec(callback);
}

exports.getPost = getPost;
exports.getPosts = getPosts;
