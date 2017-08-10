/**
 * Created by Franklin on 2016/8/5.
 * Route for model-service running info
 */
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var TestifyCtrl = require('../control/testifyCtrl');

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
                var type = req.query.type;
                var msid = req.query.msid;
                var days = req.query.days;
                if(type == 'statistic'){
                    if(!days){
                        days = 7;
                    }
                    if(req.query.msid){
                        ModelSerRunCtrl.getStatisticInfoRecent(req.query.msid, days, RouteBase.returnFunction(res, 'Error in getting model-service running records statistic info'));
                    }
                    else{
                        ModelSerRunCtrl.getStatisticInfoRecent(null, days, RouteBase.returnFunction(res, 'Error in getting model-service running records statistic info'));
                    }
                }
                else if(type == 'piestatistic'){
                    ModelSerRunCtrl.getTimesStatisticInfo(RouteBase.returnFunction(res, 'Error in getting model-service running records pie statistic info'));
                }
                else{
                    if(req.query.msid){
                        ModelSerRunCtrl.getByMSID(req.query.msid, RouteBase.returnFunction(res, 'Error in getting model-service running records json by msid'))
                    }
                    else{
                        ModelSerRunCtrl.getAll(RouteBase.returnFunction(res, 'Error in getting all model-service running records json'));
                    }
                }
            }
            else
            {
                ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end(JSON.stringify({
                            result : 'err',
                            message : err
                        }));
                    }
                    return res.end(JSON.stringify({
                        result : 'suc',
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
            TestifyCtrl.addTestify(msrid,testifyData,function (err, data) {
                if(err){
                    return res.end(JSON.stringify({suc:false}));
                }
                res.end(JSON.stringify(data));
            });
        });

    ////////////////////////远程节点

    // 查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/json/:host')
        .get(function (req, res, next) {
            var host = req.params.host;
            if(host == 'all'){
                return ModelSerRunCtrl.getAllRmtModelSerRun(RouteBase.returnFunction(res, "error in getting all rmt model service runs"));
            }
            else{
                var type = req.query.type;
                var msid = req.query.msid;
                if(type == 'statistic'){
                    if(msid){
                        return ModelSerRunCtrl.getRmtModelSerRunsStatisticByHostAndMsid(host, msid, RouteBase.returnFunction(res, "error in getting model service records statistic info"));
                    }
                    return ModelSerRunCtrl.getRmtModelSerRunsStatisticByHost(host, RouteBase.returnFunction(res, "error in getting rmt model service runs by host"));
                }
                else{
                    return ModelSerRunCtrl.getRmtModelSerRunsByHost(host, RouteBase.returnFunction(res, "error in getting rmt model service runs by host"));
                }
            }
        });

    // 查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/json/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            if(msrid == 'all'){
                var type = req.query.type;
                var msid = req.query.msid;
                var days = req.query.days;
                if(msid){
                    if(type == 'statistic'){
                        ModelSerRunCtrl.getRmtModelSerRunsStatisticByHostAndMsid(host, msid, days, RouteBase.returnFunction(res, 'Error in getting model service running statistic info by host and msid!'));
                    }
                    else{
                        ModelSerRunCtrl.getRmtModelSerRunsByHostAndMsid(host, msid, RouteBase.returnFunction(res, 'Error in getting model service running info by host and msid!'));
                    }
                }
                else{
                    if(type == 'statistic'){
                        ModelSerRunCtrl.getRmtModelSerRunsStatisticByHost(host, days, RouteBase.returnFunction(res, 'Error in getting model service running statistic info!'));
                    }
                    else{
                        ModelSerRunCtrl.getRmtModelSerRunsByHost(host, RouteBase.returnFunction(res, 'Error in getting model service running statistic info!'));
                    }
                }
            }
            else{
                ModelSerRunCtrl.getRmtModelSerRun(host, msrid, RouteBase.returnFunction(res, 'Error in getting rmt model service run'));
            }
        });

    // 查看其它单个结点的单条模型运行记录
    app.route('/modelserrun/rmt/:host/:msrid')
        .get(function (req, res, next) {
            var host = req.params.host;
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getRmtModelSerRun(host, msrid, function(err, msr){
                if(err){
                    return res.end("Error in getting rmt Model Service Record!");
                }
                return res.render('modelRun_r', {
                    host : host,
                    msrid : msrid,
                    msid : msr.ms_id,
                    msr : msr
                });
            });
        });

    // 查看其它所有结点的所有模型运行记录
    app.route('/modelserrun/rmt/all')
        .get(function (req, res, next) {
            res.render('modelRuns_r', {
                blmodelser_r : true
            });
        });


    
};