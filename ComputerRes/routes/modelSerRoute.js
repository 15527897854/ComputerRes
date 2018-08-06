/**
 * Created by Franklin on 16-3-27.
 * Route for model-service
 */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var formidable = require('formidable');
var uuid = require('node-uuid');
var unzip = require('unzip');

var NoticeCtrl = require('../control/noticeCtrl');
var setting = require('../setting');
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCtrl = require('../control/modelSerControl');
var ModelIns = require('../model/modelInstance');

var ModelSerMid = require('../middlewares/modelserMid');
var RouteBase = require('./routeBase');

var remoteModelSerRoute = require('./rmtModelSerRoute');
var SWECtrl = require('../control/softwareEnCtrl');
var HWECtrl = require('../control/hardwareEnCtrl');
var testifyCtrl = require('../control/testifyCtrl');
var NoticeCtrl = require('../control/noticeCtrl');

module.exports = function(app)
{
    app.route('/modelser')
        //新增模型服务
        .post(function(req, res, next) {
            ModelSerMid.NewModelSer(req, function(err, rst){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : err
                    }));
                }
                if(rst.status == 0){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : rst
                    }));
                }
                if(!rst.isValidate){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : rst
                    }));
                }
                res.end(JSON.stringify({
                    result : 'suc',
                    data : rst.data
                }));
            });
        });

    //远程上传ms    sessionID用于保存progress
    app.route('/modelser/:sessionid')
        .post(function(req, res, next) {
            ModelSerMid.NewRmtModelSer(req, function (err, rst) {
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : err
                    }));
                }
                if(rst.status == 0){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : rst
                    }));
                }
                if(!rst.isValidate){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : rst
                    }));
                }
                res.end(JSON.stringify({
                    result : 'suc',
                    data : rst.data
                }));
            });
            //var sessionID = req.params.sessionID;
            //var form = new formidable.IncomingForm();
            //form.encoding = 'utf-8';    	                //设置编辑
            //form.uploadDir = setting.modelpath + 'tmp/';	//设置上传目录
            //form.keepExtensions = true;                     //保留后缀
            //form.maxFieldsSize = 500 * 1024 * 1024;         //文件大小
            //
            //fs.exists(form.uploadDir,function (exists) {
            //    if(!exists){
            //        fs.mkdir(form.uploadDir);
            //    }
            //    //解析请求
            //    form.parse(req, function (err, fields, files) {
            //        if(err) {
            //            return res.end(JSON.stringify(err));
            //        }
            //        // 验证
            //        var config = {
            //            host : "",
            //            port : "",
            //            start : "",
            //            type : "",
            //            mdl : "",
            //            testdata : "",
            //            engine : ""
            //        };
            //        parseConfig(files.file_model.path,config,function (config,fileStruct) {
            //            if( !config.host || !config.port || !config.start || !config.mdl){
            //                //config结构不对
            //                //删除文件
            //                fs.unlinkSync(files.file_model.path);
            //                return res.end(JSON.stringify({
            //                    'res':'err 1',
            //                    'des':'长传的压缩包不包含config文件或config文件结构不正确！'
            //                }));
            //            }
            //            else if(!fileStruct.model || !fileStruct.mdl || !fileStruct.start){
            //                //文件结构不对
            //                //删除文件
            //                fs.unlinkSync(files.file_model.path);
            //                return res.end(JSON.stringify({
            //                    'res':'err 2',
            //                    'des':'上传文件结构不正确！'
            //                }));
            //            }
            //            //通过验证
            //            var date = new Date();
            //            var img = null;
            //            if(files.ms_img.size != 0)
            //            {
            //                img = uuid.v1() + path.extname(files.ms_img.path);
            //                fs.renameSync(files.ms_img.path, setting.modelpath + '../public/images/modelImg/' + img);
            //            }
            //            else
            //            {
            //                fs.unlinkSync(files.ms_img.path);
            //            }
            //            //产生新的OID
            //            var oid = new ObjectId();
            //
            //            //生成新的纪录
            //            var newmodelser = {
            //                _id : oid,
            //                ms_model : {
            //                    m_name:fields.m_name,
            //                    m_type:fields.m_type,
            //                    m_url:fields.m_url
            //                },
            //                mv_num:fields.mv_num,
            //                ms_des:fields.ms_des,
            //                ms_update:date.toLocaleString(),
            //                ms_platform:setting.platform,
            //                ms_path:oid.toString() + '/',
            //                ms_img:img,
            //                ms_xml:fields.ms_xml,
            //                ms_status:0,
            //                ms_user:{
            //                    u_name:fields.u_name,
            //                    u_email:fields.u_email
            //                }
            //            };
            //            //解压路径
            //            var model_path = setting.modelpath + oid.toString() + '/';
            //
            //            //解压
            //            fs.createReadStream(files.file_model.path).pipe(unzip.Extract({path: model_path}));
            //
            //            //删除文件
            //            fs.unlinkSync(files.file_model.path);
            //
            //            //添加纪录
            //            ModelSerCtrl.addNewModelSer(newmodelser, function (err, item) {
            //                if(err)
            //                {
            //                    return res.end('Error : ' + JSON.stringify(err));
            //                }
            //                res.end(JSON.stringify({
            //                    res : 'suc',
            //                    oid : oid.toString()
            //                }));
            //            });
            //        });
            //    });
            //
            //    global.fileupload.add({
            //        sessionId : sessionID,
            //        process : 0
            //    });
            //    //上传过程中
            //    form.on('progress', function (bytesReceived, bytesExpected)
            //    {
            //        var percent = Math.round(bytesReceived/bytesExpected * 100);
            //        var newItem = {
            //            sessionId : sessionID,
            //            value : percent
            //        };
            //        global.fileupload.update(newItem);
            //    });
            //});
        });

    //获取上传文件百分比
    app.route('/modelser/file')
        .get(function (req, res, next) {
            console.log('sessionId:'+req.sessionID);
            console.log(global.fileupload.get(req.sessionID));
            var client = global.fileupload.get(req.sessionID);
            if(client != -1)
            {
                if(client.value == 100)
                {
                    global.fileupload.remove(client.sessionId);
                }
                res.end(JSON.stringify({
                    value:client.value
                }));
            }
            else
            {
                res.end(JSON.stringify({
                    value:100
                }));
            }
        });

    //远程获取progress
    app.route('/modelser/file/:sessionid')
        .get(function (req, res, next) {
            // console.log('sessionId:'+req.sessionID);
            var sessionId = req.params.sessionid;
            var client = global.fileupload.get(sessionId);
            console.log(JSON.stringify(client));
            if(client.value == 100)
            {
                global.fileupload.remove(client.sessionId);
            }
            res.end(JSON.stringify({
                value:client.value
            }));
        });

    ///////////云服务
    app.route('/modelser/cloud')
        .get(function(req, res, next){
            res.render('cloudModelSers', {
                blmodelser : true
            });
        });

    app.route('/modelser/cloud/modelsers')
        .get(function(req, res, next){
            ModelSerCtrl.getCloudModelsers(RouteBase.returnFunction(res, 'error in getting cloud modelsers!'));
        });

    app.route('/modelser/cloud/json/modelsers')
        .get(function(req, res, next){
            var cid = req.query.cid;
            var page = 1;
            if(req.query.page){
                page = parseInt(req.query.page);
            }
            ModelSerCtrl.getCloudModelByCategoryId(cid, page, RouteBase.returnFunction(res, 'error in getting cloud modelsers!'));
        });

    app.route('/modelser/cloud/category')
        .get(function(req, res, next){
            ModelSerCtrl.getCloudModelserCategory(RouteBase.returnFunction(res, 'error in getting cloud modelser category!'));
        });

    app.route('/modelser/cloud/json/packages')
        .get(function(req, res, next){
            var mid = req.query.mid;
            ModelSerCtrl.getCloudModelPackageByMid(mid, RouteBase.returnFunction(res, 'error in getting cloud modelser packages!'));
        });

    app.route('/modelser/cloud/packages/:pid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var fields = req.query.fields;
            var pid = req.params.pid;
            if(ac == 'download'){
                return ModelSerMid.getCloudPackage(fields, pid, RouteBase.returnFunction(res, 'error in down a model service!'));
            }
        });

    app.route('/modelser/uploader/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            return res.render('modelSerUploader', {
                msid : msid
            });
        });

    //展示某个模型服务
    app.route('/modelser/:msid')
        //获取模型
        .get(function(req,res,next){
            var msid = req.params.msid;
            //获取全部模型页面
            if(msid == 'all')
            {
                //查询本地数据库全部数据
                ModelSerCtrl.getLocalModelSer(function(err, data)
                {
                    if(err)
                    {
                        return res.end('Error!');
                    }
                    return res.render('modelSers',
                        {
                            // user:req.session.user,
                            data:data,
                            blmodelser : true,
                            host : 'localhost'
                        });
                });
            }
            //上传模型页面
            else if(msid == 'new')
            {
                //新增模型服务页面
                res.render('modelSerNew',
                    {
                        // user:req.session.user,
                        blmodelser : true,
                        host: 'localhost'
                    });
            }
            else
            {
                //上传模型服务
                if(req.query.ac == 'upload')
                {
                    var mid = req.query.mid;
                    var pkg_name = req.query.pkg_name;
                    var pkg_version = req.query.pkg_version;
                    var pkg_des = req.query.pkg_des;
                    var m_upload = req.query.mupload;
                    ModelSerCtrl.uploadPackage(msid, mid, pkg_name, pkg_version, pkg_des, m_upload, null, null, RouteBase.returnFunction(res, 'err in upload model package'));
                }
                //单个模型的详情页面
                else
                {
                    ModelSerCtrl.getByOID(msid, function(err, ms)
                    {
                        if(err)
                        {
                            return res.send({
                                "res":"Error",
                                "mess":"Error in get modelSer"
                            });
                        }
                        ModelSerRunCtrl.getByMSID(msid, function (err, msrs) {
                            if(err)
                            {
                                return res.send({
                                    "res":"Error",
                                    "mess":"Error in get modelSerRun"
                                });
                            }
                            return res.render('modelSer',{
                                // user:req.session.user,
                                modelSer : ms,
                                msrs : msrs,
                                blmodelser : true,
                                host : 'localhost',
                                port : setting.port
                            });
                        });
                    });
                }
            }
        })
        //更新模型
        .put(function (req, res, next) {
            var msid = req.params.msid;
            //停止服务
            if(req.query.ac == "stop")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchStop(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!'));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":JSON.stringify(err)
                            }));
                        }
                        if(ms.ms_status == 0)
                        {
                            return res.end(JSON.stringify({
                                "res":"Stopped"
                            }));
                        }
                        else
                        {
                            ms.ms_status = 0;
                            ModelSerCtrl.update(ms, function (err, data){
                                if(err) {
                                    return res.end(JSON.stringify({
                                        "res":"Error",
                                        "mess":JSON.stringify(err)
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    "res":"Success"
                                }));
                            })
                        }
                    });
                }
            }
            //开启服务
            else if(req.query.ac == "start")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchStart(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!'));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess": JSON.stringify(err)
                            }));
                        }
                        if(ms.ms_status == 1)
                        {
                            return res.end(JSON.stringify({
                                "res":"Started"
                            }));
                        }
                        else
                        {
                            ms.ms_status = 1;
                            ModelSerCtrl.update(ms, function (err, data) {
                                if(err) {
                                    return res.end(JSON.stringify({
                                        "res":"Error",
                                        "mess":JSON.stringify(err)
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    "res":"Success"
                                }));
                            })
                        }
                    });
                }
            }
            //锁定服务
            else if(req.query.ac == "lock")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchLock(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!'));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                message : JSON.stringify(err)
                            }));
                        }
                        if(ms.ms_limited == 1)
                        {
                            return res.end(JSON.stringify({
                                result : "locked"
                            }));
                        }
                        else
                        {
                            ms.ms_limited = 1;
                            ModelSerCtrl.update(ms, function (err, data) {
                                if(err) {
                                    return res.end(JSON.stringify({
                                        result : "err",
                                        message : err
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    result : "suc",
                                    data : data
                                }));
                            })
                        }
                    });
                }
            }
            //解锁服务
            else if(req.query.ac == "unlock")
            {
                if(msid == 'all'){
                    msids = req.query.msids;
                    ModelSerCtrl.batchUnlock(msids, RouteBase.returnFunction(res, 'Error in batch starting model services!'));
                }
                else{
                    ModelSerCtrl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                result : "err",
                                message : JSON.stringify(err)
                            }));
                        }
                        if(ms.ms_limited == 0)
                        {
                            return res.end(JSON.stringify({
                                result : "unlocked"
                            }));
                        }
                        else
                        {
                            ms.ms_limited = 0;
                            ModelSerCtrl.update(ms, function (err, data) {
                                if(err) {
                                    return res.end(JSON.stringify({
                                        result : "err",
                                        message : err
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    result : "suc",
                                    data : data
                                }));
                            })
                        }
                    });
                }
            }
            //登记服务
            else if(req.query.ac == 'register'){
                ModelSerCtrl.RegisterModelService(msid, RouteBase.returnFunction(res, 'Error in registering model service'));
            }
            //退登服务
            else if(req.query.ac == 'unregister'){
                ModelSerCtrl.UnregisterModelService(msid, RouteBase.returnFunction(res, 'Error in registering model service'));
            }
        })
        //删除模型服务
        .delete(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.deleteToTrush(msid, function (err, item) {
                if(err)
                {
                    return res.end(JSON.stringify({
                        res:'err',
                        err:err
                    }));
                }
                // console.log('_______________del ms_____________');
                // 存储通知消息
                var noticeData = {
                    time:new Date(),
                    title:item.ms_model.m_name + '已删除！',
                    detail:'',
                    type:'del-ms',
                    hasRead:false
                };
                NoticeCtrl.save(noticeData,function (err, data) {
                    if(err)
                    {
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in add notice"
                        }));
                    }
                    return res.end(JSON.stringify({
                        res:'suc'
                    }));
                });
            });
        });

    //模型运行准备界面
    app.route('/modelser/preparation/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err, ms)
            {
                if(err)
                {
                    return res.end('Error in get modelService model : ' + JSON.stringify(err));
                }
                if(ms == null)
                {
                    return res.end("can not find model service ! ");
                }
                ModelSerCtrl.getInputData(ms._id, function (err, data) {
                    if(err)
                    {
                        return res.end('Error in get input data : ' + JSON.stringify(err))
                    }
                    return res.render('modelRunPro',{
                        // user:req.session.user,
                        modelSer:ms,
                        input:data,
                        host:'localhost'
                    });
                });
            });
        });

    // 下载mdl
    app.route('/modelser/mdl/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function (err, ms) {
                if(err)
                {
                    return res.end('error');
                }
                    var filename = ms.ms_model.m_name + '.mdl';
                    var cfgPath = __dirname + '/../geo_model/' + ms.ms_path + 'model/' + filename;
                    fs.readFile(cfgPath, function (err, data) {
                        if(err)
                        {
                            return res.end('error');
                        }
                        res.set({
                            'Content-Type': 'file/xml',
                            'Content-Length': data.length });
                        var name = path.basename(filename);
                        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(name));
                        res.end(data);
                    })
            });
        });

    app.route('/modelser/mdlstr/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function (err, ms) {
                if(err)
                {
                    return res.end('error');
                }
                ModelSerCtrl.readCfg(ms,function (err, cfg) {
                    var filename = cfg.mdl;
                    var cfgPath = __dirname + '/../geo_model/' + ms.ms_path + filename;
                    fs.readFile(cfgPath, function (err, data) {
                        if(err)
                        {
                            return res.end('error');
                        }
                        res.end(data.toString());
                    })
                });
            });
        });

    //get 所有测试数据
    app.route('/modelser/testify/:msid')
        .delete(function (req, res, next) {
            var msid = req.params.msid;
            var path = req.query.path;
            testifyCtrl.delTestify(msid, path, RouteBase.returnFunction(res, 'Error in deleting test data!'));
        });
    
    app.route('/modelser/enmatch/:pid')
        .get(function (req, res) {
            return res.render('enMatch',{
                port:setting.port,
                pid:req.params.pid,
                place:req.query.place
            })
        });


    ///////////////////////////////////JSON//////////////////////////

	//获取某个模型服务的输入输出数据声明
    app.route('/modelser/inputdata/json/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getInputData(msid, RouteBase.returnFunction(res, "error in getting input data of model service"));
        });

    //获取某个Model_Service的JSON数据
    app.route('/modelser/json/:msid')
        .get(function(req,res,next) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                if(req.query.type == 'admin'){
                    next();
                }
                else{
                    ModelSerCtrl.getLocalModelSer(RouteBase.returnFunction(res, 'Error in getting all local model services'));
                }
            }
            else
            {
                ModelSerCtrl.getByOID(msid, function(err, ms)
                {
                    if(err)
                    {
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get modelSer"
                        }));
                    }
                    ModelSerRunCtrl.getByMSID(msid, function (err, msrs) {
                        if(err)
                        {
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in get modelSerRun"
                            }));
                        }
                        return res.end(JSON.stringify({
                            'res' : 'suc',
                            modelSer : ms,
                            msrs : msrs
                        }));
                    });
                });
            }
        });

    app.route('/modelser/preparation/json/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCtrl.getByOID(msid, function(err, ms)
            {
                if(err)
                {
                    return res.end('Error in get modelService model : ' + JSON.stringify(err));
                }
                ModelSerCtrl.getInputData(ms._id, function (err, data) {
                    if(err)
                    {
                        return res.end('Error in get input data : ' + JSON.stringify(err))
                    }
                    var sendData = {
                        modelSer:ms,
                        input:data
                    };
                    return res.end(JSON.stringify(sendData));
                });
            });
        });

    app.route('/modelser/search')
        .get(function (req, res, next) {
            if(req.query.mid)
            {
                mid = req.query.mid;
                ModelSerCtrl.getByMID(mid, function (err, item) {
                    if(err) {
                        return res.end(JSON.stringify({
                            res: 'err',
                            value: err
                        }));
                    }
                    return res.end(JSON.stringify({
                        res : 'suc',
                        value : item
                    }));
                });
            }
        });
    
    //从门户或者本机得到runtime节点
    // app.route('/modelser/demands/:pid')
    //     .get(function (req, res) {
    //         var pid = req.params.pid;
    //         var place = req.query.place;
    //         ModelSerCrtl.getRuntimeByPid(pid,place,function (err, data) {
    //             if(err){
    //                 return res.end(JSON.stringify({status:0}));
    //             }
    //             else{
    //                 return res.end(JSON.stringify({status:1,demands:data}));
    //             }
    //         })
    //     });

    // app.route('/modelser/enmatch')
    //     .get(function (req, res) {
    //         var type = req.query.type;
    //         var demand = req.query.demand;
    //         var enviroCtrl;
    //         if(type == 'swe')
    //             enviroCtrl = SWECtrl;
    //         else if(type == 'hwe')
    //             enviroCtrl = HWECtrl;
    //         enviroCtrl.enMatched(demand,function (err, data) {
    //             if(err){
    //                 return res.end(JSON.stringify({err:err}));
    //             }
    //             else{
    //                 return res.end(JSON.stringify({enviro:data}));
    //             }
    //         })
    //     });

    app.route('/modelser/tabledata/:pid')
        .get(function (req, res) {
            var pid = req.params.pid;
            var place = req.query.place;
            var type = req.query.type;
            var enviroCtrl;
            if(type == 'swe'){
                enviroCtrl = SWECtrl;
            }
            else if(type == 'hwe'){
                enviroCtrl = HWECtrl;
            }
            enviroCtrl.getMatchTabledata(pid,place,function (err, data) {
                if(err){
                    return res.end(JSON.stringify({err:err}));
                }
                else{
                    return res.end(JSON.stringify({tabledata:data}));
                }
            });
        });

    app.route('/enmatchtest')
        .get(function (req, res) {
            return res.render('enMatchModal');
        });

    //远程模型访问路由
    remoteModelSerRoute(app);
};