'use strict';

var mongoose = require('mongoose');

var dbName = process.env.mdbname;
var dbHost = process.env.mdbhost;
var dbUser = process.env.mdbuser;
var dbPass = process.env.mdbpass;

var dbUrl = 'mongodb://' + dbHost + '/' + dbName;

mongoose.connect(dbUrl,{user:dbUser, pass:dbPass});

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
exports.Config = require('./models/config');
exports.PostController = require('./controllers/posts');
exports.UserController = require('./controllers/users');
exports.routes = require('./routes/posts');