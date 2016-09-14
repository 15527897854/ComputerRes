/**
 * Created by Franklin on 16-4-9.
 * Remote Request Control
 */
var http = require('http');
var qs = require('querystring');

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
            console.log('---------------------------------------remote req data\n'+req.url+'\n'+data);
            return callback(null, data);
        });
    });

    req.on('error', function(err){
        console.log('Request Error : ' + err.message);
        callback(err);
    });

    //请求内容
    if(content != null)
    {
        req.write(qs.stringify(content));
    }
    req.end();
}