'use strict';

var mongoose = require('mongoose');
var appName = process.env.appname;
var dbUrl = null;

switch(appName){
    case 'altdriver':
        dbUrl = 'mongodb://altdriver-0.altdriver.5600.mongodbdns.com:27000/altdriver';
        mongoose.connect(dbUrl,{user:'admin', pass:'@ltDr1v3r!'});
        break;
    case 'driversenvy':
        dbUrl = 'mongodb://52.35.102.123:27017/altdriver';
        mongoose.connect(dbUrl);
        break;
}

var db = mongoose.connection;

process.on('SIGINT', function(){
    db.close(function(){
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

exports.db = db;
exports.Post = require('./models/post');
exports.Menu = require('./models/menu');
exports.User = require('./models/user');
exports.PostController = require('./controllers/posts');
exports.UserController = require('./controllers/users');
exports.routes = require('./routes/posts');