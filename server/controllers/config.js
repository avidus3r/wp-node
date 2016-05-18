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