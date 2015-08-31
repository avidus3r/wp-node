'use strict';

var express = require('express'),
    app = express(),
    path = require('path'),
    phantomjs = require('phantomjs'),
    phantom = require('phantom'),
    system = require('system'),
    request = require('request');


var EXPRESS_PORT = 3000,
    //EXPRESS_HOST = '192.168.1.88',
    EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist';

app.use(express.static(EXPRESS_ROOT));
//app.use(require('prerender-node'));

/*app.get('*', function(req,res){

    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});
 */

app.get('/', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/category/:category', function(req,res){
    if((req.headers['user-agent'].indexOf('facebookexternalhit') != -1 || req.headers['user-agent'].indexOf('twitterbot') != -1)){
        var reqUrl = 'http://' + req.headers.host + req.url;

        var feed = {};

        feed.endpoints = {
            url: 'http://local.altdriver.com',
            remoteUrl: 'http://devaltdriver.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };
        var catName = req.url.substr(req.url.lastIndexOf('/')+1, req.url.length);
        var endpoint = 'terms/category?name=' + catName;
        console.log(feed.endpoints.remoteUrl + feed.endpoints.basePath + endpoint);
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

                /*phantom.create(function (ph) {
                    ph.createPage(function (page) {
                        console.log(reqUrl);
                        page.open(reqUrl, function (status) {
                            console.log("opened ", status);
                            page.evaluate(function () { return document; }, function (result) {
                                res.send(result.all['0'].outerHTML);
                                ph.exit();
                            });
                        });
                    });
                });*/
            }
        });
    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('/:category/:slug', function(req,res, next){
    if((req.headers['user-agent'].indexOf('facebookexternalhit') != -1 || req.headers['user-agent'].indexOf('twitterbot') != -1)){
        var reqUrl = 'http://' + req.headers.host + req.url;

        var feed = {};

        feed.endpoints = {
            url: 'http://local.altdriver.com',
            remoteUrl: 'http://devaltdriver.wpengine.com',
            basePath: '/wp-json/wp/v2/'
        };
        var postName = req.url.substr(req.url.lastIndexOf('/')+1, req.url.length);
        var endpoint = 'posts?name=' + postName;
        //console.log(feed.endpoints.remoteUrl + feed.endpoints.basePath + endpoint);
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

                /*phantom.create(function (ph) {
                 ph.createPage(function (page) {
                 console.log(reqUrl);
                 page.open(reqUrl, function (status) {
                 console.log("opened ", status);
                 page.evaluate(function () { return document; }, function (result) {
                 res.send(result.all['0'].outerHTML);
                 ph.exit();
                 });
                 });
                 });
                 });*/
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
