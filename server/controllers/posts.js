'use strict';

var mongoose    = require('mongoose'),
    Post        = mongoose.model('Post');

var PostsController = {
    updating: false,

    post: function(slug){
        var query = Post.findOne({'slug': slug});
        query.select('id date campaign_active sponsor parent guid modified modified_gmt slug type link title content excerpt author featured_image comment_status ping_status sticky format votes comment_count postmeta category featured_image_src author_meta');
        var promise = query.exec();
        return promise;
    },

    update: function(postID, data, cb){
        Post.update({'_id': postID}, data,{multi:true}, function(err, nItems){
            if(err){
                cb(false);
            }else{
                cb(true);
            }
        });
    },

    insert: function(newPost, cb){
        var post = new Post(newPost);

        post.save(function(err){
            if(err){
                cb(false);
            }else{
                cb(true);
            }
        });
    },

    exists: function(id){
        var query = Post.find({'id': id});
        return query.exec();
    },

    search: function(term){
        var s = decodeURIComponent(term);
        var query = Post.find({'content.rendered' : {$regex: (s), $options:'i' },'title.rendered' : {$regex: (s), $options:'i' } } ).limit(10);
        return query.exec();
    },

    list: function(numberOfPosts, pageNumber, skip){
        var skipItems = Number(skip);
        var query = Post.find().limit(numberOfPosts).skip(skipItems).sort({date:'desc'});
        query.$where(function(){
            return this.postmeta.hasOwnProperty("run_dates_0_channel");
        });
        return query.exec();
    },

    listByCategory: function(numberOfPosts, pageNumber, skip, category) {
        var skipItems = Number(skip);
        var query = Post.find().limit(numberOfPosts).skip(skipItems).sort({date:'desc'});
        query.$where('this.category[0].slug === "' + category + '"');
        return query.exec();
    }
};

module.exports = PostsController;