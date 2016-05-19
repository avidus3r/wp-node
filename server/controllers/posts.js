'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Menu = mongoose.model('Menu');

var mockConfig = {
    'perPage': 7,
    'cards': [{
        'type': 'video'
    }, {
        'type': 'ad'
    }, {
        'type': 'gif'
    }, {
        'type': 'partner'
    }, {
        'type': 'video'
    }, {
        'type': 'ad'
    }, {
        'type': 'gif'
    }]
};

var PostsController = {
    updating: false,

    _isMobile: function(ua) {
        var mobileUAStr = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
        var desktopUAStr = /Chrome|Safari|iPad|Firefox|MSIE|Opera/i;

        if (mobileUAStr.test(ua)) {
            return true;
        } else if (desktopUAStr.test(ua)) {
            return false;
        } else {
            return true;
        }
    },

    post: function(slug) {
        console.log('PostsController :: post', slug);
        var query = Post.findOne({
            'slug': slug
        });
        return query.exec();
    },

    update: function(postID, data, cb) {
        if (data.postmeta.hasOwnProperty('run_dates_0_run_time')) {
            if (data.postmeta.run_dates_0_run_time.length > 0) {
                var runDateStr = data.postmeta.run_dates_0_run_time[0];
                var runDate = new Date(Number(runDateStr) * 1000);
                data.facebook_rundate = runDate;
            }
        }
        Post.update({
            '_id': postID
        }, data, {
            multi: true
        }, function(err, nItems) {
            if (err) {
                cb(false);
            } else {
                cb(true);
            }
        });
    },

    insert: function(newPost, cb) {
        var post = new Post(newPost);

        post.save(function(err) {
            if (err) {
                console.log(err);
                cb(false);
            } else {
                cb(true);
            }
        });
    },

    destroy: function(postId) {
        console.log(postId);

        this.exists(postId).then(function(result) {
            if (result.length > 0) {
                console.log('deleting...');
                Post.remove({
                    'id': result[0].id
                }, function(err) {
                    if (err) {
                        console.error(JSON.stringify(err));
                    }
                });
            }
        });
    },

    exists: function(id) {
        var query = Post.find({
            'id': id
        });
        return query.exec();
    },

    search: function(term, numberOfPosts, pageNumber, skip) {
        //var db = mongoose.connection;
        var skipItems = Number(skip);
        var s = decodeURIComponent(term);
        var reggie = new RegExp(s, 'i');
        /*var dbQuery = db.collection('posts').find({ $or:[ {'content.rendered': reggie}, {'title.rendered': reggie} ]}).limit(Number(numberOfPosts)).skip(Number(skipItems));

         var results = [];

         dbQuery.forEach( function(doc){
         results.push(doc);
         });

         console.log(dbQuery.itcount());
         return results;*/

        var query = Post.find({'title.rendered': reggie}).limit(Number(numberOfPosts)).skip(Number(skipItems));
        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });

        var query = Post.find({
            'title.rendered': reggie
        }).limit(Number(numberOfPosts)).skip(Number(skipItems));
        return query.exec();
    },

    posts: function(req, numberOfPosts, pageNumber, skip) {
        var skipItems = Number(skip);

        var query = Post.find().skip(skipItems).limit(numberOfPosts).sort({
            'modified': -1
        });
        query.$where('this.type === "post" || this.type === "animated-gif" || this.type === "partner-post"');
        /*if(!this._isMobile(req.headers['user-agent'])){
         query.$where(function(){
         if(this.postmeta.hasOwnProperty('explicit')){
         return this.postmeta.explicit[0] === '';
         }else{
         return this;
         }
         });
         }*/
        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });

        return query.exec();
    },

    list: function(req, numberOfPosts, pageNumber, skip, notIn) {
        var skipItems = Number(skip);
        var appName = process.env.appname;
        var currentPath = req.headers.referer.replace('http://' + req.headers.host + '/', '');
        var currentItem = currentPath.replace(currentPath.split('/').shift(), '');
        currentItem = currentItem.replace(new RegExp('/', 'g'), '');

        if (currentItem.indexOf('?') !== -1) {
            currentItem = currentItem.replace(currentItem.substring(currentItem.indexOf('?'), currentItem.length), '');
        }

        /*var query = appName === 'altdriver' ? Post.find({'postmeta.run_dates_0_channel':'Facebook Main', '_id': { $nin:notIn } }).skip(skipItems).limit(numberOfPosts).sort({'postmeta.run_dates_0_run_time':-1}) : Post.find().skip(skipItems).limit(numberOfPosts).sort({'date':-1});*/

        var query = appName === 'altdriver' ? Post.find({
            'postmeta.run_dates_0_channel': 'Facebook Main',
            'slug': {
                $nin: currentItem
            }
        }).skip(skipItems).limit(numberOfPosts).sort({
            'postmeta.run_dates_0_run_time': -1
        }) : Post.find().skip(skipItems).limit(numberOfPosts).sort({
            'date': -1
        });

        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });
        return query.exec();
    },

    heroItems: function(req, numberOfPosts, pageNumber, skip) {
        var skipItems = Number(skip);
        var appName = process.env.appname;
        var query = appName === 'altdriver' ? Post.find({
            'postmeta.run_dates_0_channel': 'Facebook Main'
        }).skip(skipItems).limit(numberOfPosts).sort({
            'postmeta.run_dates_0_run_time': -1
        }) : Post.find().skip(skipItems).limit(numberOfPosts).sort({
            'date': -1
        });


        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });

        query.$where('this.type === "post" && this.type !== "animated-gif" && this.type !== "partner-post"');

        return query.exec();
    },

    articles: function(req, type, numberOfPosts, pageNumber, skip, format, params) {
        var skipItems = Number(skip);
        var q = null;

        if (!params.hasOwnProperty('category')) {
            q = {
                'type': type,
                'format': format
            };
        } else {
            q = {
                'type': type,
                'format': format,
                'category.slug': params.category
            };
        }
        var query = Post.find(q).skip(skipItems).limit(numberOfPosts).sort({
            'date': -1
        });

        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });
        //query.$where('this.type === "post" && this.type !== "animated-gif" && this.type !== "partner-post"');

        return query.exec();
    },

    trending: function(req, query, numberOfPosts, pageNumber, skip) {

        var skipItems = Number(skip);
        var appName = process.env.appname;

        var q = null;

        if (appName === 'altdriver') {
            switch (query) {
                case 'best':
                    //last 7 days excluding last 24 hours
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    var lastSevenDays = new Date();
                    lastSevenDays.setDate(lastSevenDays.getDate() - 7);

                    q = Post.find({
                        'postmeta.run_dates_0_channel': 'Facebook Main'
                    }).skip(skipItems).limit(numberOfPosts).sort({
                        'postmeta.run_dates_0_run_time': -1
                    });
                    q.$where('this.postmeta.run_dates_0_run_time >= ' + lastSevenDays.getTime() / 1000 + '&& this.postmeta.run_dates_0_run_time <= ' + yesterday.getTime() / 1000);
                    break;
                case 'hottest':
                    //last 24 hours
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    //q = Post.find({'postmeta.run_dates_0_channel':'Facebook Main' } ).skip(skipItems).limit(numberOfPosts).sort({'postmeta.run_dates_0_run_time':-1});
                    q = Post.find({
                        'postmeta.run_dates_0_channel': 'Facebook Main',
                        'facebook_rundate': {
                            $gte: yesterday
                        }
                    }).skip(skipItems).limit(numberOfPosts).sort({
                        'postmeta.run_dates_0_run_time': -1
                    });
                    //q.$where('this.postmeta.run_dates_0_run_time >= ' + yesterday.getTime()/1000);
                    break;
                case 'latest':
                    q = Post.find().skip(skipItems).limit(numberOfPosts).sort({
                        'date': -1
                    });
                    q.$where('this.type === "post" || this.type === "animated-gif" || this.type === "partner-post"');
                    break;
            }

        } else {
            q = Post.find().skip(skipItems).limit(numberOfPosts).sort({
                'date': -1
            });
        }


        q.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });

        return q.exec();
    },

    listByCategory: function(req, numberOfPosts, pageNumber, skip, category) {
        /* TODO: remove type:post restriction and fix layout for gifs and partner post/other post types */
        var skipItems = Number(skip);

        var query = Post.find({'category.slug':category, 'type': 'post'}).limit(numberOfPosts).skip(skipItems).sort({date:'desc'});

        query.$where(function(){
            if(this.postmeta.hasOwnProperty('explicit')){
                return this.postmeta.explicit[0] === '';
            }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                return this.postmeta.rw_check_synd[0] === '';
            }else{
                return this;
            }
        });

        return query.exec();
    },


    sponsor: function(name){
        var query = Post.find({'type':'altdsc_sponsor', 'slug':name}).limit(1);
        return query.exec();
    },

    sponsorPosts: function(name){
        var query = Post.find({ 'sponsor.name': name});
        return query.exec();
    },

    sponsorList: function(name){
        var query = Post.find({'type':'altdsc_sponsor', 'slug':name}).limit(1);
        return query.exec();
    },

    getSponsorByID: function(id){

    },

    campaignList: function(){
        var query = Post.find({'type':'altdsc-campaign', 'campaign_active':true});
        query.select('id');
        return query.exec();
    },

    sponsoredPosts: function(campaigns) {
        var query = Post.find({
            'postmeta._altdsc_campaign_id': {
                $in: campaigns
            }
        });
        /*query.$where(function(){
         return this.postmeta.hasOwnProperty("_altdsc_campaign_id");
         });*/
        return query.exec();
    },

    postByType: function(type, slug) {
        var query = null;
        if(slug){
            query = Post.findOne({ 'type': type, 'slug': slug});
        }else{
            query = Post.find({ 'type': type });
            query.$where(function(){
                if(this.postmeta.hasOwnProperty('explicit')){
                    return this.postmeta.explicit[0] === '';
                }else if(this.postmeta.hasOwnProperty('rw_check_synd')){
                    return this.postmeta.rw_check_synd[0] === '';
                }else{
                    return this;
                }
            });
        }

        return query.exec();
    },

    menu: function(name) {
        var query = Menu.find({
            'name': name
        });
        return query.exec();
    },

    vote: function(postId) {
        var query = Post.find({
            'id': postId
        });
        return query.exec();
    }
};

module.exports = PostsController;