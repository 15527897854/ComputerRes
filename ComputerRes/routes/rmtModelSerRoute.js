/**
 * Created by Franklin on 2016/9/12.
 */
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');
var childCtrl = require('../control/childControl');
var ModelSerControl = require('../control/modelSerControl');

module.exports = function(app)
{
    //请求转发 上传进度
    app.route('/modelser/rmt/file/:host')
        .get(function (req, res, next) {
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var url = 'http://' + host + ':' + child.port + '/modelser/file/'+req.sessionID;
                remoteReqCtrl.getRequest(req,url,function (err, data) {
                    if(err){
                        return res.end(JSON.stringify(err));
                    }
                    return res.end(data);
                });
            });
        });

    //请求转发 上传文件
    app.route('/modelser/rmt/:host')
        .post(function (req, res, next) {
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var url = 'http://' + host + ':' + child.port + '/modelser/'+req.sessionID;
                // console.log('upload sessionId:'+req.sessionID);
                remoteReqCtrl.postRequest(req,url,function (err, data) {
                    if(err){
                        return res.end(JSON.stringify(err));
                    }
                    return res.end(data);
                });
            });
        });
    
    //查看所有远程结点的ms
    app.route('/modelser/rmt/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                ModelSerControl.getChildInfo(req,'/modelser/json/rmtall',function (err,data) {
                    // console.log('-------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!-------------------------------------------');
                    res.render('modelSers_r',{
                        // user:req.session.user,
                        childms : data,
                        blmodelser_r : true
                    });
                });
            }
        });

    //操控特定结点的特定ms
    app.route('/modelser/rmt/:host/:msid')
        .get(function (req, res, next) {
            var host = req.params.host,
                msid = req.params.msid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                if(msid == 'new'){
                    res.render('modelSerNew',{
                        host: req.params.host,
                        // user:req.session.user,
                        blmodelser_r : true
                    })
                }
                else if(req.query.ac != 'run'){
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/json/' + msid,
                        method: 'GET'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end('Error!');
                        }
                        if(typeof data == 'string'){
                            data = JSON.parse(data);
                        }
                        data.host = host;
                        data.port = port;
                        // data.user = req.session.user;
                        return res.render('modelSer',data);
                    });
                }
                else{
                    //method 1
                    // var url = 'http://' + host + ':' + child.port + '/modelser/json/'+msid + '?ac=run&inputdata=' + req.query.inputdata;
                    // remoteReqCtrl.getRequest(req,url,function (err, data) {
                    //     if(err){
                    //         return res.end('Error!');
                    //     }
                    //     if(typeof data == 'string'){
                    //         data = JSON.parse(data);
                    //     }
                    //     data.host = host;
                    //     return res.end(JSON.stringify(data));
                    // });
                    
                    //method 2
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/json/' + msid + '?ac=run&inputdata=' + req.query.inputdata,
                        method: 'GET'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end('Error!');
                        }
                        if(typeof data == 'string'){
                            data = JSON.parse(data);
                        }
                        data.host = host;
                        return res.end(JSON.stringify(data));
                    });
                }
            });
        })
        .put(function (req, res) {
            var msid = req.params.msid;
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                //bug  有时候报错。。。
                //停止服务
                if(req.query.ac == "stop")
                {
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/' + msid + '?ac=stop',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
                //开启服务
                else if(req.query.ac == "start")
                {
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/' + msid + '?ac=start',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
            })
        })
        .delete(function (req, res) {
            var msid = req.params.msid;
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, chile) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelser/' + msid,
                    method: 'DELETE'
                };
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in remote request"
                        }));
                    }
                    return res.end(data);
                });
            });
        });

    //获取某个模型服务的输入输出数据声明
    app.route('/modelser/rmt/inputdata/:host/:msid')
        .get(function (req, res, next) {
            var host = req.params.host,
                msid = req.params.msid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelser/inputdata/json/' + msid,
                    method: 'GET'
                };
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end('Error!');
                    }
                    if(typeof data == 'string'){
                        data = JSON.parse(data);
                    }
                    data.host = host;
                    data.port = port;
                    // data.user = req.session.user;
                    return res.end(JSON.stringify(data));
                });
            });
        });


    /////////////////////////////////////JSON

    //特定结点的特定ms进入准备调用页面
    app.route('/modelser/rmt/preparation/:host/:msid')
        .get(function (req, res, next) {
            var host = req.params.host,
                msid = req.params.msid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelser/preparation/json/' + msid,
                    method: 'GET'
                };
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end('Error!');
                    }
                    if(typeof data == 'string'){
                        data = JSON.parse(data);
                    }
                    data.host = host;
                    data.port = port;
                    // data.user = req.session.user;
                    return res.render('modelRunPro',data);
                });
            });
        });

    //查看所有远程结点的ms的json
    app.route('/modelser/rmt/json/all')
        .get(function (req, res, next) {
            ModelSerCtrl.getChildModelSer(null, function (err, childms) {
                res.end(JSON.stringify({
                    // user:req.session.user,
                    childms : childms,
                    blmodelser_r : true
                }));
            });
        });

    //操控特定结点的特定ms   返回JSON
    app.route('/modelser/rmt/json/:host/:msid')
        .get(function (req, res, next) {
            var host = req.params.host,
                msid = req.params.msid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                if(req.query.ac != 'run'){
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/json/' + msid,
                        method: 'GET'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end('Error!');
                        }
                        if(typeof data == 'string'){
                            data = JSON.parse(data);
                        }
                        data.host = host;
                        data.port = port;
                        // data.user = req.session.user;
                        return res.end(JSON.stringify(data));
                    });
                }
                else{
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/json/' + msid + '?ac=run&inputdata=' + req.query.inputdata,
                        method: 'GET'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end('Error!');
                        }
                        if(typeof data == 'string'){
                            data = JSON.parse(data);
                        }
                        console.log(data+'\n'+typeof data+'\n'+JSON.stringify(data));
                        data.host = host;
                        return res.end(JSON.stringify(data));
                    });
                }
            });
        })
        .put(function (req, res) {
            console.log('------------'+req.url);
            var msid = req.params.msid;
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                //bug  有时候报错。。。
                //停止服务
                if(req.query.ac == "stop")
                {
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/' + msid + '?ac=stop',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
                //开启服务
                else if(req.query.ac == "start")
                {
                    var options = {
                        host: host,
                        port: port,
                        path: '/modelser/' + msid + '?ac=start',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
            })
        })
        .delete(function (req, res) {
            var msid = req.params.msid;
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelser/' + msid,
                    method: 'DELETE'
                };
                console.log('________________________del ms');
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in remote request"
                        }));
                    }
                    return res.end(data);
                });
            });
        });

    //特定结点的特定ms进入准备调用页面     返回JSON
    app.route('/modelser/rmt/preparation/:host/:msid')
        .get(function (req, res, next) {
            var host = req.params.host,
                msid = req.params.msid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    return res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelser/preparation/json/' + msid,
                    method: 'GET'
                };
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end('Error!');
                    }
                    if(typeof data == 'string'){
                        data = JSON.parse(data);
                    }
                    data.host = host;
                    data.port = port;
                    // data.user = req.session.user;
                    return res.end(JSON.stringify(data));
                });
            });
        });
}