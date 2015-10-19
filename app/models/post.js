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
    id: {
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    campaign_active:{
        type: Boolean,
        default: null
    },
    sponsor: {
        type: Object,
        default: null
    },
    parent: {
        type: Number,
        required: true,
        default: 0
    },
    guid: {
        type: Object,
        required: true
    },
    modified:{
        type: Date,
        required: true
    },
    modified_gmt:{
        type: Date,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    title: {
        type: Object,
        required: true
    },
    content: {
        type: Object,
        required: true
    },
    excerpt: {
        type: Object
    },
    author: {
        type: Number,
        required: true
    },
    featured_image: {
        type: Number,
        required: true
    },
    comment_status: {
        type: String
    },
    ping_status: {
        type: String
    },
    sticky: {
        type: Boolean
    },
    format: {
        type: String
    },
    votes: {
        type: Object
    },
    comment_count: {
        type: Object
    },
    postmeta: {
        type: Object
    },
    category: {
        type: Array,
        required: true
    },
    featured_image_src: {
        type: Object
    },
    author_meta: {
        type: Object
    }
};

var PostSchema = new Schema(schema);

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
PostSchema.statics.load = function(id, cb) {
    var fields = [];

    for(var prop in schema){
        fields.push(prop);
    }
    fields.join(', ');
    this.findOne({
        _id: id
    }).populate(fields).exec(cb);
};

module.exports = mongoose.model('Post', PostSchema);