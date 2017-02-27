/**
 * Created by Administrator on 2016/10/9.
 */
var setting = require('../setting');
var mongoose = require('mongoose');

var url = 'mongodb://' + setting.mongodb.host + ':' + setting.mongodb.port + '/' + setting.mongodb.name;
mongoose.connect(url);

mongoose.connection.on('connected', function () {
    console.log('-------------------------Mongoose connection open to ' + url);
});

mongoose.connection.on('error',function (err) {
    console.log('--------------------------Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('--------------------------Mongoose connection disconnected');
});

module.exports = mongoose;