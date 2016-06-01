'use strict';

var mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Menu = mongoose.model('Menu'),
    Config = mongoose.model('Config'),
    async = require('async');


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
        // check if FB run dates should be added to ads and html in DB 
        var appName = process.env.appname;
        var skipItems = parseInt(req.params.skip);
        var skipRemainder = null;
        var skippedCards = null;
        var cards = null;
        var pageSkip = null;
        var dbData = null;
        var subResponse = [];
        var postConfig = null;
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
            type: 'sponsor',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }, {
            type: 'email_signup',
            count: 0
        }, {
            type: 'social_link',
            count: 0
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
            type: 'sponsor',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }, {
            type: 'email_signup',
            count: 0
        }, {
            type: 'social_link',
            count: 0
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
            type: 'sponsor',
            count: 0,
        }, {
            type: 'html',
            count: 0,
        }, {
            type: 'email_signup',
            count: 0
        }, {
            type: 'social_link',
            count: 0
        }];

        async.series(
            [

                function(callback) {
                    // Get config
                    console.log('retrieving config');
                    var query = Config.findOne({
                        'type': 'post-config'
                    });
                    query.exec().then(function(results) {
                        postConfig = results;
                        callback(null);
                    });
                },
                function(callback) {
                    // set variables 
                    console.log('setting variables');
                    skipRemainder = skipItems % postConfig.cards.length;
                    skippedCards = postConfig.cards.slice(0, skipRemainder);
                    cards = postConfig.cards.slice(skipRemainder, postConfig.cards.length);
                    pageSkip = Math.floor(skipItems / postConfig.cards.length);
                    subResponse = [];
                    callback(null);
                },
                function(callback) {
                    // Get post skip items
                    console.log('computing type counts');
                    async.each(postConfig.cards, function(item, callback) {
                        async.each(typeCounts, function(config, callback) {
                            if (config.type == item.type) {
                                config.count += 1;
                            }
                            callback();
                        });
                        callback();
                    }, function(err) {
                        //console.log(typeCounts);
                        callback(null);
                    });
                },
                function(callback) {
                    // Get pre skip items
                    console.log('computing skip');
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
                    console.log('computing offset');
                    if (pageSkip > 0) {
                        //full page of items offset by pageSkip
                        async.each(offSetCounts, function(item, callback) {
                            async.each(postConfig.cards, function(config, callback) {
                                if (config.type == item.type) {
                                    item.count += pageSkip;
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
                                            //console.log('increasing count');
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
                    } else {
                        // add the offset for a partial first page
                        if (skipRemainder != 0) {
                            async.each(offSetCounts, function(item, callback) {
                                async.each(skippedTypeCounts, function(config, callback) {
                                    if (config.type == item.type) {
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
                    }
                },
                function(callback) {
                    //make DB queries 
                    console.log('gathering data');
                    console.log(typeCounts);
                    async.parallel({
                            video: function(callback) {
                                var query = appName === 'altdriver' ? Post.find({
                                    'postmeta.run_dates_0_channel': 'Facebook Main'
                                }).skip(offSetCounts[0].count).limit(typeCounts[0].count + skippedTypeCounts[0].count).sort({
                                    'postmeta.run_dates_0_run_time': -1
                                }) : Post.find().skip(offSetCounts[0].count).limit(typeCounts[0].count + skippedTypeCounts[0].count).sort({
                                    'date': -1
                                });
                                query.$where('this.type === "post"');
                                if (typeCounts[0].count != 0) {
                                    query.exec().then(function(results) {
                                        console.log('videos ' + results.length);
                                        callback(null, results);
                                    });
                                } else {
                                    var results = [];
                                    callback(null, results);
                                }
                            },
                            ad: function(callback) {
                                var ind = 0;
                                var results = [];
                                async.whilst(
                                    function() {
                                        return ind < typeCounts[1].count;
                                    },
                                    function(callback) {
                                        ind++;
                                        results.push({
                                            type: 'ad',
                                            content: {
                                                rendered: ''
                                            }
                                        });
                                        callback(null, ind);
                                    },
                                    function(err, n) {
                                        callback(null, results);
                                    }
                                );
                            },
                            gif: function(callback) {
                                var query = appName === 'altdriver' ? Post.find({
                                    'postmeta.run_dates_0_channel': 'Facebook Main'
                                }).skip(offSetCounts[2].count).limit(typeCounts[2].count + skippedTypeCounts[2].count).sort({
                                    'postmeta.run_dates_0_run_time': -1
                                }) : Post.find().skip(offSetCounts[2].count).limit(typeCounts[2].count + skippedTypeCounts[2].count).sort({
                                    'date': -1
                                });
                                query.$where('this.type === "animated-gif"');
                                if (typeCounts[2].count != 0) {
                                    query.exec().then(function(results) {
                                        console.log('gifs ' + results.length);
                                        callback(null, results);
                                    });
                                } else {
                                    var results = [];
                                    callback(null, results);
                                }
                            },
                            html: function(callback) {
                                var ind = 0;
                                var results = [];
                                async.whilst(
                                    function() {
                                        return ind < typeCounts[4].count;
                                    },
                                    function(callback) {
                                        ind++;
                                        results.push({
                                            type: 'html',
                                            content: {
                                                rendered: postConfig.html
                                            }
                                        });
                                        callback(null, ind);
                                    },
                                    function(err, n) {
                                        callback(null, results);
                                    }
                                );
                            },
                            sponsor: function(callback) {
                                var ind = 0;
                                var results = [];
                                var defaultQuery = appName === 'altdriver' ? Post.find({
                                    'postmeta.run_dates_0_channel': 'Facebook Main'
                                }).skip(offSetCounts[0].count).limit(typeCounts[3].count + skippedTypeCounts[3].count).sort({
                                    'postmeta.run_dates_0_run_time': -1
                                }) : Post.find().skip(offSetCounts[3].count).limit(typeCounts[3].count + skippedTypeCounts[3].count).sort({
                                    'date': -1
                                });
                                defaultQuery.$where('this.type === "post"');
                                if (typeCounts[3].count > 0) {
                                    console.log('getting sponsor data');
                                    var query = Post.find({
                                        'type': 'altdsc-campaign',
                                        'campaign_active': true
                                    });
                                    query.select('id');
                                    query.exec().then(function(result) {
                                        if (result.length != 0) {
                                            var activeCampaigns = [];
                                            for (var i = 0; i < result.length; i++) {
                                                var postId = result[i].id;
                                                activeCampaigns.push(postId.toString());
                                            }
                                            var sponsoredQuery = Post.find({
                                                'postmeta._altdsc_campaign_id': {
                                                    $in: activeCampaigns
                                                }
                                            });
                                            sponsoredQuery.then(function(sponsorPosts) {
                                                if (result.length === 0) {
                                                    defaultQuery.exec().then(function(results) {
                                                        callback(null, results);
                                                    });
                                                } else {
                                                    callback(null, sponsorPosts);
                                                }
                                            });
                                        } else {
                                            defaultQuery.exec().then(function(results) {
                                                callback(null, results);
                                            });
                                        }
                                    });
                                } else {
                                    defaultQuery.exec().then(function(results) {
                                        callback(null, results);
                                    });
                                }
                            },
                            email_signup: function(callback) {
                                var ind = 0;
                                var results = [];
                                async.whilst(
                                    function() {
                                        return ind < typeCounts[5].count;
                                    },
                                    function(callback) {
                                        ind++;
                                        results.push({
                                            type: 'email_signup',
                                            content: {
                                                rendered: ''
                                            }
                                        });
                                        callback(null, ind);
                                    },
                                    function(err, n) {
                                        callback(null, results);
                                    }
                                );
                            },
                            social_link: function(callback) {
                                var ind = 0;
                                var results = [];
                                async.whilst(
                                    function() {
                                        return ind < typeCounts[6].count;
                                    },
                                    function(callback) {
                                        ind++;
                                        results.push({
                                            type: 'social_link',
                                            content: {
                                                rendered: ''
                                            }
                                        });
                                        callback(null, ind);
                                    },
                                    function(err, n) {
                                        callback(null, results);
                                    }
                                );
                            },
                        },
                        function(err, results) {
                            dbData = results;
                            callback(null);
                            //console.log(dbData);
                        }
                    );
                },
                function(callback) {
                    //arranging response post config
                    //console.log(cards);
                    console.log('arranging response post config');
                    async.forEachOf(cards, function(item, ind, callback) {
                        //console.log(dbData[item.type]);
                        var unit = dbData[item.type].shift();
                        //console.log(item.type);
                        subResponse.push(unit);
                        callback();
                    }, function(err) {
                        callback(null);
                    });
                },
                function(callback) {
                    //arranging response pre config
                    //console.log(skippedCards);
                    console.log('arranging response pre config');
                    async.forEachOf(skippedCards, function(item, ind, callback) {
                        // console.log('----');
                        //console.log(item.type);
                        var unit = dbData[item.type].shift();
                        console.log(unit);
                        subResponse.push(unit);
                        callback();
                    }, function(err) {
                        callback(null);
                    });
                }
            ],
            //callback 
            function(err) {
                // results 
                res.send(subResponse);
            }
        );
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