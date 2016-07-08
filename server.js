'use strict';

var newrelic = null;

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
    compression     = require('compression'),
    ApiCache        = require('apicache'),
    apicache        = ApiCache.options({ debug: true }).middleware,
    CronJob         = require('cron').CronJob;

var EXPRESS_ROOT = './dist',
    feedConfig = null,
    itsABot = null,
    createUser = false;

app.use(compression());

/*
 middleware
 */


app.use(express.static(__dirname + './dist/tests/'));
app.get('/tests', function(req, res, next){
    res.sendFile('SpecRunner.html', { root: path.join(__dirname, './dist/tests/jasmine/') });

});

app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('port', process.env.PORT || 3000);

//app.locals.config = require('./public/config/feed.conf.json');

/*
 Server Routes
 */

if(process.env.NODE_ENV === 'production' && process.env.appName === 'altdriver'){
    newrelic = require('newrelic');
}else{
    newrelic = {};
    newrelic.getBrowserTimingHeader = function(){
        return '';
    };
}


app.get('/abc/123/', function(req,res, next){
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
        canonical_url: '',
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

function execQueue(queueData, message){
    //console.debug('initQueue');
    var deferred = new Promise(function(fulfill, reject){

        var result = null;

        var postId = queueData.postID;
        var restBase = queueData.restBase;
        var restParent = queueData.restParent;
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
        url = url.replace(/\s/,'');

        switch(queueData.method){
            case 'update':
            case 'create':
            case 'publish':
                request(url, function (error, response, body) {
                    //console.debug('response: ', response);
                    if(response.statusCode === 200) {
                        var post = JSON.parse(body);

                        api.PostController.exists(post.id).then(function (result) {
                            if (result.length === 0) {

                                api.PostController.insert(post, function (success) {
                                    //if (!success) res.sendStatus(500);
                                    //res.sendStatus(200);
                                    api.PostController.updating = false;
                                    fulfill(message.ReceiptHandle);
                                });

                            } else {
                                var updatePost = result[0];

                                api.PostController.update(updatePost._id, post, function (success) {
                                    //if (!success) res.sendStatus(500);
                                    ApiCache.clear('/api/' + updatePost.slug);
                                    var env = process.env.NODE_ENV === 'production' ? (process.env.appname === 'altdriver' ? 'www.' : '') : 'staging.';
                                    var appUrl = process.env.appname === 'altdriver' ? env + 'altdriver.com' : env + process.env.appname + '.com';
                                    var postUrl = updatePost.link.replace(updatePost.link.substring(0,updatePost.link.indexOf('.com/')+4),'http://'+appUrl);
                                    //console.debug('posturl: ', postUrl);
                                    setTimeout(function() {
                                        request
                                            .post('https://graph.facebook.com/?id=' + encodeURIComponent(postUrl) + '&scrape=true')
                                            .on('response', function (response) {
                                                //console.debug(response);
                                            });
                                    },1000);

                                    //res.sendStatus(200);
                                    fulfill(message.ReceiptHandle);
                                    api.PostController.updating = false;
                                });
                            }
                        });
                    }else{
                        //res.sendStatus(response.statusCode);
                        reject(result);
                        api.PostController.updating = false;
                    }
                });
                break;
            case 'delete':
                api.PostController.destroy(postId);
                fulfill(message.ReceiptHandle);
                break;
        }

    });

    return deferred;
}


function snsSubscribe(){
    var AWS = require('aws-sdk');
    AWS.config.update({region:'us-east-1'});
    var sns = new AWS.SNS({apiVersion: '2010-03-31'});

    var params = {
        Protocol: 'sqs',
        TopicArn: 'arn:aws:sns:us-east-1:629760438439:wp-update-queue',
        Endpoint: 'arn:aws:sqs:us-east-1:629760438439:wp-exec'
    };
    sns.subscribe(params, function(err, data) {
        if (err) console.error(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}

var cronEnabled = false;

if(process.env.NODE_ENV !== 'local'){

    //start polling SQS for wordpress updates
    setInterval(function(){
        initQueue('wp-exec', false);
    }, 60000);

    //create daily cron task
    var job = new CronJob({
        cronTime: '10 05 09 * * 1-7',
        onTick: function () {
            //console.debug('starting cron job');
            /*
             * Runs every weekday (Monday through Sunday)
             * at 3:30:00 AM.
             */
            initQueue('wp-daily-sync', true);
        },
        start: true, /* Start the job right now */
        timeZone: 'America/New_York' /* Time zone of this job. */
    });

    //start job
    if(cronEnabled) job.start();
}

function getSQSQueue(params){

    var AWS = require('aws-sdk');
    AWS.config.update({region:'us-east-1'});
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    var queue = null;

    var deferred = new Promise(function(fulfill, reject){
        sqs.listQueues(params, function(err, data) {
            if (err) reject(err);
            queue = data.QueueUrls[0];
            var params = {
                QueueUrl: queue,
                AttributeNames: [
                    'All'
                ],
                MaxNumberOfMessages: 10
            };

            sqs.receiveMessage(params, function(err, data) {
                if (err) reject(err);
                var qData = { url: queue, data: data};
                fulfill(qData);
            });
        });
    });

    return deferred;
}

function initQueue(queuePrefix, isJob){

    var params = {QueueNamePrefix: queuePrefix};

    var queue = getSQSQueue(params);

    queue.then(function(queueData){

        var messages = queueData.data.Messages[0];

        if(messages.length === 0){
            //console.debug('queue is empty');
            return;
        }

        var body = queueData.data.Messages[0].Body;
        var pairs = body.split('&');
        var resultObj = {};

        pairs.forEach(function(pair) {
            pair = pair.split('=');
            resultObj[pair[0]] = decodeURIComponent(pair[1] || '');
        });

        execQueue(resultObj, queueData.data.Messages[0], isJob).then(function(result){

            //console.debug('execQueue fulfilled', result);
            var receiptHandle = result;
            var AWS = require('aws-sdk');
            AWS.config.update({region:'us-east-1'});
            var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

            var params = {
                QueueUrl: queueData.url,
                ReceiptHandle: receiptHandle
            };

            sqs.deleteMessage(params, function(err, data) {
                if (err) console.error(err);
                //console.debug('successfully removed: ', data);
            });

            /*sqs.listQueues({QueueNamePrefix: queuePrefix}, function(err, data) {
             if (err) reject(err);
             queue = data.QueueUrls[0];
             });*/
        });

    });
}

app.get('/api/wp-exec', function(req, res, next){
    var AWS = require('aws-sdk');
    AWS.config.update({region:'us-west-2'});
    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
});


var api = require('./server/index');
var apiRouter = api.routes;
app.use(apiRouter);

app.get('/home', function(req, res, next){
    var locals = {};
    locals.title = 'home';
    var data = api.PostController.posts(req, 10, 1, 0);
    data.then(function(result){
        if(result.length === 0){
            res.sendStatus(404);
        }else{
            locals.data = result;
            var template = swig.compileFile('./dist/default.html');
            var output = template({data:locals.data, title: locals.title});
            res.status(200).send(output);
        }
    });
});

/*
app.get('*', function(req,res,next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    next();
});
*/

app.get('/subscribe', function(req, res){
    res.redirect('/subscribe-hub');
});

app.get('/adtest', function(req,res){
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
        canonical_url: '',
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

    res.render('index',{metatags:metatags, appConfig:appConfig});
});

app.get('/api/articles/:perPage/:page/:skip', function(req,res){
    var itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    if(itsABot){
        res.redirect('/');
    }else{
        var data = api.PostController.posts(req, parseInt(req.params.perPage),req.params.page, req.params.skip);
        data.then(function(result){
            if(result.length === 0){
                res.sendStatus(404);
            }else{
                res.status(200).json(result);
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
        canonical_url: '',
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

app.get('/wp/api/:path?', function(req,res){
    var path = req.params.path ? req.params.path : 'posts';
    request('http://altdriver.altmedia.com/wp-json/wp/v2/' + path, function (error, response, body) {
        var metatags = {
            robots: 'index, follow',
            title: appConfig.title,
            description: appConfig.description,
            // Facebook
            fb_title: appConfig.title,
            fb_site_name: appConfig.fb_sitename,
            fb_url: appConfig.url,
            fb_description: appConfig.description,
            canonical_url: '',
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
        res.render('index', {newrelic:newrelic, metatags: metatags, appConfig:appConfig});
    });
});

app.get('/feed/:feedname/', function(req,res){
    var feedName = req.params.feedname;
    request('http://altdriver.altmedia.com/'+feedName, function (error, response, body) {
        var result = body.replace(/altdriver.altmedia./g,'www.altdriver.');

        res.set('Content-Type', 'text/xml; charset=UTF-8');
        res.send(result);
    });
});

/*
 static paths
 */

app.use(express.static('./admin'));
//app.use(express.static(__dirname + './data'));
app.use(express.static(__dirname + './public/config'));

app.use(express.static(__dirname + './dist/favicons', {maxAge:600000, cache:true}));
app.use(express.static(__dirname + './dist/favicons.ico', {maxAge:600000, cache:true} ));
app.use(express.static(__dirname + './public/components/views/cards', {maxAge:600000, cache:true}));

var config = require('./public/config/config.json');
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
    str = str.replace('&amp;#8217;',"'");
    return str;
}

function setUserCookie(req, itsABot){
    //TODO add checkUserCookie method
    var userIsNew = null;
    if(typeof req.headers['user-agent'] !== 'undefined') {
        if (!itsABot && req.headers['user-agent'].toLowerCase().indexOf('healthcheck') === -1) {
            var user = null;
            var uuid = cc.generate({parts: 4, partLen: 6});

            try {
                if(typeof req.headers.cookie !== 'undefined') {
                    if (req.headers.cookie.indexOf('altduuid') === -1) {
                        userIsNew = true;
                        res.cookie('altduuid', uuid, {
                            expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
                            httpOnly: true
                        });

                        if(createUser) insertUser(uuid);

                    } else {
                        userIsNew = false;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    return userIsNew;
}

function insertUser(uuid){
    if(!itsABot && req.headers['user-agent'].toLocaleLowerCase().indexOf('healthcheck') === -1){
        api.UserController.create(uuid, {'headers':req.headers, 'rawHeaders':req.rawHeaders});
    }
}

app.get('/', function(req,res,next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);

    var newUser = setUserCookie(req, itsABot);

    if(itsABot) {
        try {
            var endpoint = 'http://' + req.headers.host + '/api/articles/post?perPage=5&pageNum=1&skip=0';

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
                        canonical_url: '',
                        fb_pages:appConfig.fb_pages,
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
        var metatags = {

            robots: 'index, follow',
            title: appConfig.title,
            description: appConfig.description,
            // Facebook
            fb_title: appConfig.title,
            fb_site_name: appConfig.fb_sitename,
            fb_url: appConfig.url,
            fb_description: appConfig.description,
            canonical_url: '',
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

        res.render('index', {newrelic:newrelic, metatags: metatags, appConfig:appConfig, cache:true, maxAge:600000}, function(err, html){
            res.set('Content-Type', 'text/html');
            res.send(html);
        });
    }
});

app.get('/partner-post/(:slug|:slug/)', function(req,res, next){

    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);

    var newUser = setUserCookie(req, itsABot);
    //insertUser();

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
        //console.debug('no params present... trying raw url');
        postName = originalUrl;
    }

    var endpoint = 'http://' + req.headers.host + '/api/' + postName;
    var siteUrl = 'http://'+ appConfig.url;
    var appUrl = 'http://admin.altdriver.com';

    var AWSSSLImgUrl = 'https://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/';
    var AWSImgUrl = 'http://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/';
    var imgUrl = 'http://assets.altdriver.com/img/';
    var imgUrlFailover = 'http://media.altdriver.com/uploads/sites/2/';

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
                        metatags.canonical_url = '';

                        metatags.title = '';
                        metatags.description = '';

                        var imgSrc = post.featured_image_src.original_wp[0].replace(AWSImgUrl, imgUrlFailover).replace(AWSSSLImgUrl, imgUrlFailover) + '?overlay=false';

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
                        metatags.fb_image = imgSrc;
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

        try {
            api.PostController.postByType('partner-post', postName).then(function(result){

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

                    var canonicalURL = post.postmeta.canonical_url[0];
                    metatags.canonical_url = canonicalURL;
                    metatags.published = post.date;
                    metatags.modified = post.modified;
                    metatags.category = post.category[0].name;
                    metatags.title = '';
                    metatags.description = '';

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-description')){
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                    }else{
                        metatags.description = '';
                    }

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-title')) {
                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                    }else{
                        metatags.title = post.title.rendered;
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
                    if(post.featured_image_src.hasOwnProperty('original_wp') && post.featured_image_src.original_wp.length > 0) {
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];
                    }

                    res.status(200).render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){
                        res.set('Content-Type', 'text/html');
                        res.send(html);
                    });
                }

            });
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

app.get('/stories/:type', function(req,res){
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
        canonical_url: '',
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

    res.render('index', {newrelic:newrelic, metatags: metatags, appConfig:appConfig, cache:true, maxAge:600000}, function(err, html){
        res.set('Content-Type', 'text/html');
        res.send(html);
    });
});

app.get('/trending/:page', function(req,res){
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
        canonical_url: '',
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

    res.render('index', {newrelic:newrelic, metatags: metatags, appConfig:appConfig, cache:true, maxAge:600000}, function(err, html){
        res.set('Content-Type', 'text/html');
        res.send(html);
    });
});

app.use(express.static(EXPRESS_ROOT, {maxAge:600000, cache:true}));


/*
TODO: move this to admin controller
*/


app.post('/auth', function(req, res){
    var input = new multiparty.Form();
    var creds = require('./public/config/creds.json');

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

    fs.realpath('./public/config', function(err, resolvedPath){
        fs.readdir(resolvedPath, function(err, files){
            if (files.indexOf('feed.conf.json') > -1) {
                var file = files[files.indexOf('feed.conf.json')];

                fs.unlink('./public/config/'+ file, function(){
                    fs.writeFile('./public/config/feed.conf.json', JSON.stringify(data), function(err){
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

/*
TODO
 */


app.post('/submit', function(req,res){

    if(req.headers.origin !== 'http://' + req.headers.host){
        res.status(403).end();
        return false;
    }
    var form = new multiparty.Form();

    var AWS = require('aws-sdk');
    AWS.config.update({region:'us-west-2'});
    var ses = new AWS.SES({apiVersion: '2010-12-01'});

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
    var s3Client = new AWS.S3({params: {Bucket: bucket, Key: 'AKIAINNUHXXUND27LA4A'}});

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
                ACL: 'app-read',
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

    var newUser = setUserCookie(req, itsABot);

    if(itsABot){
        res.send();
    }else{
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
            canonical_url: '',
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
        res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){
            res.set('Content-Type', 'text/html');
            res.send(html);
        });
    }
});

app.get('/category/(:category|:category/)', function(req,res){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);
    var newUser = setUserCookie(req, itsABot);
    var catName = req.params.category;
    var endpoint = 'http://' + req.headers.host + '/api/category/' + catName + '/5/1/0';
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
                        metatags.canonical_url = '';

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
            canonical_url: '',
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

        res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){
            res.set('Content-Type', 'text/html');
            res.send(html);
        });
    }
});

app.get('/:category/(:slug|:slug/)', function(req,res, next){
    itsABot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|facebook|twitterbot/i.test(req.headers['user-agent']);

    var newUser = setUserCookie(req, itsABot);

    //insertUser();

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

    var AWSImgUrl = 'http://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/';
    var AWSSSLImgUrl = 'https://s3-us-west-2.amazonaws.com/assets.altdriver/uploads/sites/2/';
    var imgUrl = 'http://assets.altdriver.com/img/';
    var imgUrlFailover = 'http://media.altdriver.com/uploads/sites/2/';

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
                        metatags.canonical_url = '';
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

                        var imgSrc = post.featured_image_src.original_wp[0].replace(AWSImgUrl, imgUrlFailover).replace(AWSSSLImgUrl, imgUrlFailover) + '?overlay=false';

                        metatags.fb_appid = fbAppId;
                        metatags.fb_publisher = fbUrl;
                        metatags.fb_type = 'article';
                        metatags.fb_site_name = appConfig.fb_sitename;
                        metatags.fb_title = metatags.title;
                        metatags.fb_url = siteUrl + req.url;
                        metatags.fb_description = metatags.description;
                        metatags.url = appUrl + '/' + req.params.category + '/' + req.params.slug;
                        metatags.fb_image = imgSrc;
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

        try {
            api.PostController.post(postName).then(function(result){

                var metatags = {};
                var post = null;

                if(result.type === 'partner-post'){
                    metatags.canonical_url = result.postmeta.canonical_url[0];
                }

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
                    metatags.canonical_url = '';

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-description')){
                        metatags.description = post.postmeta['_yoast_wpseo_opengraph-description'][0];
                    }else{
                        metatags.description = '';
                    }

                    if(post.postmeta.hasOwnProperty('_yoast_wpseo_opengraph-title')) {
                        metatags.title = post.postmeta['_yoast_wpseo_opengraph-title'][0];
                    }else{
                        metatags.title = post.title.rendered;
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
                    if(post.featured_image_src.hasOwnProperty('original_wp') && post.featured_image_src.original_wp.length > 0) {
                        metatags.fb_image = post.featured_image_src.original_wp[0];
                        metatags.fb_image_width = post.featured_image_src.original_wp[1];
                        metatags.fb_image_height = post.featured_image_src.original_wp[2];
                    }


                    res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){
                        res.set('Content-Type', 'text/html');
                        res.send(html);
                    });
                }


            });
        } catch (e) {
            console.error(e);
            console.log('post could not be retrieved...  ' + originalUrl + '\n\n');
            console.log('headers:\n ', req.headers);
            console.log('\n\nparams:\n', req.params);
            console.log('\n\nrawHeaders:\n ',req.rawHeaders);
            console.log('\n\n_parsedOriginalUrl:\n ', req._parsedOriginalUrl);
            //res.end();
        }
    }
});

app.get('/:page', function(req,res, next){
    console.log(req.params.page);
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
        canonical_url:'',
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
    //res.set('Content-Type', 'text/html');
    res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){

        res.send(html);
        res.end();
    });
});

app.get('*', function(req,res, next){
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
        canonical_url: '',
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

    res.render('index',{newrelic:newrelic, appConfig: appConfig, metatags:metatags, cache:true, maxAge:600000}, function(err, html){
        res.set('Content-Type', 'text/html');
        res.send(html);
    });
    next();
});


/*
 create server
 */
http.createServer(app).listen(app.get('port'), function(){
    if(process.env.NODE_ENV !== 'local'){
        snsSubscribe();
    }
    console.log('app listening on port ' + app.get('port'));
});