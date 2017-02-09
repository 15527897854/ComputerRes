/**
 * Created by Franklin on 16-4-9.
 * Remote Request Control
 */
var http = require('http');
var qs = require('querystring');
var fs = require('fs');
var request = require('request');

function RemoteReqControl()
{
}

module.exports = RemoteReqControl;

//远程请求
RemoteReqControl.Request = function(options, content, callback)
{
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            return callback(null, data);
        });
        res.on('end',function(){
            console.log('-------------------------res end-------------------------------');
        });
    });

    req.on('error', function(err){
        console.log('_________________________\n'+options.host);
        console.log('Request Error : ' + err.message);
        return callback(err);
    });

    //请求内容
    if(content != null)
    {
        req.write(qs.stringify(content));
    }

    req.end();
};

RemoteReqControl.postRequest = function (req, url, callback) {
    req.pipe(request.post(url,function (err, response, data) {
        callback(err,data);
    }));
};

RemoteReqControl.getRequest = function (req, url, callback) {
    req.pipe(request.get(url,function (err, response, data) {
        callback(err,data);
    }));
};
