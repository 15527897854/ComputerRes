/**
 * Created by Franklin on 2017/5/25.
 */

var RouteBase = require('./routeBase');
var GeoDataMid = require('../middlewares/geoDataMid');
var GeoDataCtrl = require('../control/geoDataControl');
var ModelSerAccessCtrl = require('../control/modelSerAccessControl');
var ModelSerCtrl = require('../control/modelSerControl');
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelInsCtrl = require('../control/ModelInsCtrl');
var TestifyCtrl = require('../control/testifyCtrl');
var cp = require('../utils/child-process'); 
var languageCtrl = require('../control/languagesCtrl');
var utils = require('../utils/commonMethod');
var fs = require('fs');

module.exports = function(app){
    //客户端界面
    app.route('/public/index')
        .get(function(req, res, next){
            return res.render('customIndex');
        });

    //模型信息
    app.route('/public/info')
        .get(function(req, res, next){
            return res.render('customInfo');
        });

    //模型服务信息界面
    app.route('/public/modelser/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            if(msid == 'all'){
                return res.render('customModelSers');
            }
            res.render('customModelSerDetail', {
                msid : msid
            });
        });
    //展示某个模型调用界面
    app.route('/public/modelser/preparation/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            return res.render('customModelSerRunPro', {
                msid : msid
            });
            // ModelSerCtrl.getByOID(msid, function(err, ms){
            //     if(ms == null){
            //         res.end('Demo has been deleted!');
            //     }
            //     if(ms.ms_limited != 1){
            //         return res.render('customModelSerRunPro', {
            //             msid : msid
            //         });
            //     }
            //     else{
            //         if(req.session.user){
            //             return res.render('customModelSerRunPro', {
            //                 msid : msid
            //             });
            //         }
            //         else{
            //             return res.render('customLogin');
            //         }
            //     }
            // });
        })
        .post(function(req, res, next){
            var msid = req.params.msid;
            ModelSerAccessCtrl.auth(msid, req.body.username, req.body.pwd, function(err, result){
                if(err){
                    return res.end('Error : ' + JSON.stringify(err));
                }
                if(result){
                    req.session.user = req.body.username;
                    req.session.pwd = req.body.pwd;
                    return res.redirect('/public/modelser/preparation/' + msid);
                }
                else{
                    res.end('User name or password error !');
                }
            });
        });
    
    //获取模型服务记录界面
    app.route('/public/modelserrun/:msrid')
        .get(function(req, res, next){
            var msrid = req.params.msrid;
            ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    if(msr == null)
                    {
                        return res.end("Err : Msr is NULL ! ");
                    }
                    ModelSerCtrl.getByOID(msr.ms_id, function(err, ms){
                        if(err)
                        {
                            return res.end('Error : ' + err);
                        }
                        if(ms.ms_limited == 1){
                            if(req.session.user){
                                ModelSerAccessCtrl.authMsrID(msrid, req.session.user, req.session.pwd, function(err, result){
                                    if(err){
                                        return res.end('Error : ' + err);
                                    }
                                    if(result){
                                        return res.render('customModelSerRun', {
                                            msr : msr
                                        });
                                    }
                                });
                            }
                            else{
                                return res.render('customLogin');
                            }
                        }
                        else{
                            return res.render('customModelSerRun', {
                                msr : msr
                            });
                        }
                    });
                });
        })
        .post(function(req, res, next){
            var msrid = req.params.msrid;
            ModelSerAccessCtrl.authMsrID(msrid, req.body.username, req.body.pwd, function(err, result){
                if(err){
                    return res.end('Error : ' + JSON.stringify(err));
                }
                if(result){
                    req.session.user = req.body.username;
                    req.session.pwd = req.body.pwd;
                    return res.redirect('/public/modelserrun/' + msrid);
                }
                else{
                    res.end('User name or password error !');
                }
            });
        });
    
    //获取全部可用模型

    //// REST API 
    //// 公开API 模型服务类

    //查询模型服务
    app.route('/modelser')
        .get(function(req, res, next){
            if(req.query.ac = 'search'){
                if(req.query.mid){
                    ModelSerCtrl.getByMID(req.query.mid, RouteBase.returnFunction(res, 'error in searching model services!'));
                }
                else if(req.query.pid){
                    ModelSerCtrl.getByPIDforPortal(req.query.pid, RouteBase.returnFunction(res, 'error in searching model services!'));
                }
            }
        });
    //模型服务信息API
    app.route('/modelser/json/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            if(msid == 'all'){
                if(req.query.type == 'admin'){
                    next();
                }
                else{
                    if(req.query.start || req.query.count){
                        var start = 0;
                        var count = 0;
                        if(req.query.start){
                            start = req.query.start;
                        }
                        if(req.query.count){
                            count = req.query.count;
                        }
                        return ModelSerCtrl.getLocalModelSerByPage(start, count, RouteBase.returnFunction(res, 'error in getting all model servicess!'));
                    }
                    else{
                        return ModelSerCtrl.getLocalModelSer(RouteBase.returnFunction(res, 'error in getting all model servicess!'));
                    }
                }
            }
            else{
                return ModelSerCtrl.getByOID(msid, RouteBase.returnFunction(res, 'error in getting model servicess!'));
            }
        });
    
    //模型输入信息API
    app.route('/modelser/inputdata/json/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            ModelSerCtrl.getInputData(msid, RouteBase.returnFunction(res, 'error in getting input data!'));
        });
    
    //// 权限API 模型服务类

    //运行模型服务
    app.route('/modelser/:msid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var msid = req.params.msid;
            var inputData = req.query.inputdata;
            var outputData = req.query.outputdata;
            if(ac == 'run'){
                //读取输入文件参数
                inputData = JSON.parse(inputData);
                ModelSerCtrl.getByOID(msid, function(err, ms){
                    if(err){
                        return res.end(
                            JSON.stringify({
                                res : 'fail',
                                message : err
                            })
                        );
                    }
                    if(ms == null){
                        return res.end(
                            JSON.stringify({
                                res : 'fail',
                                message : 'No model service'
                            })
                        );
                    }
                    var user = {
                        u_name : '[匿名]',
                        u_ip : utils.getIP(req),
                        u_type : 2
                    };
                    if(req.session.admin){
                        user = {
                            u_name : req.session.admin,
                            u_type : 0
                        };
                    }
                    if(ms.ms_limited == 1){
                        if(req.query.auth){
                            var auth = req.query.auth;
                            ModelSerAccessCtrl.run(ms.ms_model.p_id, inputData, outputData, user, auth, function(err, result){
                                if(err){
                                    return res.end(JSON.stringify(err));
                                }
                                if(result.auth){
                                    return res.end(JSON.stringify({
                                        res : 'suc',
                                        msr_id : result.msr._id
                                    }));
                                }
                                else{ 
                                    return res.end(JSON.stringify({
                                        res : 'fail',
                                        message : result.message
                                    }));
                                }
                            });
                        }
                        else{
                            return res.end(JSON.stringify({
                                res : 'fail',
                                message : 'No right to invoke this model service!'
                            }));
                        }
                    }
                    else{
                        ModelSerCtrl.run(msid, inputData, outputData, user, function(err, msr){
                            if(err){
                                return res.end(JSON.stringify({
                                    res : 'err',
                                    message : err.message
                                }));
                            }
                            return res.end(JSON.stringify({
                                res : 'suc',
                                msr_id : msr._id
                            }));
                        });
                    }
                });
            }
            else{
                next();
            }
        });
    //get 所有测试数据
    app.route('/modelser/testify/:msid')
        .get(function (req, res) {
            var msid = req.params.msid;
            //暂时放到这里，用来生成已经部署过的模型的测试数据
            //以后就不用加这一句，生成测试数据是在用户上传模型时就生成了
            ModelSerCtrl.addDefaultTestify(msid.toString(),function () {
                TestifyCtrl.getTestify(msid,function (data) {
                    res.end(data);
                });
            });
        })
    
    //// 权限API 模型运行记录类

    app.route('/modelserrun/json/:msrid')
        .get(function(req, res, next){
            var msrid = req.params.msrid;
            if(msrid == 'all'){
                next();
            }
            else{
                ModelSerRunCtrl.getByOID(msrid, RouteBase.returnFunction(res, 'Error in getting MSR!'));
            }
            
        });
    //// 公开API 模型运行实例类

    //获取单个模型实例
    app.route('/modelins/json/:guid')
        .get(function (req, res, next) {
            var guid = req.params.guid;
            if(guid == 'all')
            {
                next();
            }
            else
            {
                var mis = app.modelInsColl.getByGUIDCopy(guid);
                if(mis != -1)
                {
                    return res.end(JSON.stringify({
                        result : "suc",
                        data : mis
                    }));
                }
                else
                {
                    return res.end(JSON.stringify({
                        result : "suc",
                        data : null
                    }));
                }
            }
        });
    //// 公开API 数据类

    //上传数据
    app.route('/geodata')
        .post(function(req, res, next){
            var type = req.query.type;
            if(type == 'file'){
                GeoDataMid.postFileData(req, function(err, gdid){
                    if(err){
                        return res.end(JSON.stringify(
                            {
                                res : 'err',
                                message : JSON.stringify(err)
                            }));
                    }
                    return res.end(JSON.stringify(
                        {
                            res : 'suc',
                            gd_id : gdid
                        }));
                });
            }
            else if(type == 'stream'){
                GeoDataMid.postStreamData(req, function(err, gdid){
                    if(err){
                        return res.end(JSON.stringify(
                            {
                                res : 'err',
                                message : JSON.stringify(err)
                            }));
                    }
                    return res.end(JSON.stringify(
                        {
                            res : 'suc',
                            gd_id : gdid
                        }));
                });
            }
            else if(type == 'url'){

            }
        });

    //下载数据
    app.route('/geodata/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            if(gdid == 'all'){
                next();
            }
            else{
                var ac = req.query.ac;
                if(ac == 'visualize'){
                    res.render('visualization',{
                        gdid : gdid
                    });
                }
                else{
                    GeoDataCtrl.getByKey(gdid, function (err, gd) {
                        if(err)
                        {
                            return res.end('error');
                        }
                        if(gd == null)
                        {
                            return res.end('No Data!');
                        }
                        ModelSerRunCtrl.IsOutputData2BDestroyed(gd.gd_id, function(err, destroyed){
                            if(err){
                                return res.end('error');
                            }
                            var filename = gd.gd_id + '.xml';
                            if(gd.gd_type == 'FILE')
                            {
                                fs.access(__dirname + '/../geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                                    if (err) {
                                        GeoDataCtrl.delete(gdid, function (err, reslut) {
                                            return res.end('Data file do not exist!')
                                        });
                                    }
                                    else {
                                        fs.readFile(__dirname + '/../geo_data/' + gd.gd_value, function (err, data) {
                                            if(err)
                                            {
                                                return res.end('error');
                                            }
                                            res.set({
                                                'Content-Type': 'file/xml',
                                                'Content-Length': data.length });
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            res.end(data);
                                            //销毁数据
                                            if(destroyed){
                                                GeoDataCtrl.delete(gd.gd_id, function(err, result){});
                                            }
                                        });
                                    }
                                });
                            }
                            else if(gd.gd_type == 'STREAM')
                            {
                                res.set({
                                    'Content-Type': 'file/xml',
                                    'Content-Length': gd.gd_value.length });
                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                res.end(gd.gd_value);
                                //销毁数据
                                if(destroyed){
                                    GeoDataCtrl.delete(gd.gd_id, function(err, result){});
                                }
                            }
                        });
                    });
                }
            }
        });
    
    // 接收到数据坐标后主动下载数据
    app.route('/integration/onReceivedDataPosition')
        .post(function (req, res, next) {
            // var centerHost = ;
            // var centerPort = ;
            var dataLocation = req.body;
            // 两种选择：应该选择第二种，第一种可以会断开连接
            // 数据下载完成时在 response，数据下载完成后发送请求更新数据准备状态为 RECEIVED
            // 立即回复，收到回复后数据状态将更新为 PENDING

            // 收到数据坐标，开始请求数据
            GeoDataCtrl.onReceivedDataPosition(dataLocation);

            res.end('');
        });

    //数据快照
    app.route('/geodata/snapshot/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            cp.newVisualization(gdid,null,function (err, data) {
                if(err){
                    return res.end(JSON.stringify({err:err}));
                }
                else{
                    return res.end(data);
                }
            });
        });

    //// 公开API 系统设置类
    //获取语言配置
    app.route('/languages')
        .get(function(req, res, next){
            var type = req.query.type;
            if(type == 'currect'){
                var language = global.configLanguage;
                if(language == undefined){
                    return res.end(JSON.stringify({
                        result : 'fail',
                        message : 'language configuration is null!'
                    }));
                }
                return res.end(JSON.stringify({
                    result : 'suc',
                    data : language
                }));
            }
            else{
                languageCtrl.getAllLanguageConfig(RouteBase.returnFunction(res, 'Error in getting All language configs'));
            }
        })
        .put(function(req, res, next){
            var language = req.query.language;
            languageCtrl.setCurrentSetting(language, RouteBase.returnFunction(res, 'Error in setting language config'));
        });
}