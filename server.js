'use strict';

var express = require('express'),
    app = express(),
    path = require('path');


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
    //console.log(req.headers['user-agent']);
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

app.get('/:category/:slug', function(req,res, next){
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });

});

var server = app.listen(EXPRESS_PORT, EXPRESS_HOST, 511, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('app listening at http://%s:%s', host, port);
});
