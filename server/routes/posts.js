'use strict';

var express = require('express'),
    app = express(),
    router = express.Router(),
    PostController = require('../controllers/posts');

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
 Search
 */
router.get('/api/search/:slug', function(req,res){
    var data = PostController.search(encodeURIComponent(req.params.slug));
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
router.get('/api/:slug', function(req,res){
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
router.get('/api/category/:category/:perPage/:page/:skip', function(req, res){
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
 Sponsor List
 */
router.get('/api/sponsors', function(req, res){
    // PostController.getSponsors();
});

/*
 Sponsor Single
 */
router.get('/api/sponsors/:sponsor', function(req, res){
    // PostController.getSponsor(req.params.sponsor);
});


/*
 Post List
 */
router.get('/api/:perPage/:page/:skip', function(req,res){
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
    if(!PostController.updating){
        PostController.updating = true;
        try{
            request(url, function (error, response, body) {
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

                                res.sendStatus(200);
                                PostController.updating = false;
                            });
                        }
                    });
                }else{
                    res.sendStatus(response.statusCode);
                }
            });
        }catch(e){
            res.send(JSON.stringify(e));
        }
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