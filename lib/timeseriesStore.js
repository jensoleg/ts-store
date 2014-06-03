'use strict';

var mongoose = require('mongoose');
var MTI = require('mongoose-ts');

function TimeSeriesStore(options) {

    var verbose = options.verbose || false;
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

        if (packet.topic.indexOf('/') == 0) {
            topicStrings = packet.topic.split("/", 2);
        } else {
            topicStrings = packet.topic.split("/", 1);
        }

        collection = client.domain + '.' + topicStrings[0] + '.' + topicStrings[1];

        mti = new MTI(collection, {interval: 1, verbose: that.verbose});

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