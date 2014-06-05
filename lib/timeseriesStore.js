'use strict';

var mongoose = require('mongoose');
var MTI = require('mongoose-ts');

function TimeSeriesStore(connection, options) {

    this.verbose = options.verbose || false;
    this.tsConnection = connection;

}

TimeSeriesStore.prototype.publish = function () {

    var that = this;

    return function (packet, client, callback) {

        var topicStrings,
            collection,
            mti;

        if (client === undefined) {
            return callback();
        }

        /* TODO handle variable length topics

        var topics = packet.topic.split('/'),
            collName = req.headers['x-domain'];

        for (var x in topics) {
            collName = collName + '@' + topics[x];
        }

        */

        if (packet.topic.indexOf('/') == 0) {
            topicStrings = packet.topic.split("/", 3);
            collection = client.domain + '@' + topicStrings[1] + '@' + topicStrings[2];
        } else {
            topicStrings = packet.topic.split("/", 2);
            collection = client.domain + '@' + topicStrings[1] + '@' + topicStrings[2];
        }

        mti = new MTI(that.tsConnection, collection, {interval: 1, verbose: that.verbose});

        mti.push(new Date(), new Number(packet.payload), false, {}, function (err) {

            if (err) {
                console.log(err);
                return callback();
            }

            return callback(packet, client);
        });

    };
};

module.exports = TimeSeriesStore;