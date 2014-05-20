var mongoose = require('mongoose');
var MTI = require('mongoose-ts');
var mti;

function timeSeriesStore(options) {

    var that = this;
    var verbose = options.verbose || false;

    mongoose.connect(options.db);

    that.mti = new MTI('mycol', {interval: 1, verbose: verbose});
}

timeSeriesStore.prototype.publish = function () {

    var that = this;
    var i = 1;

    return function (packet, client, callback) {

        if (client == undefined) {
            return callback();
        }
        var now = new Date();
        that.mti.push(new Date(), packet.payload.toString(), false, {}, function (err, docs) {
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