'use strict';

var express         = require('express'),
    app             = express(),
    router          = express.Router(),
    request         = require('request'),
    md5             = require('js-md5'),
    PostController  = require('../controllers/posts'),
    apicache        = require('apicache').options({ debug: true }).middleware;

router.put('/post', function(req,res){

    try{
        var item = JSON.parse(req.body.item);
        PostController.hasPost(item[0].id).then(function(result){
            if(result.length === 0){
                var newPost = item[0];
                PostsController.insert(newPost, function(success){
                    if(!success) res.sendStatus(500);
                    res.sendStatus(200);
                });
            }else{
                var updatePost = result[0];
                PostsController.update(updatePost._id, item[0], function(success){
                    if(!success) res.sendStatus(500);
                    res.sendStatus(200);
                });
            }
        });
    }catch(e){
        console.error(JSON.stringify(e));
        res.sendStatus(500);
    }
});

/*
 Menus
 */
router.get('/api/menu', apicache('3600 minutes'), function(req, res){
    PostController.menu(req.params.name).then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});

router.get('/api/vote/:id/:val', function(req, res){
    var val = Number(req.params.val);
    console.log(val);
    var field = val === 2 ? 'votes_up' : 'votes_down';
    console.log(field);
    PostController.vote(req.params.id, val).then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            PostController.updating = true;
            var post = result[0];

            if(typeof post.votes === 'undefined'){
                console.log('no votes');
                post.votes = {
                    votes_up:0,
                    votes_down:0,
                    total_votes:0
                };
                post.votes[field] += 1;
                post.votes.total_votes += 1;
            }else{
                console.log('has votes');
                var votes = Number(post.votes[field]);
                var total = Number(post.votes.total_votes);
                votes = votes + 1;
                total = total + 1;
                post.votes[field] = votes;
                post.votes.total_votes = total;
            }
            PostController.update(result[0]._id, post, function (success) {
                if (!success) res.sendStatus(500);

                res.sendStatus(200);
                PostController.updating = false;
            });
        }
    });
});

/*
 Sponsor List

router.get('/api/sponsors', function(req, res){
    PostController.postByType('altdsc_sponsor').then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});
 */
/*
 Sponsor Single
 */
router.get('/api/sponsor/:sponsor', apicache('20 minutes'), function(req, res){
    PostController.sponsor(req.params.sponsor).then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});

/*
 Search
 */
router.get('/api/search/:query/:perPage/:page/:skip', apicache('20 minutes'), function(req,res){

    var data = PostController.search(encodeURIComponent(req.params.query), req.params.perPage, req.params.page, req.params.skip);
    //res.send(data);
    data.then(function(result){
        if(result.length === 0){
            res.send(JSON.stringify(result));
        }else{
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Single Post
 */
router.get('/api/:slug', apicache('20 minutes'), function(req,res){
    var data = PostController.post(req.params.slug);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Category List
 */
router.get('/api/category/:category/:perPage/:page/:skip', apicache('20 minutes'), function(req, res){
    var data = PostController.listByCategory(parseInt(req.params.perPage),req.params.page, req.params.skip, req.params.category);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Post List
 */
router.get('/api/posts/:perPage/:page/:skip', apicache('20 minutes'), function(req,res){
    var data = PostController.list(parseInt(req.params.perPage),req.params.page, req.params.skip);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.send(JSON.stringify(result));
        }
    });
});

router.get('/update/:postId', function(req,res){

    if(req.headers.hasOwnProperty('secret')){
        var apisecret = JSON.parse(process.env.apisecret);
        if(md5(req.headers.secret) !== apisecret.uname){
            res.sendStatus(403);
            return false;
        }
    }else if(req.headers['user-agent'] !== 'WordPress/4.3.1; http://altdriver.altmedia.com'){
        res.sendStatus(403);
        return false;
    }
    var postId = req.params.postId;
    var url = 'http://altdriver.altmedia.com/wp-json/wp/v2/posts/' + postId;
    PostController.updating = false;

        PostController.updating = true;
        try{
            request(url, function (error, response, body) {

                if(response.statusCode === 403){
                    PostController.destroy(postId);
                }

                if(response.statusCode === 200) {
                    var post = JSON.parse(body);

                    PostController.exists(post.id).then(function (result) {
                        if (result.length === 0) {

                            PostController.insert(post, function (success) {
                                if (!success) res.sendStatus(500);
                                res.sendStatus(200);
                                PostController.updating = false;
                            });

                        } else {
                            var updatePost = result[0];

                            PostController.update(updatePost._id, post, function (success) {
                                if (!success) res.sendStatus(500);
                                //apicache.clear(updatePost.slug);
                                res.sendStatus(200);
                                PostController.updating = false;
                            });
                        }
                    });
                }else{
                    res.sendStatus(response.statusCode);
                    PostController.updating = false;
                }
            });
        }catch(e){
            var error = {'error':e};
            console.log(e);
            res.send(JSON.stringify(error));
        }

    //res.end();
});


/*router.get('/posts/:perPage/:page', function(req, res) {
 var post = require('./lib/post');
 var perPage = parseInt(req.params.perPage);
 var page = parseInt(req.params.page);
 post.getPosts(perPage, page, function(err,result){
 res.send(result);
 });
 });*/

module.exports = router;