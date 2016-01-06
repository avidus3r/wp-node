var mongoose = require('mongoose');
var dbUrl = 'mongodb://altdriver-0.altdriver.5600.mongodbdns.com:27000/altdriver';

mongoose.connect(dbUrl,{user:'admin', pass:'@ltDr1v3r!'});
var db = mongoose.connection;

process.on('SIGINT', function(){
    db.close(function(){
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

var Post = require('../app/models/post');

exports.db = db;
exports.Post = Post;