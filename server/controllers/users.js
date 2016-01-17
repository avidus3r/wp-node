'use strict';

var mongoose    = require('mongoose'),
    User        = mongoose.model('User');

var UsersController = {
    create: function(uuid, customData){
        var user = new User({uuid:uuid, customData:customData});
        user.save(function(err, result){
            if(err) console.error(err);
        });
    },
    update: function(user){
        console.log(user);
        User.update({'_id': user._id}, user,{multi:true}, function(err, nItems){
            if(err){
                //cb(false);
                console.log(err);
            }else{
                //cb(true);
                console.log('success');
            }
        });
    },
    me: function(uuid){
        console.log('controller: ', uuid);
        var q = User.find({
            'uuid': uuid
        });
        return q.exec();
    },
    user: function(){

    }
};

module.exports = UsersController;