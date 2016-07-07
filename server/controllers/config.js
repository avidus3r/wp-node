var mongoose = require('mongoose'),
    Config = mongoose.model('Config'),
    ClientConfig = mongoose.model('clientConfig'),
    async = require('async'),
    fs = require('fs');

var ConfigController = {

    getConfig: function(req, res) {
        var query = Config.findOne({
            'type': 'post-config'
        });
        query.exec().then(function(results) {
            res.send(results);
        });
    },

    updateCards: function(req, res) {
        var numbersOfcards = req.body.cardAmount;
        var cards = req.body.cards;
        console.log(cards);
        var response = {
            success: null,
            errMessage: null
        };
        var update = Config.update({
            'type': 'post-config'
        }, {
            $set: {
                cards: cards,
                cardAmount: cards.length
            }
        });
        if (cards.length > 0) {
            update.exec().then(function(results, err) {
                console.log(results.Query);
                response.success = true;
                res.send(response);
            });
        } else {
            response.success = false;
            response.errMessage = 'cards must be defined'
            res.send(response);
        }

    },

    updateHtml: function(req, res) {
        var html = req.body.html;
        var response = {
            success: null,
            errMessage: null
        };
        var update = Config.update({
            'type': 'post-config'
        }, {
            $set: {
                html: html
            }
        });
        update.exec().then(function(results, err) {
            response.success = true;
            res.send(response);
        });
    },

    getClientConfig: function(req, res) {
        var query = ClientConfig.findOne({});
        query.exec().then(function(results) {
            res.json(results);
        });
    },

    createClientConfig: function(req, res) {
        var subConfig = {
            name:req.body.app.name,
            app: req.body.app
        };
        var newConfig = new ClientConfig(subConfig);
        //console.log(req.body);
        var response = {
            success: null,
            errMessage: null
        };
        newConfig.save(function(err) {
            console.log(err);
            response.success = true;
            res.send(response);
        });
    },

    updateClientConfig: function(req, res) {
        var app = req.body.app;
        //console.log(app);
        var response = {
            success: null,
            errMessage: null
        };
        var appName = app.name;
        var cfg = {};
        cfg[appName] = {'app' : app};
        var update = ClientConfig.update({
            'name': app.name
        }, {
            $set: {
                app: app
            }
        });
        update.exec().then(function(results, err) {
            console.log(arguments);
            response.success = true;

            fs.realpath(process.cwd() + '/public/config', function(err, resolvedPath){
                fs.readdir(resolvedPath, function(err, files){
                    if (files.indexOf('config.json') > -1) {
                        var file = files[files.indexOf('config.json')];

                        fs.unlink(process.cwd() + '/public/config/'+ file, function(){
                            fs.writeFile(process.cwd() + '/public/config/config.json', JSON.stringify(cfg), function(err){
                                if(err) throw err;
                            });
                        });
                    }
                    if(err) throw err;
                });
            });

            res.send(response);
        });
    }

};


module.exports = ConfigController;