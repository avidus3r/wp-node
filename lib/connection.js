var mongoose = require('mongoose');
var dbUrl = 'mongodb://localhost/altdriver';

mongoose.connect(dbUrl);
var db = mongoose.connection;

process.on('SIGINT', function(){
    db.close(function(){
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

require('../app/models/post');