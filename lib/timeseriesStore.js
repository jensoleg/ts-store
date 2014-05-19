var mongoose = require('mongoose');
var MTI = require('mongoose-ts');
var mti;

function timeSeriesStore(options) {

    mongoose.connect('mongodb://localhost/mydb');

    var that = this;
//    that.mti = new MTI('mycol', {interval: 1, postProcessImmediately: true, verbose: true});
    that.mti = new MTI('mycol', {interval: 1});
}

timeSeriesStore.prototype.publish = function () {

    var that = this;
    var i = 1;

    return function (packet, client, callback) {

        if (client == undefined) {
            return callback();
        }

        that.mti.push(new Date(), i += 1, false, {}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs) console.log('Saved: ' + docs.latest);
            }
        });

    }
};

module.exports = timeSeriesStore;