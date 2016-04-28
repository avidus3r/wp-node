'use strict';

var api     = require('../index'),
    request = require('request'),
    ApiCache        = require('apicache'),
    apicache        = ApiCache.options({ debug: true }).middleware,
    CronJob         = require('cron').CronJob;

var AWSTools = {
    cronEnabled: false,
    timer: null,
    /**
     * Initializes AWSTools
     *
     * @method init
     * @class AWSTools
     *
     */
    init: function(){
        console.log('AWSTools :: init');

        var self = this;
        if(process.env.NODE_ENV !== 'local'){

            //start polling SQS for wordpress updates
            self.timer = setInterval(function(){
                console.log('hey');
                self.initQueue('wp-exec', false);
            }, 60000);

            //create daily cron task
            var job = new CronJob({
                cronTime: '10 05 09 * * 1-7',
                onTick: function () {
                    console.log('starting cron job');
                    /*
                     * Runs every weekday (Monday through Sunday)
                     * at 3:30:00 AM.
                     */
                    self.initQueue('wp-daily-sync', true);
                },
                start: true, /* Start the job right now */
                timeZone: 'America/New_York' /* Time zone of this job. */
            });

            //start job
            if(self.cronEnabled) job.start();
        }
    },
    /**
     * Initializes Queue
     *
     * @method initQueue
     * @memberOf AWSTools
     * @param {String} queuePrefix SQS queue prefix name
     * @param {Boolean} isJob true if instance is a ChronJob false if instance is an interval
     *
     */
    initQueue: function(queuePrefix, isJob){
        console.log('initQueue :: ', queuePrefix, isJob);
        var self = this;
        var params = {QueueNamePrefix: queuePrefix};

        var queue = self.getSQSQueue(params);

        queue.then(function(queueData){

            var messages = queueData.data.Messages[0];

            if(messages.length === 0){
                //console.log('queue is empty');
                return;
            }

            var body = queueData.data.Messages[0].Body;
            var pairs = body.split('&');
            var resultObj = {};

            pairs.forEach(function(pair) {
                pair = pair.split('=');
                resultObj[pair[0]] = decodeURIComponent(pair[1] || '');
            });

            self.execQueue(resultObj, queueData.data.Messages[0]).then(function(result){

                //console.log('execQueue fulfilled', result);
                var receiptHandle = result;
                var AWS = require('aws-sdk');
                AWS.config.update({region:'us-east-1'});
                var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

                var params = {
                    QueueUrl: queueData.url,
                    ReceiptHandle: receiptHandle
                };

                sqs.deleteMessage(params, function(err, data) {
                    if (err) console.error(err);
                    console.log('successfully removed: ', data);
                });

                /*sqs.listQueues({QueueNamePrefix: queuePrefix}, function(err, data) {
                 if (err) reject(err);
                 queue = data.QueueUrls[0];
                 });*/
            });

        });
    },
    /**
     * Executes SQS Message
     *
     * @method execQueue
     * @memberOf AWSTools
     * @param {Object} queueData An SQS Message
     * @param {Object} message A map of SQS Message properties
     *
     */
    execQueue: function(queueData, message){
        console.log('execQueue :: ', queueData, message);
        var self = this;
        var deferred = new Promise(function(fulfill, reject){

            var result = null;

            var postId = queueData.postID;
            var restBase = queueData.restBase;
            var restParent = queueData.restParent;
            var host = null;

            switch(process.env.NODE_ENV){
                case 'production':
                    host = restParent + '.altmedia.com';
                    break;
                case 'development':
                    host = restParent + '.staging.altmedia.com';
                    break;
                default:
                    host = restParent + '.local.altmedia.com';
                    break;
            }

            var url = 'http://' + host + '/wp-json/wp/v2/' + restBase + '/' + postId;
            url = url.replace(/\s/,'');

            switch(queueData.method){
                case 'update':
                case 'create':
                case 'publish':
                    request(url, function (error, response, body) {
                        //console.log('response: ', response);
                        if(response.statusCode === 200) {
                            var post = JSON.parse(body);

                            api.PostController.exists(post.id).then(function (result) {
                                if (result.length === 0) {

                                    api.PostController.insert(post, function (success) {
                                        //if (!success) res.sendStatus(500);
                                        //res.sendStatus(200);
                                        api.PostController.updating = false;
                                        fulfill(message.ReceiptHandle);
                                    });

                                } else {
                                    var updatePost = result[0];

                                    api.PostController.update(updatePost._id, post, function (success) {
                                        //if (!success) res.sendStatus(500);
                                        ApiCache.clear('/api/' + updatePost.slug);
                                        var env = process.env.NODE_ENV === 'production' ? (process.env.appname === 'altdriver' ? 'www.' : '') : 'staging.';
                                        var appUrl = process.env.appname === 'altdriver' ? env + 'altdriver.com' : env + process.env.appname + '.com';
                                        var postUrl = updatePost.link.replace(updatePost.link.substring(0,updatePost.link.indexOf('.com/')+4),'http://'+appUrl);
                                        //console.log('posturl: ', postUrl);
                                        setTimeout(function() {
                                            request
                                                .post('https://graph.facebook.com/?id=' + encodeURIComponent(postUrl) + '&scrape=true')
                                                .on('response', function (response) {
                                                    console.log(response);
                                                });
                                        },1000);

                                        //res.sendStatus(200);
                                        fulfill(message.ReceiptHandle);
                                        api.PostController.updating = false;
                                    });
                                }
                            });
                        }else{
                            //res.sendStatus(response.statusCode);
                            reject(result);
                            api.PostController.updating = false;
                        }
                    });
                    break;
                case 'delete':
                    api.PostController.destroy(postId);
                    fulfill(message.ReceiptHandle);
                    break;
            }

        });

        return deferred;
    },

    /**
     * Subscribes to AWS SNS Topic
     *
     * @method snsSubscribe
     * @memberOf AWSTools
     *
     */
    snsSubscribe: function(){
        var AWS = require('aws-sdk');
        AWS.config.update({region:'us-east-1'});
        var sns = new AWS.SNS({apiVersion: '2010-03-31'});

        var params = {
            Protocol: 'sqs',
            TopicArn: 'arn:aws:sns:us-east-1:629760438439:wp-update-queue',
            Endpoint: 'arn:aws:sqs:us-east-1:629760438439:wp-exec'
        };
        sns.subscribe(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
        });
    },

    /**
     * Gets a queue from AWS SQS
     *
     * @method getSQSQueue
     * @memberOf AWSTools
     *
     * @param {Object} params A map of parameters to identify a queue by prefix name
     *
     */
    getSQSQueue: function(params){
        console.log('getSQSQueue :: ', params);
        var AWS = require('aws-sdk');
        AWS.config.update({region:'us-east-1'});
        var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

        var queue = null;

        var deferred = new Promise(function(fulfill, reject){
            sqs.listQueues(params, function(err, data) {
                if (err) reject(err);
                queue = data.QueueUrls[0];
                var params = {
                    QueueUrl: queue,
                    AttributeNames: [
                        'All'
                    ],
                    MaxNumberOfMessages: 10
                };

                sqs.receiveMessage(params, function(err, data) {
                    if (err) reject(err);
                    var qData = { url: queue, data: data};
                    fulfill(qData);
                });
            });
        });

        return deferred;
    }
};

module.exports = AWSTools;