/**
 * Created by Franklin on 2016/8/5.
 * Route for model-service running info
 */
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');

var RouteBase = require('./routeBase');

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
                ModelSerRunCtrl.getAll(RouteBase.returnFunction(res, 'Error in getting all model-service running json'));
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
    
    app.route('/modelserrun/testify/:msrid')
        .post(function (req, res, next) {
            var tag = req.body.testifyTag;
            var detail = req.body.testifyDetail;
            var msrid= req.params.msrid;
            var testifyData = {
                tag:tag,
                detail:detail,
                path:msrid
            };
            ModelSerCtrl.addTestify(msrid,testifyData,function (err, data) {
                if(err){
                    return res.end(JSON.stringify({suc:false}));
                }
                res.end(JSON.stringify(data));
            });
        });

    ////////////////////////远程节点

    //查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/json/all')
        .get(function (req, res, next) {
            ModelSerRunCtrl.getAllRmtModelSerRun(RouteBase.returnFunction(res, "error in get all rmt model service runs"));
        });

    //查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getRmtModelSerRun(host, msrid, function (err, data) {
                if(err)
                {
                    return res.end('error : ' + JSON.stringify(err));
                }
                return res.render('modelRun_r', {
                    host : host,
                    msid : data.msr.msr_ms._id,
                    msr : data.msr
                });
            });
        });

    //远程访问  查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/all')
        .get(function (req, res, next) {
            res.render('modelRuns_r', {
                blmodelser_r : true
            });
        });


    //远程访问   查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/json/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getRmtModelSerRun(host, msrid, function (err, data) {
                if(err)
                {
                    return res.end('error : ' + JSON.stringify(err));
                }
                return res.end(JSON.stringify({
                    host : host,
                    msr : data.msr
                }));
            });
        });
};