'use strict';

var express     = require('express'),
    http        = require('http'),
    app         = express(),
    bodyParser  = require('body-parser');

var EXPRESS_PORT = 3000,
    EXPRESS_HOST = '127.0.0.1',
    EXPRESS_ROOT = './dist';

app.set('port', process.env.PORT || EXPRESS_PORT);

/*
static paths
 */
app.use(express.static(EXPRESS_ROOT));
app.use(express.static(__dirname + './tests'));
app.use(express.static(__dirname + './dist/admin'));
app.use(express.static(__dirname + './data'));
app.use(express.static(__dirname + './app/config'));
app.use(express.static(__dirname + './app/components/views/cards'));


/*
 middleware
 */
app.use(bodyParser.raw({extended:true}));
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));


/*
 express app routes
 */
app.use('/', require('./server/routes'));


/*
 create server
 */
http.createServer(app).listen(app.get('port'), function(){
    console.log('app listening on port ' + app.get('port'));
});