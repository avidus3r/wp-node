'use strict';

var mongoose    = require('mongoose'),
    Post        = mongoose.model('Post'),
    Menu        = mongoose.model('Menu');

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

    destroy: function(postId){
        console.log(postId);

        this.exists(postId).then(function(result){
            if(result.length > 0){
                console.log('deleting...');
                Post.remove({'id': result[0].id}, function(err) {
                    if (err) {
                        console.error(JSON.stringify(err));
                    }
                });
            }
        });
    },

    exists: function(id){
        var query = Post.find({'id': id});
        return query.exec();
    },

    search: function(term){
        var s = decodeURIComponent(term);
        console.log(s);
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
    },

    sponsor: function(name){
        var query = Post.find({ 'sponsor.name': name});
        return query.exec();
    },

    postByType: function(type){
        var query = Post.find({ 'type': type});
        return query.exec();
    },

    menu: function(name){
        var query = Menu.find({ 'name': name});
        return query.exec();
    },

    vote: function(postId){
        var query = Post.find({ 'id': postId});
        return query.exec();
    }
};

module.exports = PostsController;