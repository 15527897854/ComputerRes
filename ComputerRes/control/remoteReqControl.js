/**
 * Created by Franklin on 16-4-9.
 * Remote Request Control
 */
var http = require('http');
var fs = require('fs');
var request = require('request-promise');

function RemoteReqControl() {}

module.exports = RemoteReqControl;

//使用request模块，以get方式请求url中的内容
RemoteReqControl.getRequest = function (req, url, callback) {
    req.pipe(request.get(url, function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};

//使用request模块，以post方式请求url中的内容，post的表单在req中
RemoteReqControl.postRequest = function (req, url, callback) {
    req.pipe(request.post(url, function (err, response, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    }));
};

//使用request模块，以post方式请求url，表单在form中
RemoteReqControl.postByServer = function (url, form, callback) {
    var options;
    if(form){
        options = {
            uri:url,
            method:'POST',
            formData:form
        };
    }
    else{
        options = {
            uri:url,
            method:'POST'
        };
    }
    request(options)
        .then(function (res) {
            return callback(null,res);
        })
        .catch(function (err) {
            return callback(err);
        });
};

//使用request模块，以get方式请求url，表单在form中
RemoteReqControl.getByServer = function (url, form, callback) {
    var options = {
        url:url,
        method:'GET',
        qs:form
    };
    request(options)
        .then(function (res) {
            return callback(null,res);
        })
        .catch(function (err) {
            return callback(err);
        });
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

RemoteReqControl.getRequestPipe = function (res, url) {
    request.get(url).pipe(res);
};

RemoteReqControl.ping = function(target, callback){
    request.get('http://' + target , function(error, response, body){
        if (error) {
            return callback({result : 'Err'});
        } else {
            return callback({result : 'OK'});
        }
    });
};
