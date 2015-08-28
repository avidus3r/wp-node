'use strict';

var express = require('express'),
    app = express(),
    path = require('path'),
    phantomjs = require('phantomjs'),
    phantom = require('phantom'),
    system = require('system');


var EXPRESS_PORT = 80,
    EXPRESS_HOST = '172.31.8.101',
    //EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist';

app.use(express.static(EXPRESS_ROOT));
//app.use(require('prerender-node'));

app.get('*', function(req,res){

    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/', function(req,res){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/category/:category', function(req,res){
    if((req.headers['user-agent'].indexOf('facebookexternalhit') != -1 || req.headers['user-agent'].indexOf('twitterbot') != -1) && req.url.indexOf('%7B%7B%20') === -1){
        var reqUrl = 'http://' + req.headers.host + req.url;
        phantom.create(function (ph) {
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
        });
    }else {
        res.sendFile('index.html', {root: path.join(__dirname, './dist')});
    }
});

app.get('/:category/:slug', function(req,res, next){
    if((req.headers['user-agent'].indexOf('facebookexternalhit') != -1 || req.headers['user-agent'].indexOf('twitterbot') != -1) && req.url.indexOf('%7B%7B%20') === -1){
        var reqUrl = 'http://' + req.headers.host + req.url;
        phantom.create(function (ph) {
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
