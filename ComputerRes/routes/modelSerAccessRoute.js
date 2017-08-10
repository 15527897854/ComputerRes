/**
 * Created by Franklin on 2017/5/25.
 */

var RouteBase = require('./routeBase');
var GeoDataMid = require('../middlewares/geoDataMid');
var GeoDataCtrl = require('../control/geoDataControl');
var ModelSerAccessCtrl = require('../control/modelSerAccessControl');
var ModelSerCtrl = require('../control/modelSerControl');

module.exports = function(app){
    //展示某个模型调用界面
    app.route('/public/modelser/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err, ms){
                if(!ms.ms_limit){
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
                    return res.redirect('/fakedir/modelser/' + path);
                }
                else{
                    res.end('用户名或密码错误!');
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
        });
    
    //模型服务信息API
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
                var inputData = JSON.parse(inputData);
                var outputData = req.query.outputData;
                
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
            else{
                next();
            }
        });

    
    //// 公开API 数据类
    
    //上传数据
    app.route('/fakedir/data')
        .post(function(req, res, next){
            var path = req.query.path;
            var type = req.query.type;
            ModelSerAccessCtrl.authPath(path, function(err, result){
                if(result){
                    if(type == 'stream'){
                        GeoDataMid.postStreamData(req, function(err, gdid){
                            return res.end(JSON.stringify({
                                res : 'suc',
                                gd_id : gdid
                            }));
                        });
                    }
                    else if(type == 'file'){
                        GeoDataMid.postFileData(req, function(err, gdid){
                            return res.end(JSON.stringify({
                                res : 'suc',
                                gd_id : gdid
                            }));
                        });
                    }
                }
            });
        });
}