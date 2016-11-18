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
 Single Custom Post Type
 */
router.get('/api/type/:type/:slug?', function(req,res){
    console.log('router.get type');
    if(typeof req.params.slug === 'undefined'){
        req.params.slug = null;
    }
    var data = PostController.postByType(req.params.type, req.params.slug);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});

/*
 Menus
 */
router.get('/api/menu', apicache('3600 minutes'), function(req, res){
    PostController.menu(req.params.name).then(function(result){
        if(result.length === 0){
            res.send([{"_id":"5693e6e5a3b5704a3d3805e1","ID":2818,"post_author":"1","post_date":"2015-02-14T15:00:22.000Z","post_date_gmt":"2015-02-14T20:00:22.000Z","post_content":"YEEHAW! If it gives you a rush, gets your blood pumping, makes your jaw drop, whatever, we feature all of it here. Strap in, bros!","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"2818","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=2818","menu_order":1,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":2818,"menu_item_parent":"0","object_id":"36","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/insane-stunts/","title":"Insane Stunts","target":"","attr_title":"","description":"YEEHAW! If it gives you a rush, gets your blood pumping, makes your jaw drop, whatever, we feature all of it here. Strap in, bros!","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e2","ID":2820,"post_author":"1","post_date":"2015-02-14T15:33:50.000Z","post_date_gmt":"2015-02-14T20:33:50.000Z","post_content":"Who doesnu2019t love some adrenaline pumping vehicular carnage? Get your crash junkie fix here!","post_title":"Crash & Burn","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"crash-burn","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=2820","menu_order":2,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":2820,"menu_item_parent":"0","object_id":"266","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/crash-burn/","title":"Crash & Burn","target":"","attr_title":"","description":"Who doesnu2019t love some adrenaline pumping vehicular carnage? Get your crash junkie fix here!","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e3","ID":7274,"post_author":"1","post_date":"2015-09-29T17:02:46.000Z","post_date_gmt":"2015-09-29T21:02:46.000Z","post_content":"Awesome car video game content including real world concept cars from in-game designs, the best gameplay video clips and record breaking achievements.","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"closed","ping_status":"closed","post_password":"","post_name":"7274","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=7274","menu_order":3,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":7274,"menu_item_parent":"0","object_id":"392","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/gaming/","title":"Gaming","target":"","attr_title":"","description":"Awesome car video game content including real world concept cars from in-game designs, the best gameplay video clips and record breaking achievements.","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e4","ID":2822,"post_author":"1","post_date":"2015-02-14T15:38:18.000Z","post_date_gmt":"2015-02-14T20:38:18.000Z","post_content":"Behold the beauty queens of the car world: Ferrari, Porsche, Lamborghini, Hellcats, and more! Watch them compete via performance tests like burnouts, dyno tests, drag races, acceleration and roar, test runs, and more. Witness here the glory of top notch performances.","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"2822","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=2822","menu_order":4,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":2822,"menu_item_parent":"0","object_id":"125","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/sports-car/","title":"Sports Car","target":"","attr_title":"","description":"Behold the beauty queens of the car world: Ferrari, Porsche, Lamborghini, Hellcats, and more! Watch them compete via performance tests like burnouts, dyno tests, drag races, acceleration and roar, test runs, and more. Witness here the glory of top notch performances.","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e5","ID":375,"post_author":"1","post_date":"2014-09-15T17:35:14.000Z","post_date_gmt":"2014-09-15T21:35:14.000Z","post_content":"","post_title":"Lux","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"375","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://altdriver.com/?p=375","menu_order":5,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":375,"menu_item_parent":"0","object_id":"31","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/luxury/","title":"Lux","target":"","attr_title":"","description":"","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e6","ID":2819,"post_author":"1","post_date":"2015-02-14T15:00:23.000Z","post_date_gmt":"2015-02-14T20:00:23.000Z","post_content":"Vehicles on four wheels arenu2019t the only ones out on the road. We collect stories about these two-wheel beasts here.","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"2819","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=2819","menu_order":6,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":2819,"menu_item_parent":"0","object_id":"38","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/motorcycles/","title":"Motorcycles","target":"","attr_title":"","description":"Vehicles on four wheels arenu2019t the only ones out on the road. We collect stories about these two-wheel beasts here.","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e7","ID":7275,"post_author":"1","post_date":"2015-09-29T17:05:33.000Z","post_date_gmt":"2015-09-29T21:05:33.000Z","post_content":"News, videos, pictures reviews and articles covering the best in classic, antique, muscle and collector cars.","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"closed","ping_status":"closed","post_password":"","post_name":"7275","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=7275","menu_order":7,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":7275,"menu_item_parent":"0","object_id":"25","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/classics/","title":"Classics","target":"","attr_title":"","description":"News, videos, pictures reviews and articles covering the best in classic, antique, muscle and collector cars.","xfn":"","mega_menu":"0","classes":[""],"post_parent":0},{"_id":"5693e6e5a3b5704a3d3805e8","ID":2821,"post_author":"1","post_date":"2015-02-14T15:33:50.000Z","post_date_gmt":"2015-02-14T20:33:50.000Z","post_content":"Trucks, Jeeps, Buggys, and events that happen off the tarmac or asphalt all gather here in our home for down and dirty off road goodness!","post_title":"","post_excerpt":"","post_status":"publish","comment_status":"open","ping_status":"closed","post_password":"","post_name":"2821","to_ping":"","pinged":"","post_modified":"2015-09-29T17:08:36.000Z","post_modified_gmt":"2015-09-29 21:08:36","post_content_filtered":"","guid":"http://www.altdriver.com/?p=2821","menu_order":8,"post_type":"nav_menu_item","post_mime_type":"","comment_count":"0","filter":"raw","db_id":2821,"menu_item_parent":"0","object_id":"33","object":"category","type":"taxonomy","type_label":"Category","url":"http://altdriver.altmedia.com/category/off-road/","title":"Off Road","target":"","attr_title":"","description":"Trucks, Jeeps, Buggys, and events that happen off the tarmac or asphalt all gather here in our home for down and dirty off road goodness!","xfn":"","mega_menu":"0","classes":[""],"post_parent":0}]);
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
 Sponsor List
 */
router.get('/api/sponsorPosts/:sponsor', apicache('45 minutes'), function(req, res){
    PostController.sponsorPosts(req.params.sponsor).then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
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
            res.json(result);
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
 Feed Posts Query
 */
router.get('/api/trending/:query/:perPage/:page/:skip', apicache('45 minutes'), function(req,res){

    var data = PostController.trending(req, req.params.query, parseInt(req.params.perPage), parseInt(req.params.page), parseInt(req.params.skip));
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});


/*
 Category List
 */
router.get('/api/category/:category/:perPage/:page/:skip', apicache('45 minutes'), function(req, res){

    var data = PostController.listByCategory(req, parseInt(req.params.perPage),parseInt(req.params.page), parseInt(req.params.skip), req.params.category);
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
    var data = PostController.list(req, parseInt(req.params.perPage),req.params.page, req.params.skip, req.query.notIn);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});


/*
 Feed Hero Items
 */
router.get('/api/heros/:perPage/:page/:skip', apicache('45 minutes'), function(req,res){
    var data = PostController.heroItems(req, parseInt(req.params.perPage),req.params.page, req.params.skip);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});


/*
 Feed Raw Query Items
 */
router.get('/api/articles/:type', apicache('45 minutes'), function(req,res){
    if(!req.query.format && req.params.type !== 'animated-gif'){
        req.query.format = 'video';
    }
    var data = PostController.articles(req, req.params.type, Number(req.query.perPage), Number(req.query.page), Number(req.query.skip), req.query.format, req.query);
    data.then(function(result){
        if(result.length === 0){
            var response = {
                message:'request not found',
                data:{
                    status: 404
                }
            };
            res.json(response);
        }else{
            res.set('Cache-Control','max-age=600');
            res.json(result);
        }
    });
});


router.get('/update/:restParent/:restBase/:postId', function(req,res){
    console.log('got update request');
    if(req.headers.hasOwnProperty('secret')){
        var apisecret = process.env.apisecret;
        if(req.headers.secret !== 'alt_driver'){
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
            host = restParent + '.altmedia.com';
            break;
    }
    var url = 'http://' + host + '/wp-json/wp/v2/' + restBase + '/' + postId;
    //console.log(url);
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
                        console.log(result);
                        if (result.length === 0) {
                            console.log('inserting post');
                            PostController.insert(post, function (success) {
                                if (!success) res.sendStatus(500);

                                //res.sendStatus(200);
                                PostController.updating = false;
                            });

                        } else {
                            var updatePost = result[0];
                            console.log('updating post: ', JSON.stringify(result));
                            PostController.update(updatePost._id, post, function (success) {
                                if (!success) res.sendStatus(500);
                                ApiCache.clear('/api/' + updatePost.slug);
                                var env = process.env.NODE_ENV === 'production' ? (process.env.appname === 'altdriver' ? 'www.' : '') : 'staging.';
                                var appUrl = process.env.appname === 'altdriver' ? env + 'altdriver.com' : env + process.env.appname + '.com';
                                var postUrl = updatePost.link.replace(updatePost.link.substring(0,updatePost.link.indexOf('.com/')+4),'http://'+appUrl);
                                //console.log('posturl: ', postUrl);
                                setTimeout(function() {
                                    request
                                        .post('https://graph.facebook.com/?id=' + encodeURIComponent(postUrl) + '&scrape=true')
                                        .on('response', function (response) {
                                            //console.log(response);
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
            console.log('updated');
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