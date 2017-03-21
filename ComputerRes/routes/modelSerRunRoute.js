/**
 * Created by Franklin on 2016/8/5.
 * Route for model-service running info
 */
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');
var childCtrl = require('../control/childControl');
var ModelSerControl = require('../control/modelSerControl');

module.exports = function (app) {
    //查看模型记录信息
    app.route('/modelserrun/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if(msrid == 'all')
            {
                ModelSerRunCtrl.getAll(function (err, msr) {
                    res.render('modelRuns', {
                        // user:req.session.user,
                        msr : msr,
                        blmodelser : true,
                        host : 'localhost'
                    });
                });
            }
            else
            {
                ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    if(msr == null)
                    {
                        return res.end("Err : Msr is NULL ! ");
                    }
                    ModelSerCtrl.getByOID(msr.ms_id, function (err, ms) {
                        if(err)
                        {
                            return res.end('Error : ' + err);
                        }
                        res.render('modelRun', {
                            // user:req.session.user,
                            msr : msr,
                            blmodelser : true,
                            host : 'localhost'
                        });
                    });
                });
            }
        });

    app.route('/modelserrun/json/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if(msrid == 'all')
            {
                ModelSerRunCtrl.getAll(function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    return res.end(JSON.stringify(msr))
                });
            }
            else
            {
                ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    return res.end(JSON.stringify({
                        msr : msr
                    }));
                });
            }
        });

    app.route('/modelserrun/modelser/json/')

    ////////////////////////远程节点

    //远程访问   查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelserrun/json/' + msrid,
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
                    return res.render('modelRun',data);
                });
            });
        });

    //远程访问  查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/all')
        .get(function (req, res, next) {
            // ModelSerCtrl.getChildMSR(req.heads, function (err, childmsr) {
            //     res.render('modelRuns',{
            //         // user:req.session.user,
            //         childmsr : childmsr,
            //         blmodelser_r : true,
            //         host : 'rmt'
            //     });
            // });
            ModelSerControl.getChildInfo(req,'/modelserrun/json/all',function (err,data) {
                res.render('modelRuns',{
                    // user:req.session.user,
                    childmsr : data,
                    blmodelser_r : true,
                    host : 'rmt'
                });
            });
        });

    /////////////////////////JSON
    //远程访问   查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/json/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    res.end(JSON.stringify(error));
                }
                var port = child.port;
                var options = {
                    host: host,
                    port: port,
                    path: '/modelserrun/json/' + msrid,
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
                    // data.user = req.session.user;
                    return res.end(JSON.stringify(data));
                });
            });
        });

    //远程访问  查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/json/all')
        .get(function (req, res, next) {
            ModelSerCtrl.getChildMSR(req.heads, function (err, childmsr) {
                res.end(JSON.stringify({
                    // user:req.session.user,
                    childmsr : childmsr,
                    blmodelser_r : true,
                    host : 'rmt'
                }));
            });
        });
}