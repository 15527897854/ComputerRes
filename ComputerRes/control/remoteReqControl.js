/**
 * Created by Franklin on 16-4-9.
 * Remote Request Control
 */
var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var request = require('request');

function RemoteReqControl()
{}

module.exports = RemoteReqControl;

RemoteReqControl.getRequest = function (req, url, callback) {
    //TODO ping不通时如何快速的返回err
    req.pipe(request.get(url, function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};

RemoteReqControl.postRequest = function (req, url, callback) {
    req.pipe(request.post(url,function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};


RemoteReqControl.getRequestJSON = function (url, callback) {
    request.get(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.putRequestJSON = function (url, callback) {
    request.put(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.deleteRequestJSON = function (url, callback) {
    request.delete(url,function (err, response, data) {
        if (err) {
            return callback(err);
        }
        try {
            var obj = eval('(' + data + ')');
        }
        catch (ex) {
            return callback(ex, null);
        }
        data = JSON.parse(data);
        return callback(null, data);
    });
};

RemoteReqControl.ping = function(target, callback){
    request.head('http://' + target, function(error, response, body){
        if (error) {
            return callback({result : 'Err'});
        } else {
            return callback({result : 'OK'});
        }
    });
};
