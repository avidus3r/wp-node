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
    ID:{
        type: Number,
        required: true
    },
    post_author:{
        type: String
    },
    post_date:{
        type: Date
    },
    post_date_gmt:{
        type: Date
    },
    post_content:{
        type: String
    },
    post_title:{
        type: String
    },
    post_excerpt:{
        type: String
    },
    post_status:{
        type: String
    },
    comment_status:{
        type: String
    },
    ping_status:{
        type: String
    },
    post_password:{
        type: String
    },
    post_name:{
        type: String
    },
    to_ping:{
        type: String
    },
    pinged:{
        type: String
    },
    post_modified:{
        type: Date
    },
    post_modified_gmt:{
        type: String
    },
    post_content_filtered:{
        type: String
    },
    post_parent:{
        type: Number,
        required: true,
        default:0
    },
    guid:{
        type: String
    },
    menu_order:{
        type: Number,
        required: true
    },
    post_type:{
        type: String
    },
    post_mime_type:{
        type: String
    },
    comment_count:{
        type: String
    },
    filter:{
        type: String
    },
    db_id:{
        type: Number,
        required: true
    },
    menu_item_parent:{
        type: String,
        required: true
    },
    object_id:{
        type: String,
        required: true
    },
    object:{
        type: String,
        required: true
    },
    type:{
        type: String
    },
    type_label:{
        type: String
    },
    url:{
        type: String
    },
    title:{
        type: String
    },
    target:{
        type: String
    },
    attr_title:{
        type: String
    },
    description:{
        type: String
    },
    classes:{
        type: Array
    },
    xfn:{
        type: String
    },
    mega_menu:{
        type: String
    }
};

var MenuSchema = new Schema(schema);

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
MenuSchema.statics.load = function(id, cb) {
    var fields = [];

    for(var prop in schema){
        fields.push(prop);
    }
    fields.join(', ');
    this.findOne({
        _id: id
    }).populate(fields).exec(cb);
};

module.exports = mongoose.model('Menu', MenuSchema);