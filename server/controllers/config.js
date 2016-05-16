var mongoose = require('mongoose'),
    Config = mongoose.model('Config'),
    async = require('async');

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
    	var update = Config.update({'type':'post-config'}, {$set:{}});
    	console.log(cards);


        // var update = Config.update({
        //     'type': 'post-config'
        // }, {
        //     $set: {
        //         'cards': cards
        //     }
        // });
        // update.exec().then(function(err) {
        //     console.log(err);
        // });
    }

};

// {
//     "_id" : ObjectId("573a098b0931ab821e0566ea"),
//     "type" : "post-config",
//     "cardAmount" : 10,
//     "cards" : [ 
//         {
//             "type" : "ad"
//         }, 
//         {
//             "type" : "ad"
//         }, 
//         {
//             "type" : "gif"
//         }, 
//         {
//             "type" : "video"
//         }, 
//         {
//             "type" : "partner"
//         }, 
//         {
//             "type" : "html"
//         }, 
//         {
//             "type" : "ad"
//         }, 
//         {
//             "type" : "gif"
//         }, 
//         {
//             "type" : "video"
//         }, 
//         {
//             "type" : "partner"
//         }
//     ],
//     "__v" : 0
// }

module.exports = ConfigController;