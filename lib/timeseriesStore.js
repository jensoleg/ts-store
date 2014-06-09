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

        var collection,
            mti,
            topics,
            i;

        if (client === undefined) {
            return callback();
        }

        var mongoData,
            data = packet.payload.toString();

        if (!isNaN(parseFloat(data))) {
            mongoData = parseFloat(data);
        } else if (!isNaN(parseInt(data, 10))) {
            mongoData = parseInt(data, 10);
        } else {
            return callback();
        }

        topics = packet.topic.split('/');
        collection = client.domain;

        for (i = 0; i < topics.length; i = i + 1) {
            if (topics[i].length > 0) {
                collection = collection + '@' + topics[i];
            }
        }

        mti = new MTI(that.tsConnection, collection, {interval: 1, verbose: that.verbose});
        mti.push(new Date(), mongoData, false, {}, function (err) {

            if (err) {
                console.log(err);
                return callback();
            }

            return callback(packet, client);
        });

    };
};

module.exports = TimeSeriesStore;