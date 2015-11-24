'use strict';

require('newrelic');
//require('./lib/connection'); 

var express     = require('express'),
    http        = require('http'),
    app         = express(),
    bodyParser  = require('body-parser'),
    path        = require('path'),
    request     = require('request'),
    multiparty  = require('multiparty'),
    fs          = require('fs'),
    mongoose    = require('mongoose'),
    authorized  = false,
    md5         = require('js-md5'),
    swig        = require('swig'),
    cons        = require('consolidate');

var EXPRESS_PORT = 3000,
    EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist',
    feedConfig = null;

/*
 static paths
 */

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/assets');

app.get('/', function(req,res,next){
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])){

        var metatags = {
            robots: 'index, follow',
            title: 'alt_driver - Hottest Car Content from Social & the Web',
            description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            // Facebook
            fb_title: 'alt_driver - Hottest Car Content from Social & the Web',
            fb_site_name: 'alt_driver',
            fb_url: 'http://www.altdriver.com/',
            fb_description: 'alt_driver has the most entertaining and social car content. We feature breaking news, crazy viral videos and things you need to see and share.',
            fb_type: 'website',
            fb_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png',
            // Twitter
            tw_card: '',
            tw_description: '',
            tw_title: '',
            tw_site: '@altdriver',
            tw_domain: 'alt_driver',
            tw_creator: '@altdriver',
            tw_image: 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png',
            url: 'http://admin.altdriver.com'
        };

        res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:url" content="'+ metatags.fb_url + '" ><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="'+ metatags.fb_site_name +'" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');

    }else{
        app.use(express.static(EXPRESS_ROOT));
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.use(express.static(EXPRESS_ROOT));
app.use(express.static(__dirname + './tests'));
app.use(express.static(__dirname + './favicons'));
app.use(express.static(__dirname + './favicons.ico'));
app.use(express.static('./admin'));
app.use(express.static(__dirname + './data'));
app.use(express.static(__dirname + './app/config'));
app.use(express.static(__dirname + './app/components/views/cards'));

/*
 middleware
 */
app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));

app.set('port', process.env.PORT || EXPRESS_PORT);

app.locals.config = require('./app/config/feed.conf.json');


function getPagePosts(numberOfPosts, pageNumber) {
    //return db.collection('posts').find().limit(numberOfPosts);
}

app.get('/p/:perPage/:page', function(req,res){
    var data = getPagePosts(parseInt(req.params.perPage),req.params.page);

    var posts = [];
    var i = 0;
    data.forEach(function(item, index, collection){
        posts.push(item);
        if(i === parseInt(req.params.perPage)-1){
            res.send(JSON.stringify(posts));
        }
        i++;
    });
});


app.get('/posts/:perPage/:page', function(req, res) {
    var post = require('./lib/post');
    var perPage = parseInt(req.params.perPage);
    var page = parseInt(req.params.page);
    post.getPosts(perPage, page, function(err,result){
       res.send(result);
    });
});

app.get('/tests', function(req, res){
    res.sendFile('SpecRunner.html', { root: path.join(__dirname, './tests') });
});

app.post('/auth', function(req, res){
    var input = new multiparty.Form();
    var creds = require('./app/config/creds.json');

    input.parse(req, function(err, fields, files) {
        var inputUname = md5(fields.uname.toString());
        var inputPwd = md5(fields.pwd.toString());
        var uname = creds.uname;
        var pwd = creds.pwd;

        if(inputUname === uname && inputPwd === pwd){
            authorized = true;
            var authed = {
                u:uname,
                p:pwd,
                d:Date.now()
            };
            app.set('auth', JSON.stringify(authed));
            res.redirect('/admin');
        }else{
            res.redirect('/auth');
        }
    });

});

app.get('/auth', function(req, res){
    res.sendFile('login.html', { root: path.join(__dirname, './admin') });
});

app.get('/admin', function(req, res){
    if(app.get('auth')){
        var auth = JSON.parse(app.get('auth'));
        var now = Date.now();
        var then = new Date(auth.d);
        var diff = new Date(now-then).getMinutes();
        if(diff < 59){
            res.sendFile('admin.html', { root: path.join(__dirname, './admin') });
        }
    }
    if(!authorized){
        res.redirect('/auth');
    }else{
        res.sendFile('admin.html', { root: path.join(__dirname, './admin') });
    }

});

app.post('/admin', function(req, res){

    var data = req.body;

    fs.realpath('./app/config', function(err, resolvedPath){
        fs.readdir(resolvedPath, function(err, files){
            if (files.indexOf('feed.conf.json') > -1) {
                var file = files[files.indexOf('feed.conf.json')];

                fs.unlink('./app/config/'+ file, function(){
                    fs.writeFile('./app/config/feed.conf.json', JSON.stringify(data), function(err){
                        if(err) throw err;
                        data.cards.forEach(function(element, index, data){
                            var tpl = element.card.type + '.html';
                            fs.realpath('./app/components/views/cards', function(err, resolvedPath) {
                                fs.readdir(resolvedPath, function (err, files) {
                                    if(files.indexOf(tpl) === -1){
                                        fs.writeFile('./app/components/views/cards/' + tpl, 'THIS CARD WAS AUTOMATICALLY GENERATED. PLEASE EDIT.', function(err){

                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            }
            if(err) throw err;
        });
    });
    res.writeHead(200);
    res.end();
});

app.get('/update/:postId', function(req,res){
    console.log('requested update');
    var postId = req.params.postId;

    fs.realpath('./data', function(err, resolvedPath){
        fs.readdir(resolvedPath, function(err, files){
            if(err) throw err;
            fs.writeFile(resolvedPath + '/updated.json', postId, function(err){
                if(err) throw err;
            });
        });
    });

    res.end();
});

app.put('/update', function(req,res){
    console.log('requested update');

    var input = new multiparty.Form();
    var postId = null;
    input.parse(req, function(err, fields, files) {
        postId = fields['id'];
    });


    fs.realpath('./data', function(err, resolvedPath){
        fs.readdir(resolvedPath, function(err, files){
            if(err) throw err;
            fs.writeFile(resolvedPath + '/updated.json', postId, function(err){
                if(err) throw err;
            });
        });
    });

    res.end();
});

app.get('/getPosts/:env/:postsPerPage/:page', function(req,res){

    fs.realpath('./data', function(err, resolvedPath) {
        fs.readdir(resolvedPath, function (err, files) {
            if (files.indexOf('updated.json') > -1) {
                for(var i=0; i<files.length;i++){
                    var file = files[i];
                    var count = i;
                    fs.unlink('./data/'+ file, function(){

                    });
                    if((files.length-1) === count){
                        getPosts(req.params.env, req.params.postsPerPage, req.params.page, res);
                    }
                }
            }
            else if(files.indexOf('posts_'+req.params.page+'.json') > -1){
                var index = files.indexOf('posts_'+req.params.page+'.json');
                var filepath = './data/'+files[index];

                fs.open(filepath, 'r', function(err, fd) {
                    fs.fstat(fd, function (err, stats) {
                        var d = new Date(stats.birthtime).getTime();
                        var now = Date.now();
                        var hoursAge = ((now-d)/(60 * 60 * 1000));


                        if(hoursAge > 24){
                            fs.unlink(filepath, function(){
                                getPosts(req.params.env, req.params.postsPerPage, req.params.page, res);
                            });
                        }else{
                            res.sendFile(files[index], { root: path.join(__dirname, './data') });
                        }
                    });
                });
            }else{
                getPosts(req.params.env, req.params.postsPerPage, req.params.page, res);
            }

        });
    });
});

app.post('/getPosts', function(req,res){
    var input = new multiparty.Form();

    input.parse(req, function(err, fields, files) {
        var env = fields.env[0];
        var page = fields.page[0];
        var postsPerPage = fields.postsPerPage[0];
        var posts = getPosts(env, postsPerPage, page, res);
    });

    //res.send(req.body);
    //getPosts(req);
});

function getPosts(env, postsPerPage, page, res){
    var endpoints = feedConfig[env];
    var result = null;

    request(endpoints.remoteUrl + endpoints.basePath + 'feed?per_page=' + postsPerPage + '&page=' + page, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            fs.realpath('./data', function(err, resolvedPath){
                fs.readdir(resolvedPath, function(err, files){
                    if(err) throw err;
                    fs.writeFile(resolvedPath + '/posts_'+ page +'.json', body, function(err){
                        if(err) throw err;
                    });
                });
            });
            result = body;
            res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
            res.write(result);
            res.end();
        }
    });
}

app.get('/data/:file', function(req, res){
    fs.realpath('./data', function(err, resolvedPath) {
        fs.readdir(resolvedPath, function (err, files) {
            if(files.indexOf(req.params.file) === -1){
                var pageNum = req.params.file.search(/[0-9]/);
                req.params.perPage = 100;
                req.params.pageNum = pageNum;
                getPosts(req, res);
            }else{
                res.sendFile(req.params.file, { root: path.join(__dirname, './data') });
            }
        });
    });
});

app.post('/submit', function(req,res){
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        var uri = fields['remoteHost'];
        request.post({url:'http://altdriver.wpengine.com/submit', form:fields.fields}, function(error, response, body){
            console.log('error: ', error,'body: ',body,'response: ',response);
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write(body);
            res.end();
        });
    });
});


app.get('/category/:category', function(req,res){
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])){
        var feed = {};

        feed.endpoints = {
            url: 'http://admin.altdriver.com',
            remoteUrl: 'http://www.altdriver.com',
            basePath: '/wp-json/wp/v2/'
        };

        var catName = req.params.category;
        var endpoint = 'terms/category?name=' + catName;
        var appUrl = 'http://admin.altdriver.com/category';

        request(feed.endpoints.url + feed.endpoints.basePath + endpoint, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var category = {};
                var metatags = {};
                var categories = JSON.parse(body);
                for(var i=0; i<categories.length;i++){
                    if(categories[i].slug === catName){
                        category = categories[i];
                    }
                }
                // Standard meta
                metatags.title = category.name + ' Archives - alt_driver';
                metatags.description = category.description;

                // Facebook meta
                metatags.fb_type = 'object';
                metatags.fb_site_name = 'alt_driver';
                metatags.fb_title = category.name + ' Archives - alt_driver';
                metatags.fb_description = category.description;
                metatags.url = appUrl + '/' + req.params.category;
                metatags.fb_image = 'http://admin.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png';

                res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="'+ metatags.fb_site_name +'" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');
            }
        });

    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('/:category/:slug/', function(req,res, next){
    //res.append('Access-Control-Allow-Origin','*');
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])){

        var feed = {};

        feed.endpoints = {
            url: 'http://admin.altdriver.com',
            remoteUrl: 'http://altdriver.staging.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };

        var postName = req.params.slug;
        var endpoint = 'posts?name=' + postName;
        var siteUrl = 'http://www.altdriver.com';
        var appUrl = 'http://admin.altdriver.com';

        request(feed.endpoints.url + feed.endpoints.basePath + endpoint, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var metatags = {};

                var post = JSON.parse([response.body][0]);

                post = post[0];
                metatags.published = post.date;
                metatags.modified = post.modified;
                metatags.category = post.category[0].name;
                metatags.title = post.title.rendered;
                metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];

                // Facebook meta
                metatags.fb_type = 'article';
                metatags.fb_site_name = ' alt_driver';
                metatags.fb_title = post.title.rendered;
                metatags.fb_url = siteUrl + req.url;
                metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                metatags.fb_image = post.featured_image_src.original_wp[0];
                metatags.fb_image_width = post.featured_image_src.original_wp[1];
                metatags.fb_image_height = post.featured_image_src.original_wp[2];

                res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:image:width" content="'+ metatags.fb_image_width +'" ><meta property="og:image:height" content="'+ metatags.fb_image_height +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="http://www.altdriver.com" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="article:section" content="'+ metatags.category +'" /><meta property="article:published_time" content="2015-11-06T13:30:40+00:00" /><meta property="article:modified_time" content="'+ metatags.modified +'" /><meta property="og:updated_time" content="'+ metatags.modified +'" /><meta property="og:url" content="' + metatags.fb_url + '"><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');
            }
        });
    }else {

        //res.render('index', {title:'test'});
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('/:category/:slug', function(req,res, next){
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])){

        var feed = {};

        feed.endpoints = {
            url: 'http://admin.altdriver.com',
            remoteUrl: 'http://altdriver.staging.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };

        var postName = req.params.slug;
        var endpoint = 'posts?name=' + postName;
        var siteUrl = 'http://www.altdriver.com';
        var appUrl = 'http://admin.altdriver.com';

        request(feed.endpoints.url + feed.endpoints.basePath + endpoint, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var metatags = {};

                var post = JSON.parse([response.body][0]);
                /*for(var prop in post){
                 console.log(prop,post[prop]);
                 }*/
                // Standard meta

                post = post[0];
                metatags.published = post.date;
                metatags.modified = post.modified;
                metatags.category = post.category[0].name;
                metatags.title = post.title.rendered;
                metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];

                // Facebook meta
                metatags.fb_type = 'article';
                metatags.fb_site_name = ' alt_driver';
                metatags.fb_title = post.title.rendered;
                metatags.fb_url = siteUrl + req.url;
                metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                metatags.fb_image = post.featured_image_src.original_wp[0];
                metatags.fb_image_width = post.featured_image_src.original_wp[1];
                metatags.fb_image_height = post.featured_image_src.original_wp[2];

                res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:image:width" content="'+ metatags.fb_image_width +'" ><meta property="og:image:height" content="'+ metatags.fb_image_height +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="http://www.altdriver.com" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="article:section" content="'+ metatags.category +'" /><meta property="article:published_time" content="2015-11-06T13:30:40+00:00" /><meta property="article:modified_time" content="'+ metatags.modified +'" /><meta property="og:updated_time" content="'+ metatags.modified +'" /><meta property="og:url" content="' + metatags.fb_url + '"><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');
            }
        });
    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('*', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

/*
 create server
 */
http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});
