'use strict';

var newrelic = require('newrelic');
var conn = require('./lib/connection');

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

var db = conn.db;
var Post = conn.Post;

app.get('/api/list', function(req, res){
    var query = Post.find({'format':'video'}).limit(10);
    query.exec(function(err, posts){
        if(err) return 'error';
        res.end(JSON.stringify(posts));
    });
});


app.get('/feed/:feedname/', function(req,res){
    var feedName = req.params.feedname;
    request('http://admin.altdriver.com/'+feedName, function (error, response, body) {
        var result = body.replace(/admin./g,'www.');

        res.set('Content-Type', 'text/xml; charset=UTF-8');
        res.send(result);
    });
});

app.use(express.static(__dirname + './tests'));
app.use(express.static(__dirname + './favicons'));
app.use(express.static(__dirname + './favicons.ico'));
app.use(express.static('./admin'));
app.use(express.static(__dirname + './data'));
app.use(express.static(__dirname + './app/config'));
app.use(express.static(__dirname + './app/components/views/cards'));

var config = require('./app/config/config.json');
var appName = process.env.appname;
if(!appName) appName = 'altdriver';
var appConfig = config[appName].app;
var env = 'prod';

feedConfig = appConfig.env[env];

app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/dist');

function htmlEntities(str) {
    str = str.replace('&lt;','<');
    str = str.replace('&gt;','>');
    return str;
}

app.get('/', function(req,res,next){

    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])) {

        try {
            var endpoint = feedConfig.remoteUrl + feedConfig.basePath + appConfig.feedPath + '?page=1&per_page=' + appConfig.per_page;
            request(endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {
                        robots: 'index, follow',
                        title: appConfig.title,
                        description: appConfig.description,
                        // Facebook
                        fb_title: appConfig.title,
                        fb_site_name: appConfig.fb_sitename,
                        fb_url: appConfig.url,
                        fb_description: appConfig.description,
                        fb_type: 'website',
                        fb_image: appConfig.avatar,
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

                    var posts = JSON.parse([response.body][0]);

                    if(typeof posts !== 'undefined') {

                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:posts});

                        res.send(output);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }

    }else{
        //res.sendFile('index.html', {root: path.join(__dirname, './dist')});
        var metatags = {
            robots: 'index, follow',
            title: appConfig.title,
            description: appConfig.description,
            // Facebook
            fb_title: appConfig.title,
            fb_site_name: appConfig.fb_sitename,
            fb_url: appConfig.url,
            fb_description: appConfig.description,
            fb_type: 'website',
            fb_image: appConfig.avatar,
            fb_appid: appConfig.fb_appid,
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

        res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
    }
});

app.use(express.static(EXPRESS_ROOT));


/*
 middleware
 */
app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));

app.set('port', process.env.PORT || EXPRESS_PORT);

app.locals.config = require('./app/config/feed.conf.json');


function getPagePosts(numberOfPosts, pageNumber, skip) {
    //var skipItems = pageNumber > 1 ? numberOfPosts * pageNumber : 0;
    var skipItems = Number(skip);
    console.log('getting ' + numberOfPosts + ' items - on page ' + pageNumber + ' - skipping ' + skipItems);
    var query = Post.find().limit(numberOfPosts).skip(skipItems).sort({date:'desc'});
    query.$where(function(){
        return this.postmeta.hasOwnProperty("run_dates_0_channel");
    });
    return query;
}

function getCategoryPagePosts(numberOfPosts, pageNumber, skip, category) {
    //var skipItems = pageNumber > 1 ? numberOfPosts * pageNumber : 0;
    var skipItems = Number(skip);
    var query = Post.find().limit(numberOfPosts).skip(skipItems).sort({date:'desc'});
    query.$where('this.category[0].slug === "' + category + '"');
    return query;
}

function getMongoPost(slug){
    var query = Post.findOne({'slug': slug});

    query.select('id date campaign_active sponsor parent guid modified modified_gmt slug type link title content excerpt author featured_image comment_status ping_status sticky format votes comment_count postmeta category featured_image_src author_meta');

    return query;
}

function searchPosts(term){
    console.log(term);
    var s = decodeURIComponent(term);
    console.log(s);

    var query = Post.find({'content.rendered' : {$regex: (s), $options:'i' },'title.rendered' : {$regex: (s), $options:'i' } } ).limit(10);
    return query;
}



app.get('/p/:slug', function(req,res){
    var post = getMongoPost(req.params.slug);
    post.exec(function(err,post){
        if(err) return 'error';
        res.send(JSON.stringify([post]));
    });
});

app.get('/p/search/:slug', function(req,res){
    var data = searchPosts(encodeURIComponent(req.params.slug));
    data.exec(function(err, results){
        if(err) return 'error';
        res.send(JSON.stringify(results));
    });
});

app.get('/p/category/:category/:perPage/:page/:skip', function(req, res){
    var data = getCategoryPagePosts(parseInt(req.params.perPage),req.params.page, req.params.skip, req.params.category);
    data.exec(function(err,post){
        if(err) return 'error';
        res.send(JSON.stringify(post));
    });
});

app.get('/p/:perPage/:page/:skip', function(req,res){
    var data = getPagePosts(parseInt(req.params.perPage),req.params.page, req.params.skip);
    data.exec(function(err,post){
        if(err) return 'error';
        res.send(JSON.stringify(post));
    });
    var posts = [];
    var i = 0;

    /*data.forEach(function(item, index, collection){
        posts.push(item);
        if(i === parseInt(req.params.perPage)-1){
            console.log(item);
            res.send(JSON.stringify(posts));
        }
        i++;
    });*/
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
    page = 3;
    postsPerPage = 20;

    request(endpoints.remoteUrl + endpoints.basePath + 'feed?per_page=' + postsPerPage + '&page=' + page +'&offset=1000', function (error, response, body) {
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
        fields['_wp_http_referer'] = '/submit/';

        var options = {
            host: 'admin.altdriver.com',
            port: 80,
            path: '/submit/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(fields),
                'Host': 'admin.altdriver.com',
                'Origin':null
            }
        };

        /*var creq = http.request(options, function(cres){
            cres.setEncoding('utf8');

            // wait for data
            cres.on('data', function(chunk){
                res.write(chunk);
            });

            cres.on('close', function(){
                // closed, let's end client request as well
                res.writeHead(cres.statusCode);
                res.end();
            });

            cres.on('end', function(){
                // finished, let's finish client request as well
                res.writeHead(cres.statusCode);
                res.end();
            });
            creq.end();
        });*/
        request.post({url:'http://admin.altdriver.com/submit/', form:fields.fields, headers:{'Host':'admin.altdriver.com','Origin':'http://admin.altdriver.com','Referer':'http://admin.altdriver.com/submit/'}}, function(error, response, body){

            var template = swig.compileFile('./dist/res.html');
            var output = template({res: body});

            res.send(output);
        });
    });
});

app.get('/category/:category/', function(req,res){

    var feed = {};

    feed.endpoints = {
        url: 'http://admin.altdriver.com',
        remoteUrl: 'http://www.altdriver.com',
        basePath: '/wp-json/wp/v2/'
    };

    var catName = req.params.category;
    var endpoint = 'terms/category?name=' + catName;
    var appUrl = 'http://admin.altdriver.com/category';

    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])) {
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var category = {};
                    var metatags = {};
                    var categories = JSON.parse(body);
                    if(typeof categories !== 'undefined') {
                        for (var i = 0; i < categories.length; i++) {
                            if (categories[i].slug === catName) {
                                category = categories[i];
                            }
                        }
                        // Standard meta
                        metatags.title = category.name + ' Archives';
                        metatags.description = category.description;

                        // Facebook meta
                        metatags.fb_type = 'object';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = category.name + ' Archives';
                        metatags.fb_description = category.description;
                        metatags.url = appUrl + '/' + req.params.category;
                        metatags.fb_image = appConfig.avatar;

                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:post});

                        res.send(output);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }else{
        //res.sendFile('index.html', { root: path.join(__dirname, './dist') });
        var catName = req.params.category;
        var endpoint = 'terms/category?name=' + catName;
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var category = {};
                    var metatags = {};
                    var categories = JSON.parse(body);
                    if(typeof categories !== 'undefined') {
                        for (var i = 0; i < categories.length; i++) {
                            if (categories[i].slug === catName) {
                                category = categories[i];
                            }
                        }
                        // Standard meta
                        metatags.title = category.name + ' Archives';
                        metatags.description = category.description;

                        // Facebook meta
                        metatags.fb_type = 'object';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = category.name + ' Archives';
                        metatags.fb_description = category.description;
                        metatags.url = appUrl + '/' + req.params.category;
                        metatags.fb_image = appConfig.avatar;


                        res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
});


app.get('/category/:category', function(req,res){

    var feed = {};

    feed.endpoints = {
        url: 'http://admin.altdriver.com',
        remoteUrl: 'http://www.altdriver.com',
        basePath: '/wp-json/wp/v2/'
    };

    var catName = req.params.category;
    var endpoint = 'terms/category?name=' + catName;
    var appUrl = 'http://admin.altdriver.com/category';
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])) {
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var category = {};
                    var metatags = {};
                    var categories = JSON.parse(body);
                    if(typeof categories !== 'undefined') {
                        for (var i = 0; i < categories.length; i++) {
                            if (categories[i].slug === catName) {
                                category = categories[i];
                            }
                        }
                        // Standard meta
                        metatags.title = category.name + ' Archives';
                        metatags.description = category.description;

                        // Facebook meta
                        metatags.fb_type = 'object';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = category.name + ' Archives';
                        metatags.fb_description = category.description;
                        metatags.url = appUrl + '/' + req.params.category;
                        metatags.fb_image = appConfig.avatar;

                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:post});

                        res.send(output);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }else{
        res.sendFile('index.html', { root: path.join(__dirname, './dist') });
        /*var catName = req.params.category;
        var endpoint = 'terms/category?name=' + catName;
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var category = {};
                    var metatags = {};
                    var categories = JSON.parse(body);
                    if(typeof categories !== 'undefined') {
                        for (var i = 0; i < categories.length; i++) {
                            if (categories[i].slug === catName) {
                                category = categories[i];
                            }
                        }
                        // Standard meta
                        metatags.title = category.name + ' Archives';
                        metatags.description = category.description;

                        // Facebook meta
                        metatags.fb_type = 'object';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = category.name + ' Archives';
                        metatags.fb_description = category.description;
                        metatags.url = appUrl + '/' + req.params.category;
                        metatags.fb_image = appConfig.avatar;


                        res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }*/
    }

});

app.get('/search/:query/', function(req,res, next){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/:category/:slug/', function(req,res, next){
    var feed = {};

    feed.endpoints = {
        url: 'http://admin.altdriver.com',
        remoteUrl: 'http://altdriver.staging.wpengine.com',
        basePath: '/wp-json/wp/v2/'
    };

    var fbAppId = appConfig.fb_appid;
    var fbUrl = appConfig.fb_url;
    var postName = req.params.slug;
    var endpoint = 'posts?name=' + postName;
    var siteUrl = 'http://'+ appConfig.url;
    var appUrl = 'http://admin.altdriver.com';
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])) {
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {};

                    var post = JSON.parse([response.body][0]);

                    post = post[0];
                    if(typeof post !== 'undefined') {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;

                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:post});

                        res.send(output);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }else{
        //res.sendFile('index.html', { root: path.join(__dirname, './dist') });
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {};

                    var post = JSON.parse([response.body][0]);

                    post = post[0];
                    if(typeof post !== 'undefined') {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;
                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
});

app.get('/:category/:slug', function(req,res, next){
    var feed = {};

    feed.endpoints = {
        url: 'http://admin.altdriver.com',
        remoteUrl: 'http://altdriver.staging.wpengine.com',
        basePath: '/wp-json/wp/v2/'
    };

    var fbAppId = appConfig.fb_appid;
    var fbUrl = appConfig.fb_url;
    var postName = req.params.slug;
    var endpoint = 'posts?name=' + postName;
    var siteUrl = 'http://'+ appConfig.url;
    var appUrl = 'http://admin.altdriver.com';
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent'])) {
        try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {};

                    var post = JSON.parse([response.body][0]);

                    post = post[0];
                    if(typeof post !== 'undefined') {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;
                        post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        post.postmeta['_yoast_wpseo_opengraph-description'][0];

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:post});

                        res.send(output);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }else{
        res.sendFile('index.html', { root: path.join(__dirname, './dist') });
        /*try {
            request(feedConfig.remoteUrl + feedConfig.basePath + endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {};

                    var post = JSON.parse([response.body][0]);

                    post = post[0];
                    if(typeof post !== 'undefined') {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;
                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }*/
    }
});

app.get('*', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
    //res.render('index',{newrelic:newrelic});
});

/*
 create server
 */
http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});
