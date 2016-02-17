'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Post Schema
 */
var schema = {
    created: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String
    },
    password:{
        type: String
    },
    customData:{

    },
    uuid:{
        type: String,
        index: 1
    },
    lastseen:{
        type:Date
    }
};

var UserSchema = new Schema(schema);

/**
 * Validations
 *
 PostSchema.path('title').validate(function(title) {
    return !!title;
}, 'Title cannot be blank');

 PostSchema.path('content').validate(function(content) {
    return !!content;
}, 'Content cannot be blank');
 */

/**
 * Statics
 */
UserSchema.statics.load = function(id, cb) {
    var fields = [];

    for(var prop in schema){
        fields.push(prop);
    }
    fields.join(', ');
    this.findOne({
        _id: id
    }).populate(fields).exec(cb);
};

module.exports = mongoose.model('User', UserSchema);