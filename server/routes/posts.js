'use strict';

var express         = require('express'),
    app             = express(),
    router          = express.Router(),
    request         = require('request'),
    md5             = require('js-md5'),
    multiparty      = require('multiparty'),
//extIP	        = require('external-ip'),
    PostController  = require('../controllers/posts'),
    ApiCache        = require('apicache'),
    apicache        = ApiCache.options({ debug: true }).middleware;

router.get('/api/cache/index', function(req, res, next) {
    res.send(ApiCache.getIndex());
});

router.post('/api/cache/clear', function(req, res, next) {
    var form = new multiparty.Form();
    /*var getIP = extIP({
     replace: true,
     services: ['http://ifconfig.co/x-real-ip', 'http://ifconfig.io/ip'],
     timeout: 600,
     getIP: 'parallel'
     });*/

    /*getIP(function (err, ip) {
     if (err) {
     throw err;
     }
     if(ip.indexOf('159.63.144.2') === -1) return false;

     });*/
    var apisecret = null;
    form.parse(req, function(err, fields, files) {
        if(fields.hasOwnProperty('secret') && fields.hasOwnProperty('pwd')){

            try{
                apisecret = JSON.parse(process.env.apisecret);
            }catch(e){
                apisecret = process.env.apisecret;
            }
            if(md5(fields.secret[0]) !== apisecret.uname || md5(fields.pwd[0]) !== apisecret.pwd){
                res.sendStatus(403);
                return false;
            }
            var key = fields.key[0];
            ApiCache.clear(key);
        }
    });
    res.sendStatus(200);

});

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
            res.set('Cache-Control','max-age=600');
            res.send(JSON.stringify(result));
        }
    });
});

router.get('/api/vote/:id/:val', function(req, res){
    var val = Number(req.params.val);
    var field = val === 2 ? 'votes_up' : 'votes_down';
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
 */


router.get('/api/sponsors', apicache('45 minutes'), function(req, res){
    PostController.sponsorList().then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Campaign List
 */


router.get('/api/campaigns', apicache('45 minutes'), function(req, res){
    PostController.campaignList().then(function(result){
        if(result.length === 0){
            res.send(result);
        }else{
            var activeCampaigns = [];
            for(var i=0;i<result.length;i++){
                var postId = result[i].id;
                activeCampaigns.push(postId.toString());
            }
            PostController.sponsoredPosts(activeCampaigns).then(function(sponsorPosts){
                if(result.length === 0){
                    res.send(sponsorPosts);
                }else{
                    res.set('Cache-Control','max-age=600');
                    res.send(JSON.stringify(sponsorPosts));
                }
            });
            //res.send(JSON.stringify(result));
        }
    });
});

/*
 Sponsor Single
 */
router.get('/api/sponsor/:sponsor', apicache('45 minutes'), function(req, res){
    PostController.sponsor(req.params.sponsor).then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.send(JSON.stringify(result));
        }
    });
});

/*
 Search
 */
router.get('/api/search/:query/:perPage/:page/:skip', apicache('5 minutes'), function(req,res){

    var data = PostController.search(encodeURIComponent(req.params.query), req.params.perPage, req.params.page, req.params.skip);
    //res.send(data);
    data.then(function(result){
        if(result.length === 0){
            res.send(JSON.stringify(result));
        }else{
            res.set('Cache-Control','max-age=600');
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Single Post
 */
router.get('/api/:slug', apicache('45 minutes'), function(req,res){
    var data = PostController.post(req.params.slug);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.send(JSON.stringify(result));
        }
    });
});


/*
 Category List
 */
router.get('/api/category/:category/:perPage/:page/:skip', apicache('45 minutes'), function(req, res){

    var data = PostController.listByCategory(parseInt(req.params.perPage),parseInt(req.params.page), parseInt(req.params.skip), req.params.category);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.status(200).send(JSON.stringify(result));
        }
    });
});


/*
 Feed Posts List
 */
router.get('/api/posts/:perPage/:page/:skip', apicache('45 minutes'), function(req,res){
    var data = PostController.list(req, parseInt(req.params.perPage),req.params.page, req.params.skip);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});

router.get('/update/:restParent/:restBase/:postId', function(req,res){
    console.log(req.headers, req.params, req.body);
    if(req.headers.hasOwnProperty('secret')){
        var apisecret = JSON.parse(process.env.apisecret);
        if(md5(req.headers.secret) !== apisecret.uname){
            res.sendStatus(403);
            return false;
        }
    }else if(req.headers['user-agent'].indexOf('WordPress/') === -1 || req.headers['user-agent'].indexOf('altmedia.com') === -1){
        res.sendStatus(403);
        return false;
    }
    var postId = req.params.postId;
    var restBase = req.params.restBase;
    var restParent = req.params.restParent;

    var host = null;
    switch(process.env.NODE_ENV){
        case 'production':
            host = restParent + '.altmedia.com';
            break;
        case 'development':
            host = restParent + '.staging.altmedia.com';
            break;
        default:
            host = restParent + '.local.altmedia.com';
            break;
    }
    var url = 'http://' + host + '/wp-json/wp/v2/' + restBase + '/' + postId;
    console.log(url);
    PostController.updating = false;

    PostController.updating = true;
    try{
        setTimeout(function(){
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
                                //res.sendStatus(200);
                                PostController.updating = false;
                            });

                        } else {
                            var updatePost = result[0];

                            PostController.update(updatePost._id, post, function (success) {
                                if (!success) res.sendStatus(500);
                                ApiCache.clear('/api/' + updatePost.slug);
                                var env = process.env.NODE_ENV === 'production' ? (process.env.appname === 'altdriver' ? 'www.' : '') : 'staging.';
                                var appUrl = process.env.appname === 'altdriver' ? env + 'altdriver.com' : env + process.env.appname + '.com';
                                var postUrl = updatePost.link.replace(updatePost.link.substring(0,updatePost.link.indexOf('.com/')+4),'http://'+appUrl);
                                console.log('posturl: ', postUrl);
                                setTimeout(function() {
                                    request
                                        .post('https://graph.facebook.com/?id=' + encodeURIComponent(postUrl) + '&scrape=true')
                                        .on('response', function (response) {
                                            console.log(response);
                                        });
                                },3000);

                                //res.sendStatus(200);
                                PostController.updating = false;
                            });
                        }
                    });
                }else{
                    //res.sendStatus(response.statusCode);
                    PostController.updating = false;
                }
            });
        },4000);
        res.sendStatus(200);
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