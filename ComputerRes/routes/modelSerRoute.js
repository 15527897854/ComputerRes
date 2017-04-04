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
var setting = require('../setting');
var ObjectId = require('mongodb').ObjectID;

var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCrtl = require('../control/modelSerControl');
var NoticeCtrl = require('../control/noticeCtrl');
var ModelIns = require('../model/modelInstance');
var ModelSerMid = require('../middlewares/modelserMid');
var RouteBase = require('./routeBase');

var remoteModelSerRoute = require('./rmtModelSerRoute');

module.exports = function(app)
{
    //新增模型服务
    app.route('/modelser')
        .post(function(req, res, next) {
            ModelSerMid.NewModelSer(req, function (err, item) {
                if(err)
                {
                    return res.end("Error : " + JSON.stringify(err));
                }
                res.end(JSON.stringify({
                    res : 'suc',
                    oid : item._id.toString()
                }));
            });
        });

    //远程上传ms    sessionID用于保存progress
    app.route('/modelser/:sessionid')
        .post(function(req, res, next) {
            ModelSerMid.NewRmtModelSer(req, function (err, item) {
                if(err)
                {
                    return res.end("Error : " + JSON.stringify(err));
                }
                res.end(JSON.stringify({
                    res : 'suc',
                    oid : item._id.toString()
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
            //            ModelSerCrtl.addNewModelSer(newmodelser, function (err, item) {
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
            var sessionId = req.params.sessionId;
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

    app.route('/modelser/cloud')
        .get(function(req, res, next){
            res.render('cloudModelSers');
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
                ModelSerCrtl.getLocalModelSer(function(err, data)
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
                //点击运行操作
                if(req.query.ac == "run")
                {
                    //读取输入文件参数
                    var inputData = JSON.parse(req.query.inputdata);
                    ModelSerCrtl.getInputData(msid, function (err, data) {
                        if(err)
                        {
                            return res.end(JSON.stringify(err));
                        }
                        //指定输出文件参数
                        var outputData = [];
                        for(var k = 0; k < data.length; k++)
                        {
                            for(var i = 0; i < data[k].Event.length; i++)
                            {
                                if(data[k].Event[i].$.type == 'noresponse')
                                {
                                    var dataid = 'gd_' + uuid.v1();
                                    var item = {
                                        StateId : data[k].$.id,
                                        Event : data[k].Event[i].$.name,
                                        DataId : dataid,
                                        Ready : false
                                    };
                                    outputData.push(item);
                                }
                            }
                        }

                        //生成唯一字符串GUID
                        var guid = uuid.v4();

                        //向内存中添加模型运行记录条目
                        var date = new Date();
                        var mis = {
                            guid : guid,
                            socket : null,
                            ms : null,
                            start : date.toLocaleString(),
                            state : 'MC_READY'
                        };
                        var modelIns = new ModelIns(mis);
                        app.modelInsColl.addIns(modelIns);

                        ModelSerCrtl.getByOID(msid, function(err, ms){
                            //添加纪录
                            var msr = {
                                ms_id : ms._id,
                                msr_ms : ms,
                                msr_date : date.toLocaleString(),
                                msr_time : 0,
                                msr_user : {
                                    u_name : 'Admin',
                                    u_type : 0
                                },
                                msr_guid : guid,
                                msr_input : inputData,
                                msr_output : outputData,
                                msr_status : 0,
                                msr_des : ''
                            };
                            ModelSerRunCtrl.addItem(msr ,function (err, msr) {
                                res.end(JSON.stringify({
                                    res : 'suc',
                                    msr_id : msr._id
                                }));

                                //开始运行模型实例
                                ModelSerCrtl.run(msid, guid, function (err, ms) {
                                    if(err)
                                    {
                                        return res.end('Error : ' + err);
                                    }

                                    //绑定内存实例的ms属性
                                    app.modelInsColl.bindMs(guid, ms);

                                    //存储通知消息
                                    var notice = {
                                        time:new Date(),
                                        ms_name:ms.ms_model.m_name,
                                        notice:'模型服务开始运行！',
                                        type:'startRun',
                                        hasRead:0
                                    };
                                    NoticeCtrl.addNotice(notice, function (err, data) {
                                        if(err)
                                        {
                                            console.log(JSON.stringify(err));
                                        }
                                    });

                                });
                            });
                        });
                    });
                }
                //单个模型的详情页面
                else
                {
                    ModelSerCrtl.getByOID(msid, function(err, ms)
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
                // console.log('---------------------------------------remote request');
                // console.log(req.url);
                ModelSerCrtl.getByOID(msid,function (err, ms) {
                    if(err)
                    {
                        return res.send(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get object"
                        }));
                    }
                    if(ms.ms_status == 0)
                    {
                        return res.send(JSON.stringify({
                            "res":"Stopped"
                        }));
                    }
                    else
                    {
                        ms.ms_status = 0;
                        ModelSerCrtl.update(ms, function (err, data){
                            if(err) {
                                return res.send(JSON.stringify({
                                    "res":"Error",
                                    "mess":"Error in update object"
                                }));
                            }
                            return res.send(JSON.stringify({
                                "res":"Success"
                            }));
                        })
                    }
                });
            }
            //开启服务
            else if(req.query.ac == "start")
            {
                ModelSerCrtl.getByOID(msid,function (err, ms) {
                    if(err)
                    {
                        return res.send(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get object"
                        }));
                    }
                    if(ms.ms_status == 1)
                    {
                        return res.send(JSON.stringify({
                            "res":"Started"
                        }));
                    }
                    else
                    {
                        ms.ms_status = 1;
                        ModelSerCrtl.update(ms, function (err, data) {
                            if(err) {
                                return res.send(JSON.stringify({
                                    "res":"Error",
                                    "mess":"Error in update object"
                                }));
                            }
                            return res.send(JSON.stringify({
                                "res":"Success"
                            }));
                        })
                    }
                });
            }
        })
        //删除模型服务
        .delete(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCrtl.deleteToTrush(msid, function (err, item) {
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
                    ms_name:item.ms_model.m_name,
                    notice:'模型服务已删除！',
                    type:'delServer',
                    hasRead:0
                };
                NoticeCtrl.addNotice(noticeData,function (err, data) {
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
            ModelSerCrtl.getByOID(msid, function(err, ms)
            {
                if(err)
                {
                    return res.end('Error in get modelService model : ' + JSON.stringify(err));
                }
                if(ms == null)
                {
                    return res.end("can not find model service ! ");
                }
                ModelSerCrtl.getInputData(ms._id, function (err, data) {
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
            ModelSerCrtl.getByOID(msid, function (err, ms) {
                if(err)
                {
                    return res.end('error');
                }
                ModelSerCrtl.readCfg(ms,function (err, cfg) {
                    var filename = cfg.mdl;
                    var cfgPath = __dirname + '/../geo_model/' + ms.ms_path + filename;
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
        });

    ///////////////////////////////////JSON//////////////////////////

	//获取某个模型服务的输入输出数据声明
    app.route('/modelser/inputdata/json/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCrtl.getInputData(msid, RouteBase.returnFunction(res, "error in getting input data of model service"));
        });

    //获取某个Model_Service的JSON数据
    app.route('/modelser/json/:msid')
        .get(function(req,res,next) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                ModelSerCrtl.getLocalModelSer(function (err, data) {
                    if(err)
                    {
                        return res.end(JSON.stringify(err));
                    }
                    return res.end(JSON.stringify(data));
                });
            }
            else if(msid == 'rmtall')
            {
                next();
            }
            else
            {
                if(req.query.ac == "run")
                {
                    //读取输入文件参数
                    var inputData = JSON.parse(req.query.inputdata);
                    ModelSerCrtl.getInputData(msid, function (err, data) {
                        if(err)
                        {
                            return res.end(JSON.stringify(err));
                        }
                        //指定输出文件参数
                        var outputData = [];
                        for(var k = 0; k < data.length; k++)
                        {
                            for(var i = 0; i < data[k].Event.length; i++)
                            {
                                if(data[k].Event[i].$.type == 'noresponse')
                                {
                                    var dataid = 'gd_' + uuid.v1();
                                    var item = {
                                        'StateId' : data[k].$.id,
                                        'Event' : data[k].Event[i].$.name,
                                        'DataId' : dataid
                                    };
                                    outputData.push(item);
                                }
                            }
                        }

                        //判断此模型服务状态


                        //生成唯一字符串GUID
                        var guid = uuid.v4();
                        //向内存中添加模型运行记录条目
                        var date = new Date();
                        var mis = {
                            guid : guid,
                            socket : null,
                            ms : null,
                            start : date.toLocaleString(),
                            state : 'MC_READY'
                        };
                        var modelIns = new ModelIns(mis);
                        app.modelInsColl.addIns(modelIns);

                        //解析表格数据并添加纪录
                        var form = new formidable.IncomingForm();
                        form.encoding = 'utf-8';
                        form.parse(req, function (err, field, files) {
                            if(err)
                            {
                                console.log(err);
                                return res.end(JSON.stringify(
                                    {
                                        res:'err',
                                        mess:JSON.stringify(err)
                                    }));
                            }

                            //开始运行模型实例
                            ModelSerCrtl.run(msid, guid, function (err, ms) {
                                if(err)
                                {
                                    return res.end('Error : ' + err);
                                }

                                //绑定内存实例的ms属性
                                app.modelInsColl.bindMs(guid, ms);

                                //添加纪录
                                var msr = {
                                    ms_id : ms._id,
                                    msr_ms : {
                                        m_name : ms.ms_model.m_name,
                                        mv_num : ms.mv_num
                                    },
                                    msr_date : date.toLocaleString(),
                                    msr_time : 0,
                                    msr_user : {
                                        u_name : 'Admin',
                                        u_type : 0
                                    },
                                    msr_guid : guid,
                                    msr_input : inputData,
                                    msr_output : outputData,
                                    msr_des : ''
                                };
                                //存储通知消息
                                var notice = {
                                    time:new Date(),
                                    ms_name:ms.ms_model.m_name,
                                    notice:'模型服务开始运行！',
                                    type:'startRun',
                                    hasRead:0
                                };
                                NoticeCtrl.addNotice(notice,function (err, data) {
                                    if(err)
                                    {
                                        return res.end('Error!');
                                    }
                                    ModelSerRunCtrl.addItem(msr ,function (err, msr) {
                                        res.end(JSON.stringify({
                                            res : 'suc',
                                            msr_id : msr._id
                                        }));
                                    });
                                });
                            });
                        });
                    });
                }
                else{
                    ModelSerCrtl.getByOID(msid, function(err, ms)
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
                                modelSer : ms,
                                msrs : msrs
                            }));
                        });
                    });
                }
            }
        });

    app.route('/modelser/preparation/json/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            ModelSerCrtl.getByOID(msid, function(err, ms)
            {
                if(err)
                {
                    return res.end('Error in get modelService model : ' + JSON.stringify(err));
                }
                ModelSerCrtl.getInputData(ms._id, function (err, data) {
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
                ModelSerCrtl.getByMID(mid, function (err, item) {
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
    
    //远程模型访问路由
    remoteModelSerRoute(app);
};