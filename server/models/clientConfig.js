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
    "app": {
      "name": String,
      "title": String,
      "description": String,
      "url": String,
      "per_page": String,
      "prefetch_at": String,
      "scroll_amount": String,
      "avatar": String,
      "loading_message":String,
      "fb_sitename":String,
      "fb_appid": String,
      "fb_pages":String,
      "fb_pixel_id": String,
      "fb_url": String,
      "feedPath": String,
      "ga": String,
      "gtm_id": String,
      "adsPerPage": String,
      "displayAds": String,
      "sponsors": String,
      "pubads": Object,
      "env": Object
    }
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

module.exports = mongoose.model('clientConfig', ConfigSchema);