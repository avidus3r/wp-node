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
        id: postId
    }).populate(fields).exec(callback);
}

function getPosts(perPage, page, callback){
    Post.find().limit(perPage).sort().exec(callback);
}

function getSchema(){
    var schema = require('post-schema.json');
    var fields = [];

    for(var prop in schema){
        fields.push(prop);
    }
    fields.join(', ');
    return fields;
}

exports.getPost = getPost;
exports.getPosts = getPosts;
exports.getSchema = getSchema;
