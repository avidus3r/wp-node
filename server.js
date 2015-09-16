'use strict';

var express = require('express'),
    app = express(),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
    util = require('util'),
    multiparty = require('multiparty');

var EXPRESS_PORT = 80,
    EXPRESS_HOST = '172.31.8.101',
    //EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist';

app.use(express.static(EXPRESS_ROOT));
app.use(express.static(__dirname + '/tests'));
app.use(bodyParser.raw({extended:true}));

app.get('/tests', function(req, res){
    res.sendFile('SpecRunner.html', { root: path.join(__dirname, './tests') });
});

app.get('/', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/submit', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.post('/submit', function(req,res){
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        var uri = fields['remoteHost'];
        /*res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));*/
        request.post({url:'http://devaltdriver.wpengine.com/submit', form:fields.fields}, function(error, response, body){
            console.log('error: ', error,'body: ',body,'response: ',response);
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write(body);
            res.end();
        });
    });
});

app.get('/category/:category', function(req,res){
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|twitterbot/i.test(req.headers['user-agent'])){
        var feed = {};

        feed.endpoints = {
            url: 'http://local.altdriver.com',
            remoteUrl: 'http://devaltdriver.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };

        var catName = req.url.substr(req.url.lastIndexOf('/')+1, req.url.length);
        var endpoint = 'terms/category?name=' + catName;

        request(feed.endpoints.remoteUrl + feed.endpoints.basePath + endpoint, function(error, response, body){
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
                metatags.fb_url = category.link;
                metatags.fb_image = 'http://www.altdriver.com/wp-content/uploads/avatar_alt_driver_500x500.png';

                res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:url" content="'+ metatags.fb_url + '" ><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="'+ metatags.fb_site_name +'" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');
            }
        });

    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('/:category/:slug', function(req,res, next){
    if(/bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|twitterbot/i.test(req.headers['user-agent'])){

        var feed = {};

        feed.endpoints = {
            url: 'http://local.altdriver.com',
            remoteUrl: 'http://devaltdriver.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };

        var postName = req.url.substr(req.url.lastIndexOf('/')+1, req.url.length);
        var endpoint = 'posts?name=' + postName;

        request(feed.endpoints.remoteUrl + feed.endpoints.basePath + endpoint, function(error, response, body){
            if (!error && response.statusCode == 200) {
                var metatags = {};

                var post = JSON.parse([response.body][0]);
                /*for(var prop in post){
                     console.log(prop,post[prop]);
                 }*/
                // Standard meta
                post = post[0];
                metatags.title = post.title.rendered + ' - alt_driver';
                metatags.description = post.excerpt.rendered;

                // Facebook meta
                metatags.fb_type = 'article';
                metatags.fb_site_name = 'alt_driver';
                metatags.fb_title = post.title.rendered + ' - alt_driver';
                metatags.fb_description = post.excerpt.rendered;
                metatags.fb_url = post.link;
                metatags.fb_image = post.featured_image_src.medium[0];

                res.send('<html><head><meta property="og:locale" content="en_US"><meta property="og:url" content="'+ metatags.fb_url + '" ><meta property="og:title" content="'+ metatags.fb_title +'" ><meta property="og:image" content="'+ metatags.fb_image +'" ><meta property="og:description" content="'+ metatags.fb_description +'" ><meta property="og:site_name" content="'+ metatags.fb_site_name +'" ><meta property="og:type" content="'+ metatags.fb_type +'" ><meta property="fb:app_id" content="638692042912150"></head><body></body></html>');
            }

        });
    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

var server = app.listen(EXPRESS_PORT, EXPRESS_HOST, 511, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('app listening at http://%s:%s', host, port);
});
