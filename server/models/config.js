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
    "type": String,
    "cardAmount": Number,
    "cards": Array,
    "html": String
};

var ConfigSchema = new Schema(schema);


/**
 * Statics
 */
ConfigSchema.statics.load = function(id, cb) {
    var fields = [];

    for (var prop in schema) {
        fields.push(prop);
    }
    fields.join(', ');
    this.findOne({
        _id: id
    }).populate(fields).exec(cb);
};

module.exports = mongoose.model('Config', ConfigSchema);