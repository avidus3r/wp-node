'use strict';

/**
 * Module dependencies.
 */
var mongoose    = require('mongoose'),
    Post        = mongoose.model('Post'),
    _           = require('lodash');

module.exports = function(Post) {

    return {
        /**
         * Find post by id
         */
        post: function(req, res, next, id) {
            Post.load(id, function(err, post) {
                if (err) return next(err);
                if (!post) return next(new Error('Failed to load post ' + id));
                req.post = post;
                next();
            });
        },
        /**
         * Create a post
         */
        create: function(req, res) {
            var post = new Post(req.body);
            //article.user = req.user;

            post.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the post'
                    });
                }

                /*Posts.events.publish({
                    action: 'created',
                    user: {
                        name: req.user.name
                    },
                    url: config.hostname + '/articles/' + article._id,
                    name: article.title
                });*/

                res.json(post);
            });
        },
        /**
         * Update a post
         */
        update: function(req, res) {
            var post = req.post;

            post = _.extend(post, req.body);


            post.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the post'
                    });
                }

                /*Articles.events.publish({
                    action: 'updated',
                    user: {
                        name: req.user.name
                    },
                    name: article.title,
                    url: config.hostname + '/articles/' + article._id
                });*/

                res.json(post);
            });
        },
        /**
         * Delete a post
         */
        destroy: function(req, res) {
            var post = req.post;


            post.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the post'
                    });
                }

                /*Articles.events.publish({
                    action: 'deleted',
                    user: {
                        name: req.user.name
                    },
                    name: article.title
                });*/

                res.json(post);
            });
        },
        /**
         * Show a post
         */
        show: function(req, res) {

            /*Articles.events.publish({
                action: 'viewed',
                user: {
                    name: req.user.name
                },
                name: req.article.title,
                url: config.hostname + '/articles/' + req.article._id
            });*/

            res.json(req.post);
        },
        /**
         * List of Posts
         */
        all: function(req, res) {
            var query = req.acl.query('Post');

            query.find({}).exec(function(err, posts) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the posts'
                    });
                }

                res.json(posts)
            });

        }
    };
};