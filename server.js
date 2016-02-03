'use strict';

var newrelic = require('newrelic');

var express         = require('express'),
    http            = require('http'),
    app             = express(),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    path            = require('path'),
    request         = require('request'),
    multiparty      = require('multiparty'),
    fs              = require('fs'),
    authorized      = false,
    md5             = require('js-md5'),
    swig            = require('swig'),
    cons            = require('consolidate'),
    cc              = require('coupon-code'),
    compression     = require('compression');

var EXPRESS_ROOT = './dist',
    feedConfig = null,
    itsABot = null,
    createUser = false;

app.use(compression());

/*
 middleware
 */

app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('port', process.env.PORT || 3000);

//app.locals.config = require('./app/config/feed.conf.json');

/*
 Server Routes
 */
var api = require('./server/index');
var apiRouter = api.routes;
app.use(apiRouter);

/*
app.get('*', function(req,res,next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    next();
});
*/

app.get('/api/articles/:perPage/:page/:skip', function(req,res){
    var itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    if(itsABot){
        res.redirect('/');
    }else{
        var data = api.PostController.posts(parseInt(req.params.perPage),req.params.page, req.params.skip);
        data.then(function(result){
            if(result.length === 0){
                res.sendStatus(404);
            }else{
                res.send(JSON.stringify(result));
            }
        });
    }
});

app.get('/sponsor/:name', function(req,res){
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

    /*var template = swig.compileFile('./dist/index.html');
    var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});
    res.send(output);*/

    res.render('index',{newrelic:newrelic, metatags:metatags, appConfig:appConfig});
});

app.get('/server', function(req,res){
    //res.send(JSON.stringify(process.env));
});

app.get('/feed/:feedname/', function(req,res){
    var feedName = req.params.feedname;
    request('http://admin.altdriver.com/'+feedName, function (error, response, body) {
        var result = body.replace(/admin./g,'www.');

        res.set('Content-Type', 'text/xml; charset=UTF-8');
        res.send(result);
    });
});

/*
 static paths
 */
//app.use(express.static(__dirname + './tests'));
app.use(express.static(__dirname + './favicons', {maxAge:600000, cache:true}));
app.use(express.static(__dirname + './favicons.ico', {maxAge:600000, cache:true} ));
//app.use(express.static('./admin'));
//app.use(express.static(__dirname + './data'));
//app.use(express.static(__dirname + './app/config'));
app.use(express.static(__dirname + './app/components/views/cards', {maxAge:600000, cache:true}));

var config = require('./app/config/config.json');
var appName = process.env.appname;
if(!appName) appName = 'altdriver';
var appConfig = config[appName].app;
var env = 'prod';

if(!process.env.envhost){
    process.env.envhost = 'www.altdriver.com';
}

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
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    /*if(!itsABot && req.headers['user-agent'].toLocaleLowerCase().indexOf('healthcheck') === -1 && createUser){
        var user = null;
        var uuid = cc.generate({parts:4,partLen:6});
        var userUUID = null;

        if(req.headers.cookie === undefined){
            api.UserController.create(uuid, {'headers':req.headers, 'rawHeaders':req.rawHeaders});
            res.cookie('altduuid', uuid, { expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'), httpOnly: true });
        }else{
            if(req.headers.cookie.indexOf('altduuid') > -1){

                var cookies = req.headers.cookie.split('; ');
                for(var i=0;i<cookies.length;i++){
                    var chip = cookies[i].split('=');
                    if(chip[0].indexOf('altduuid') > -1){
                        userUUID = chip[1];

                        api.UserController.me(userUUID).then( function(result){
                            if(result.length === 0 && userUUID.length > 0){
                                api.UserController.create(userUUID,{'headers':req.headers, 'rawHeaders':req.rawHeaders});
                            }
                            *//*var user = result[0];
                             user.lastseen = Date.now;
                             api.UserController.update(user);*//*
                        });
                    }
                }
            }else{
                api.UserController.create(uuid, {'headers':req.headers, 'rawHeaders':req.rawHeaders});
                res.cookie('altduuid', uuid, { expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'), httpOnly: true });
            }
        }
    }*/

    if(typeof req.headers['user-agent'] !== 'undefined') {
        if (!itsABot && req.headers['user-agent'].toLowerCase().indexOf('healthcheck') === -1) {
            var user = null;
            var uuid = cc.generate({parts: 4, partLen: 6});
            var userUUID = null;

            try {
                if(typeof req.headers.cookie !== 'undefined') {
                    if (req.headers.cookie.indexOf('altduuid') === -1) {
                        res.cookie('altduuid', uuid, {
                            expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
                            httpOnly: true
                        });
                    } else {

                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    if(itsABot) {

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
                        fb_appid:appConfig.fb_appid,
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

        /*var template = swig.compileFile('./dist/index.html');
        var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});
        res.send(output);*/

        res.render('index', {newrelic:newrelic, metatags: metatags, appConfig:appConfig, cache:true, maxAge:600000});
    }
});


app.use(express.static(EXPRESS_ROOT, {maxAge:600000, cache:true}));


/*app.get('/tests', function(req, res){
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
});*/

app.post('/submit', function(req,res){

    if(req.headers.origin !== 'http://' + req.headers.host){
        res.status(403).end();
        return false;
    }
    var form = new multiparty.Form();

    var aws = require('aws-sdk');
    aws.config.update({region:'us-west-2'});
    var ses = new aws.SES({apiVersion: '2010-12-01'});

    // send to list
    //var to = ['dev@altdriver.com'];
    if(!process.env.SES_USER_CONTENT_EMAIL){
        process.env.SES_USER_CONTENT_EMAIL = 'dev@altdriver.com';
    }
    var to = [process.env.SES_USER_CONTENT_EMAIL];

    // this must relate to a verified SES account
    //var from = 'dev@altdriver.com';
    var from = process.env.SES_USER_CONTENT_EMAIL;

    var bucket = 'user-content.altdriver';
    var fileName = '';
    var s3Client = new aws.S3({params: {Bucket: bucket, Key: 'AKIAINNUHXXUND27LA4A'}});

    form.on('field', function(name, value){
        //console.log(name, value);
    });
    form.on('part', function(part) {
        //console.log(part);
    });

    var ua = req.headers['user-agent'];
    var cookie = req.headers.cookie;

    var status = 200;

    form.parse(req, function(err, fields, files) {


        if(typeof fields === 'undefined' || (fields.name[0].length === 0 && fields.email[0].length === 0) || typeof files === 'undefined'){
            status = 403;
            return false;
        }

        if(fields.linkUrl === undefined || fields.name === undefined || fields.email === undefined){
            status = 403;
            return false;
        }


        var message = '';
        if(files.hasOwnProperty('fileUpload') && files.fileUpload[0].size > 0){
            fileName = fields.name + '-' + files.fileUpload[0].originalFilename;

            var file = fs.createReadStream(files.fileUpload[0].path);

            return s3Client.putObject({
                Bucket: bucket,
                Key: fileName,
                ACL: 'public-read',
                Body: file,
                ContentLength: file.byteCount
            }, function(err, data) {
                if (err) throw err;
                message += '\n\nFile URL:\n' + 'http://user-content.altdriver.s3.amazonaws.com/' + encodeURIComponent(fileName) + '\n\nFile:\n' + fileName + '\n\nFile ETag:\n' + data.ETag;
                message += '\n\nMessage:\n' + fields.messageContent + '\n\nEmail:\n' + fields.email + '\n\nLink:\n' + fields.linkUrl + '\n\nName:\n' + fields.name;

                message += '\n\nApp URL:\n' + 'http://' + req.headers.host + '\n\nSession Info:\n' + '\nUser Agent:\n' + ua + '\n\nSession Cookie:\n' + cookie;
                return ses.sendEmail( {
                        Source: from,
                        Destination: { ToAddresses: to },
                        Message: {
                            Subject:{
                                Data: 'User Submitted Content'
                            },
                            Body: {
                                Text: {
                                    Data: message
                                }
                            }
                        }
                    },
                    function(err, data) {
                        if(err) throw err;
                    });
            });
        }else{

            message += '\n\nMessage:\n' + fields.messageContent + '\n\nEmail:\n' + fields.email + '\n\nLink:\n' + fields.linkUrl + '\n\nName:\n' + fields.name;
            message += '\n\nApp URL:\n' + 'http://' + req.headers.host + '\n\nSession Info:\n' + '\nUser Agent:\n' + ua + '\n\nSession Cookie:\n' + cookie;
            return ses.sendEmail( {
                    Source: from,
                    Destination: { ToAddresses: to },
                    Message: {
                        Subject:{
                            Data: 'User Submitted Content'
                        },
                        Body: {
                            Text: {
                                Data: message
                            }
                        }
                    }
                },
                function(err, data) {
                    if(err) throw err;
                });
        }
    });
    if(status === 403){
        console.log(403);
        res.status(403).end();
    }else{
        res.redirect('/thanks');
    }

});
 
app.get('/search/(:query/|:query)', function(req,res, next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    if(typeof req.headers['user-agent'] !== 'undefined') {
        if (!itsABot && req.headers['user-agent'].toLowerCase().indexOf('healthcheck') === -1) {
            var user = null;
            var uuid = cc.generate({parts: 4, partLen: 6});
            var userUUID = null;

            try {
                if(typeof req.headers.cookie !== 'undefined') {
                    if (req.headers.cookie.indexOf('altduuid') === -1) {
                        res.cookie('altduuid', uuid, {
                            expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
                            httpOnly: true
                        });
                    } else {

                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    if(itsABot){
        res.send();
    }else{
        //res.sendFile('index.html', { root: path.join(__dirname, './dist') });
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
        /*var template = swig.compileFile('./dist/index.html');
        var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});

        res.send(output);*/
        res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000});
    }
});

app.get('/category/(:category/|:category)', function(req,res){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    if(typeof req.headers['user-agent'] !== 'undefined') {
        if (!itsABot && req.headers['user-agent'].toLowerCase().indexOf('healthcheck') === -1) {
            var user = null;
            var uuid = cc.generate({parts: 4, partLen: 6});
            var userUUID = null;

            try {
                if(typeof req.headers.cookie !== 'undefined') {
                    if (req.headers.cookie.indexOf('altduuid') === -1) {
                        res.cookie('altduuid', uuid, {
                            expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
                            httpOnly: true
                        });
                    } else {

                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    var catName = req.params.category;
    var endpoint = 'http://' + req.headers.host + '/api/category/' + catName + '/7/1/0';
    var appUrl = 'http://admin.altdriver.com/category';

    if(itsABot) {
        try {
            request(endpoint, function (error, response, body) {
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
                        var output = template({metatags: metatags, app: appName, posts:category});

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
            request(endpoint, function (error, response, body) {
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


                        /*var template = swig.compileFile('./dist/index.html');
                        var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});

                        res.send(output);*/
                        res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000});
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
});

app.get('/:category/(:slug|:slug/)', function(req,res, next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    if(typeof req.headers['user-agent'] !== 'undefined') {
        if (!itsABot && req.headers['user-agent'].toLowerCase().indexOf('healthcheck') === -1) {
            var user = null;
            var uuid = cc.generate({parts: 4, partLen: 6});
            var userUUID = null;

            try {
                if(typeof req.headers.cookie !== 'undefined') {
                    if (req.headers.cookie.indexOf('altduuid') === -1) {
                        res.cookie('altduuid', uuid, {
                            expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
                            httpOnly: true
                        });
                    } else {

                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    /*if(!itsABot && req.headers['user-agent'].toLocaleLowerCase().indexOf('healthcheck') === -1 && createUser){

        //me 7D6QL2-EDCA4A-XQMY5F-TGRXKC
        var user = null;
        var uuid = cc.generate({parts:4,partLen:6});
        var userUUID = null;

        if(req.headers.cookie === undefined){
            api.UserController.create(uuid, {'headers':req.headers, 'rawHeaders':req.rawHeaders});
            res.cookie('altduuid', uuid, { expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'), httpOnly: true });
        }else{
            if(req.headers.cookie.indexOf('altduuid') > -1){

                var cookies = req.headers.cookie.split('; ');
                for(var i=0;i<cookies.length;i++){
                    var chip = cookies[i].split('=');
                    if(chip[0].indexOf('altduuid') > -1){
                        userUUID = chip[1];

                        api.UserController.me(userUUID).then( function(result){
                            if(result.length === 0 && userUUID.length > 0){
                                api.UserController.create(userUUID,{'headers':req.headers, 'rawHeaders':req.rawHeaders});
                            }
                            *//*var user = result[0];
                             user.lastseen = Date.now;
                             api.UserController.update(user);*//*
                        });
                    }
                }
            }else{
                api.UserController.create(uuid, {'headers':req.headers, 'rawHeaders':req.rawHeaders});
                res.cookie('altduuid', uuid, { expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'), httpOnly: true });
            }
        }
    }*/

    var rawUrl = req.url.substr(0,req.url.length-1);

    rawUrl = rawUrl.split('/');
    var originalUrl = rawUrl[rawUrl.length-1];

    var fbAppId = appConfig.fb_appid;
    var fbUrl = appConfig.fb_url;
    var postName = null;
    try{
        postName = req.params.slug;
    }catch(e){

    }

    if(postName === undefined || postName === null){
        console.log('no params present... trying raw url');
        postName = originalUrl;
    }

    var endpoint = 'http://' + req.headers.host + '/api/' + postName;
    var siteUrl = 'http://'+ appConfig.url;
    var appUrl = 'http://admin.altdriver.com';
    if(itsABot) {
        try {
            request(endpoint, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var metatags = {};

                    var post = null;

                    try{
                        post = JSON.parse(body);
                    }catch(e){
                        console.error(JSON.stringify(e));
                    }

                    if(typeof post !== 'undefined' && post !== null) {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;

                        metatags.title = '';
                        metatags.description = '';

                        try{
                            if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-title') && post.postmeta['_yoast_wpseo_opengraph-title'].length > 0){
                                metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                            }

                            if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-description') && post.postmeta['_yoast_wpseo_opengraph-description'].length > 0){
                                metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                            }
                        }catch(e){
                            console.error(JSON.stringify(e));
                        }

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = metatags.title;
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = metatags.description;
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        var template = swig.compileFile('./dist/bots.html');
                        var output = template({metatags: metatags, app: appName, posts:post});

                        res.send(output);
                    }else{
                        console.log('post could not be retrieved...  ' + originalUrl + '\n\n');
                        console.log('headers:\n ', req.headers);
                        console.log('\n\nparams:\n', req.params);
                        console.log('\n\nrawHeaders:\n ',req.rawHeaders);
                        console.log('\n\n_parsedOriginalUrl:\n ', req._parsedOriginalUrl);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    }else{
        //res.sendFile('index.html', { root: path.join(__dirname, './dist') });
        try {
            api.PostController.post(postName).then(function(result){

                var metatags = {};
                var post = null;
                if(result.length === 0){
                    console.log('post could not be retrieved...  ' + originalUrl + '\n\n');
                    console.log('headers:\n ', req.headers);
                    console.log('\n\nparams:\n', req.params);
                    console.log('\n\nrawHeaders:\n ',req.rawHeaders);
                    console.log('\n\n_parsedOriginalUrl:\n ', req._parsedOriginalUrl);

                    console.log(req._parsedOriginalUrl);
                    res.sendStatus(404);
                }else{
                    post = result;


                    metatags.published = post.date;
                    metatags.modified = post.modified;
                    metatags.category = post.category[0].name;
                    metatags.title = '';
                    metatags.description = '';

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-description')){
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                    }

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-title')) {
                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                    }

                    // Facebook meta

                    metatags.fb_appid = fbAppId;
                    metatags.fb_publisher = fbUrl;
                    metatags.fb_type = 'article';
                    metatags.fb_site_name = appConfig.fb_sitename;
                    metatags.fb_title = metatags.title;
                    metatags.fb_url = siteUrl + req.url;
                    metatags.fb_description = metatags.description;
                    metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                    metatags.fb_image = post.featured_image_src.original_wp[0];
                    metatags.fb_image_width = post.featured_image_src.original_wp[1];
                    metatags.fb_image_height = post.featured_image_src.original_wp[2];


                    /*var template = swig.compileFile('./dist/index.html');
                     var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});

                     res.send(output);*/

                    res.status(200).render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000});
                }

            });
            /*request(endpoint, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    var metatags = {};
                    var post = null;

                    try{
                        post = JSON.parse(body);
                    }catch(e){
                        console.error(JSON.stringify(e));
                    }

                    if(typeof post !== 'undefined' && post !== null) {
                        metatags.published = post.date;
                        metatags.modified = post.modified;
                        metatags.category = post.category[0].name;
                        metatags.title = '';
                        metatags.description = '';

                        if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-description')){
                            metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                        }

                        if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-title')) {
                            metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                        }

                        // Facebook meta

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = metatags.title;
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = metatags.description;
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];


                        *//*var template = swig.compileFile('./dist/index.html');
                        var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});

                        res.send(output);*//*
                        res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags});
                    }else{
                        console.log('post could not be retrieved...  ' + originalUrl + '\n\n');
                        console.log('headers:\n ', req.headers);
                        console.log('\n\nparams:\n', req.params);
                        console.log('\n\nrawHeaders:\n ',req.rawHeaders);
                        console.log('\n\n_parsedOriginalUrl:\n ', req._parsedOriginalUrl);

                    }
                }
            });*/
        } catch (e) {
            console.error(e);
            console.log('post could not be retrieved...  ' + originalUrl + '\n\n');
            console.log('headers:\n ', req.headers);
            console.log('\n\nparams:\n', req.params);
            console.log('\n\nrawHeaders:\n ',req.rawHeaders);
            console.log('\n\n_parsedOriginalUrl:\n ', req._parsedOriginalUrl);
            res.end();
        }
    }
});

app.get('/:page', function(req,res){
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

    /*var template = swig.compileFile('./dist/index.html');
    var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});

    res.send(output);*/
    res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000});
});

app.get('*', function(req,res){
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

    /*var template = swig.compileFile('./dist/index.html');
    var output = template({newrelic:newrelic, metatags: metatags, appConfig:appConfig});
    res.send(output);*/

    res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000});
});


/*
 create server
 */
http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});
