'use strict';

var express = require('express'),
    app = express(),
    routes = require('./app/app.routes'),
    path = require('path');


var EXPRESS_PORT = 3000,
    EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist';

app.use(express.static(EXPRESS_ROOT));

app.get('*', function(req,res){
    //res.sendfile(EXPRESS_ROOT+'/index.html');
    res.sendFile('index.html', { root: path.join(__dirname, './dist') });
});

var server = app.listen(EXPRESS_PORT, EXPRESS_HOST, 511, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('app listening at http://%s:%s', host, port);
});
