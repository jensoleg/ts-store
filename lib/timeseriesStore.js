'use strict';

var MTI = require('mongoose-ts'),
    LRU = require("lru-cache"),
    moment = require("moment"),
    lruOptions = {
        max: 500,
        length: function (n) {
            return n * 2;
        },
        dispose: function (key, n) {

        },
        maxAge: 1000 * 60 * 60
    },
    cache = LRU(lruOptions);


function TimeSeriesStore(connection, options) {

    this.verbose = options.verbose || false;
    this.tsConnection = connection;

}

TimeSeriesStore.prototype.publish = function () {

    var that = this;

    return function (packet, client, callback) {

        var collection, mti, topics, index = 0, i;

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

        collection = topics[index];
        if (!collection) {
            index = 1;
            collection = topics[index];
        }
        for (i = index + 1; i < topics.length; i = i + 1) {
            if (topics[i].length > 0) {
                collection = collection + '@' + topics[i];
            }
        }

        mti = cache.get(collection);
        if (!mti) {
            mti = new MTI(that.tsConnection, collection, {interval: 1, verbose: that.verbose});
            cache.set(collection, mti);
        }

        mti.push(moment(), mongoData, false, {}, function (err) {

            if (err) {
                console.log(err);
                return callback();
            }

            return callback(packet, client);
        });

    };
};

module.exports = TimeSeriesStore;