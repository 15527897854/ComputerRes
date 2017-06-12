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

module.exports = function(app){
    //展示某个模型调用界面
    app.route('/public/modelser/preparation/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err, ms){
                if(ms.ms_limited == 0){
                    return res.render('customModelSerRunPro', {
                        msid : msid
                    });
                }
                else{
                    if(req.session.user){
                        return res.render('customModelSerRunPro', {
                            msid : msid
                        });
                    }
                    else{
                        return res.render('customLogin');
                    }
                }
            });
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
                                //TODO 判读是否有权限
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
    
    //模型服务信息API
    app.route('/modelser/json/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            if(msid == 'all'){
                return ModelSerCtrl.getLocalModelSer(RouteBase.returnFunction(res, 'error in getting all model servicess!'));
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
            var inputData = req.query.inputData;
            var outputData = req.query.outputData;
            if(ac == 'run'){
                //读取输入文件参数
                var inputData = JSON.parse(req.query.inputdata);
                var outputData = req.query.outputdata;
                
                ModelSerCtrl.getByOID(msid, function(err, ms){
                    if(ms.ms_limited == 1){
                        if(req.session.user){
                            user = {
                                username : req.session.user,
                                pwd : req.session.pwd
                            };
                            ModelSerAccessCtrl.run(msid, inputData, outputData, user, function(err, result){
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
                            return res.end('无权访问此模型!');
                        }
                    }
                    else{
                        var user = {
                            u_name : '[匿名]',
                            u_type : 2
                        };
                        if(req.session.admin){
                            user = {
                                u_name : req.session.admin,
                                u_type : 0
                            };
                        }
                        if(req.session.user){
                            user = {
                                u_name : req.session.user,
                                u_type : 1
                            };
                        }
                        ModelSerCtrl.run(msid, inputData, outputData, user, function(err, msr){
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

    
    //// 权限API 模型运行记录类

    app.route('/modelserrun/json/:msrid')
        .get(function(req, res, next){
            var msrid = req.params.msrid;
            if(msrid == 'all'){
                next();
            }
            else{
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
    //// 公开API 模型运行实例类

    //获取单个模型实例
    app.route('/modelins/json/:guid')
        .get(function(req, res, next){
            var guid = req.params.guid;
            if(guid == 'all')
            {
                next();
            }
            else
            {
                var mis = app.modelInsColl.getByGUID(guid);
                if(mis != -1)
                {
                    mismodel = {
                        state : mis.state,
                        guid : mis.guid
                    };
                    return res.end(JSON.stringify({
                        'res' : 'suc',
                        'mis' : mismodel
                    }));
                }
                else
                {
                    return res.end(JSON.stringify({
                        res : null,
                        mis : null
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
        });
}