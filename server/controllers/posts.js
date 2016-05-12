'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Menu = mongoose.model('Menu'),
    async = require('async');

var mockConfig = {
    cardAmount: 10,
    cards: [{
        type: 'video'
    }, {
        type: 'ad'
    }, {
        type: 'gif'
    }, {
        type: 'video'
    }, {
        type: 'partner'
    }, {
        type: 'html'
    }, {
        type: 'ad'
    }, {
        type: 'gif'
    }, {
        type: 'video'
    }, {
        type: 'partner'
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

        if (!this._isMobile(req.headers['user-agent'])) {
            query.$where(function() {
                if (this.postmeta.hasOwnProperty('explicit')) {
                    return this.postmeta.explicit[0] === '';
                } else {
                    return this;
                }
            });
        }

        return query.exec();
    },

    listV2: function(req, res) {
        //TODO
        // query for items and store in groups 
        // combine items in Array in order of config 
        // send Array in response 
        var appName = process.env.appname;
        var skipItems = parseInt(req.params.skip);
        var skipRemainder = skipItems % mockConfig.cards.length;
        var configPosition = mockConfig.cards.length - skipRemainder;
        var skippedCards = mockConfig.cards.slice(0, configPosition);
        var cards = mockConfig.cards.slice(configPosition, mockConfig.cards.length);
        var pageSkip = Math.floor(skipItems / mockConfig.cards.length);
        var dbData = null;



        var typeCounts = [{
            type: 'video',
            count: 0
        }, {
            type: 'ad',
            count: 0,
        }, {
            type: 'gif',
            count: 0,
        }, {
            type: 'partner',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }];

        var skippedTypeCounts = [{
            type: 'video',
            count: 0
        }, {
            type: 'ad',
            count: 0,
        }, {
            type: 'gif',
            count: 0,
        }, {
            type: 'partner',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }];

        var offSetCounts = [{
            type: 'video',
            count: 0
        }, {
            type: 'ad',
            count: 0,
        }, {
            type: 'gif',
            count: 0,
        }, {
            type: 'partner',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }];

        async.series(
            [

                function(callback) {
                    // Get post skip items
                    async.each(cards, function(item, callback) {
                        async.each(typeCounts, function(config, callback) {
                            if (config.type == item.type) {
                                config.count += 1;
                            }
                            callback();
                        });
                        callback();
                    }, function(err) {
                        console.log(typeCounts);
                        callback(null);
                    });
                },
                function(callback) {
                    // Get pre skip items
                    async.each(skippedCards, function(item, callback) {
                        async.each(skippedTypeCounts, function(config, callback) {
                            if (config.type == item.type) {
                                config.count += 1;
                            }
                            callback();
                        });
                        callback();
                    }, function(err) {
                        //console.log(skippedTypeCounts);
                        callback(null);
                    });
                },
                function(callback) {
                    // determine offsets
                    if (pageSkip > 0) {
                        //full page of items offset by pageSkip
                        async.each(offSetCounts, function(item, callback) {
                            async.each(typeCounts, function(config, callback) {
                                if (config.type == item.type) {
                                    console.log('increasing count');
                                    item.count = config.count * pageSkip;
                                }
                                callback();
                            });
                            callback();
                        }, function(err) {
                            //console.log(offSetCounts);
                            if (skipRemainder != 0) {
                                async.each(offSetCounts, function(item, callback) {
                                    async.each(skippedTypeCounts, function(config, callback) {
                                        if (config.type == item.type) {
                                            console.log('increasing count');
                                            item.count = item.count + config.count;
                                        }
                                        callback();
                                    });
                                    callback();
                                }, function(err) {
                                    //console.log(offSetCounts);
                                    callback(null);
                                });
                            } else {
                                callback(null);
                            }
                        });
                    }
                },
                function(callback) {
                    //make DB queries 
                    console.log('config');
                    console.log(mockConfig.cards);
                    console.log('---------------');
                    console.log('type count');
                    console.log(typeCounts);
                    console.log('---------------');
                    console.log('skipped Type Counts');
                    console.log(skippedTypeCounts);
                    console.log('---------------');
                    console.log('off Set Counts');
                    console.log(offSetCounts);
                    console.log('---------------');
                    // async.parallel({
                    //         video: function(callback) {
                    //             var query = appName === 'altdriver' ? Post.find({
                    //                 'postmeta.run_dates_0_channel': 'Facebook Main'
                    //             }).skip(skippedTypeCounts[0].count).limit(typeCounts[0].count).sort({
                    //                 'postmeta.run_dates_0_run_time': -1
                    //             }) : Post.find().skip(skippedTypeCounts[0].count).limit(typeCounts[0].count).sort({
                    //                 'date': -1
                    //             });
                    //             query.$where('this.type === "post"');
                    //             query.exec().then(function(results) {
                    //                 console.log(results.length);
                    //                 callback(null, results);
                    //             });
                    //         },
                    //         ad: function(callback) {
                    //             var query = appName === 'altdriver' ? Post.find({
                    //                 'postmeta.run_dates_0_channel': 'Facebook Main'
                    //             }).skip(skippedTypeCounts[1].count).limit(typeCounts[1].count).sort({
                    //                 'postmeta.run_dates_0_run_time': -1
                    //             }) : Post.find().skip(skippedTypeCounts[1].count).limit(typeCounts[1].count).sort({
                    //                 'date': -1
                    //             });
                    //             query.$where('this.type === "ad"');
                    //             query.exec().then(function(results) {
                    //                 console.log(results.length);
                    //                 callback(null, results);
                    //             });
                    //         },
                    //         gif: function(callback) {
                    //             var query = appName === 'altdriver' ? Post.find({
                    //                 'postmeta.run_dates_0_channel': 'Facebook Main'
                    //             }).skip(skippedTypeCounts[2].count).limit(typeCounts[2].count).sort({
                    //                 'postmeta.run_dates_0_run_time': -1
                    //             }) : Post.find().skip(skippedTypeCounts[2].count).limit(typeCounts[2].count).sort({
                    //                 'date': -1
                    //             });
                    //             query.$where('this.type === "animated-gif"');
                    //             query.exec().then(function(results) {
                    //                 console.log(results.length);
                    //                 callback(null, results);
                    //             });
                    //         },
                    //         html: function(callback) {
                    //             var query = appName === 'altdriver' ? Post.find({
                    //                 'postmeta.run_dates_0_channel': 'Facebook Main'
                    //             }).skip(skippedTypeCounts[4].count).limit(typeCounts[4].count).sort({
                    //                 'postmeta.run_dates_0_run_time': -1
                    //             }) : Post.find().skip(skippedTypeCounts[4].count).limit(typeCounts[4].count).sort({
                    //                 'date': -1
                    //             });
                    //             query.$where('this.type === "html"');
                    //             query.exec().then(function(results) {
                    //                 console.log(results.length);
                    //                 callback(null, results);
                    //             });
                    //         },
                    //         partner: function(callback) {
                    //             var query = appName === 'altdriver' ? Post.find({
                    //                 'postmeta.run_dates_0_channel': 'Facebook Main'
                    //             }).skip(skippedTypeCounts[3].count).limit(typeCounts[3].count).sort({
                    //                 'postmeta.run_dates_0_run_time': -1
                    //             }) : Post.find().skip(skippedTypeCounts[3].count).limit(typeCounts[3].count).sort({
                    //                 'date': -1
                    //             });
                    //             query.$where('this.type === "partner-post"');
                    //             query.exec().then(function(results) {
                    //                 console.log(results.length);
                    //                 callback(null, results);
                    //             });
                    //         },
                    //     },
                    //     function(err, results) {
                    //         dbData = results;
                    //         callback(null);
                    //     }
                    // );
                },
                function(callback) {
                    console.log('done with db queries');

                }
            ],
            //callback 
            function(err, results) {
                // results 
            }
        );

        res.send('success');
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

        if (!this._isMobile(req.headers['user-agent'])) {
            query.$where(function() {
                if (this.postmeta.hasOwnProperty('explicit')) {
                    return this.postmeta.explicit[0] === '';
                } else {
                    return this;
                }
            });
        }
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

        if (!this._isMobile(req.headers['user-agent'])) {
            query.$where(function() {
                if (this.postmeta.hasOwnProperty('explicit')) {
                    return this.postmeta.explicit[0] === '';
                } else {
                    return this;
                }
            });
        }
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

        if (!this._isMobile(req.headers['user-agent'])) {
            q.$where(function() {
                if (this.postmeta.hasOwnProperty('explicit')) {
                    return this.postmeta.explicit[0] === '';
                } else {
                    return this;
                }
            });
        }

        return q.exec();
    },

    listByCategory: function(req, numberOfPosts, pageNumber, skip, category) {
        /* TODO: remove type:post restriction and fix layout for gifs and partner post/other post types */
        var skipItems = Number(skip);
        var query = Post.find({
            'category.slug': category,
            'type': 'post'
        }).limit(numberOfPosts).skip(skipItems).sort({
            date: 'desc'
        });
        if (!this._isMobile(req.headers['user-agent'])) {
            query.$where(function() {
                if (this.postmeta.hasOwnProperty('explicit')) {
                    return this.postmeta.explicit[0] === '';
                } else {
                    return this;
                }
            });
        }
        return query.exec();
    },

    sponsor: function(name) {
        var query = Post.find({
            'sponsor.name': name
        });
        return query.exec();
    },

    sponsorList: function() {
        var query = Post.find({
            'type': 'altdsc_sponsor'
        }).limit(10);
        return query.exec();
    },

    campaignList: function() {
        var query = Post.find({
            'type': 'altdsc-campaign',
            'campaign_active': true
        });
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
        if (slug) {
            query = Post.findOne({
                'type': type,
                'slug': slug
            });
        } else {
            query = Post.find({
                'type': type
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