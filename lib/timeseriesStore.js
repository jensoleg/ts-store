var mongoose = require('mongoose');
var MTI = require('mongoose-ts');
var mti;

function timeSeriesStore(options) {

    var that = this;
    var verbose = options.verbose || false;

    that.mti = new MTI('readings', {interval: 1, verbose: verbose});
}

timeSeriesStore.prototype.publish = function () {

    var that = this;
    var i = 1;

    return function (packet, client, callback) {

        if (client == undefined) {
            return callback();
        }
        var now = new Date();
        that.mti.push(new Date(), new Number(packet.payload), false, {}, function (err, docs) {
            if (err) {
                console.log(err);
                return callback();
            } else {
                return callback(packet,client);
            }
        });


    }
};

module.exports = timeSeriesStore;