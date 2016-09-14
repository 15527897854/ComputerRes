/**
 * Created by Franklin on 16-3-27.
 * Route for model-service
 */

var mount_uploadify = require('uploadify');
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
var ModelCrtl = require('../control/modelControl');
var NoticeCtrl = require('../control/noticeCtrl');

var ModelIns = require('../model/modelInstance');

var remoteModelSerRoute = require('./rmtModelSerRoute');

module.exports = function(app)
{
    //远程模型访问路由
    remoteModelSerRoute(app);

    //新增模型服务
    app.route('/modelser')
        .post(function(req, res, next)
        {
            var form = new formidable.IncomingForm();
            form.encoding = 'utf-8';    	                //设置编辑
            form.uploadDir = setting.modelpath + 'tmp/';	//设置上传目录
            form.keepExtensions = true;                     //保留后缀
            form.maxFieldsSize = 500 * 1024 * 1024;         //文件大小

            //解析请求
            form.parse(req, function (err, fields, files) {
                if(err) {
                    return res.end(JSON.stringify(err));
                }
                var date = new Date();
                var img = null;
                if(files.ms_img.size != 0)
                {
                    img = uuid.v1() + path.extname(files.ms_img.path);
                    fs.renameSync(files.ms_img.path, setting.modelpath + '../public/images/modelImg/' + img);
                }
                else
                {
                    fs.unlinkSync(files.ms_img.path);
                }
                //产生新的OID
                var oid = new ObjectId();

                //生成新的纪录
                var newmodelser = {
                    _id : oid,
                    ms_model : {
                        m_name:fields.m_name,
                        m_type:fields.m_type,
                        m_url:fields.m_url
                    },
                    mv_num:fields.mv_num,
                    ms_des:fields.ms_des,
                    ms_update:date.toLocaleString(),
                    ms_platform:setting.platform,
                    ms_path:oid.toString() + '/',
                    ms_img:img,
                    ms_xml:fields.ms_xml,
                    ms_status:0,
                    ms_user:{
                        u_name:fields.u_name,
                        u_email:fields.u_email
                    }
                };
                //解压路径
                var model_path = setting.modelpath + oid.toString() + '/';

                //解压
                fs.createReadStream(files.file_model.path).pipe(unzip.Extract({path: model_path}));
                
                //验证
                

                //删除文件
                fs.unlinkSync(files.file_model.path);

                //添加纪录
                ModelSerCrtl.addNewModelSer(newmodelser, function (err, item) {
                    if(err)
                    {
                        return res.end('Error : ' + JSON.stringify(err));
                    }
                    res.end(JSON.stringify({
                        res : 'suc',
                        oid : oid.toString()
                    }));
                });
            });

            global.fileupload.add({
                sessionId : req.sessionID,
                process : 0
            });
            //上传过程中
            form.on('progress', function (bytesReceived, bytesExpected)
            {
                var percent = Math.round(bytesReceived/bytesExpected * 100);
                var newItem = {
                    sessionId : req.sessionID,
                    value : percent
                };
                global.fileupload.update(newItem);
            });
        });

    //获取上传文件百分比
    app.route('/modelser/file')
        .get(function (req, res, next) {
            var client = global.fileupload.get(req.sessionID);
            res.end(JSON.stringify({
                value:client.value
            }));
            if(client.value == 100)
            {
                global.fileupload.remove(client.sessionId);
            }
        });

    //展示某个模型服务
    app.route('/modelser/:msid')
        .get(function(req,res,next)
        {
            var msid = req.params.msid;
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
                            data:data,
                            blmodelser : true
                        });
                });
            }
            else if(msid == 'new')
            {
                //新增模型服务页面
                res.render('modelSerNew',
                    {
                        blmodelser : true
                    });
            }
            else
            {
                //运行模型服务
                if(req.query.ac == "run")
                {
                    //读取输入文件参数
                    var inputData = JSON.parse(req.query.inputdata);
                    ModelSerCrtl.getInputData(msid, function (err, data) {
                        if(err)
                        {
                            //存储错误消息
                            var noticeData = {
                                time:new Date(),
                                ms_name:ms.ms_model.m_name,
                                notice:'运行服务出错：在读取输入文件时出错！',
                                type:'errInfo',
                                hasRead:0
                            };
                            NoticeCtrl.addNotice(noticeData,function (lerr, data) {
                                if(lerr)
                                {
                                    return res.end('Error in log!');
                                }
                                return res.end(JSON.stringify(err));
                            });
                        }
                        //指定输出文件参数
                        var outputData = [];
                        for(var i = 0; i < data.Event.length; i++)
                        {
                            if(data.Event[i].$.type == 'noresponse')
                            {
                                var dataid = 'gd_' + uuid.v1();
                                var item = {
                                    'Event':data.Event[i].$.name,
                                    'DataId':dataid
                                };
                                outputData.push(item);
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
                                //存储错误消息
                                var noticeData = {
                                    time:new Date(),
                                    ms_name:ms.ms_model.m_name,
                                    notice:'运行服务出错：在添加模型服务运行记录时出错！',
                                    type:'errInfo',
                                    hasRead:0
                                };
                                NoticeCtrl.addNotice(noticeData,function (lerr, data) {
                                    if(lerr)
                                    {
                                        return res.end('Error in log!');
                                    }
                                    console.log(err);
                                    return res.end(JSON.stringify(
                                        {
                                            res:'err',
                                            mess:JSON.stringify(err)
                                        }));
                                });
                            }

                            //开始运行模型实例
                            ModelSerCrtl.run(msid, guid, function (err, ms) {
                                if(err)
                                {
                                    //存储错误消息
                                    var noticeData = {
                                        time:new Date(),
                                        ms_name:ms.ms_model.m_name,
                                        notice:'运行服务出错：在开始运行模型实例时出错！',
                                        type:'errInfo',
                                        hasRead:0
                                    };
                                    NoticeCtrl.addNotice(noticeData,function (lerr, data) {
                                        if(lerr)
                                        {
                                            return res.end('Error in log!');
                                        }
                                        return res.end('Error : ' + err);
                                    });
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
                else
                {
                    ModelSerCrtl.getByOID(msid, function(err, ms)
                    {
                        if(err)
                        {
                            return res.end('Error!');
                        }
                        ModelSerRunCtrl.getByMSID(msid, function (err, msrs) {
                            if(err)
                            {
                                return res.end('Error!');
                            }
                            return res.render('modelSer',{
                                modelSer : ms,
                                msrs : msrs,
                                blmodelser : true
                            });
                        });
                    });
                }
            }
        })
        .put(function (req, res, next) {
            var msid = req.params.msid;
            //停止服务
            if(req.query.ac == "stop")
            {
                ModelSerCrtl.getByOID(msid,function (err, ms) {
                    if(err)
                    {
                        //存储通知消息
                        var noticeData = {
                            time:new Date(),
                            ms_name:ms.ms_model.m_name,
                            notice:'停止服务出错：在数据库中查询服务时出错！',
                            type:'errInfo',
                            hasRead:0
                        };
                        NoticeCtrl.addNotice(noticeData,function (err, data) {
                            if(err)
                            {
                                return res.end('Error!');
                            }
                        });
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get object"
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
                        ModelSerCrtl.update(ms, function (err, data){
                            if(err) {
                                //存储通知消息
                                var noticeData = {
                                    time:new Date(),
                                    ms_name:ms.ms_model.m_name,
                                    notice:'停止服务出错！',
                                    type:'errInfo',
                                    hasRead:0
                                };
                                NoticeCtrl.addNotice(noticeData,function (err, data) {
                                    if(err)
                                    {
                                        return res.end('Error!');
                                    }
                                });
                                return res.end(JSON.stringify({
                                    "res":"Error",
                                    "mess":"Error in update object"
                                }));
                            }
                            //存储通知消息
                            var myDate = new Date();
                            var noticeData = {
                                time:new Date(),
                                ms_name:ms.ms_model.m_name,
                                notice:'模型服务已停止！',
                                type:'stopServer',
                                hasRead:0
                            };
                            NoticeCtrl.addNotice(noticeData,function (err, data) {
                                if(err)
                                {
                                    return res.end('Error!');
                                }
                            });
                            return res.end(JSON.stringify({
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
                        //存储通知消息
                        var noticeData = {
                            time:new Date(),
                            ms_name:ms.ms_model.m_name,
                            notice:'开启服务出错：在数据库中查询服务时出错！',
                            type:'errInfo',
                            hasRead:0
                        };
                        NoticeCtrl.addNotice(noticeData,function (err, data) {
                            if(err)
                            {
                                return res.end('Error!');
                            }
                        });
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in get object"
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
                        ModelSerCrtl.update(ms, function (err, data) {
                            if(err) {
                                //存储通知消息
                                var noticeData = {
                                    time:new Date(),
                                    ms_name:ms.ms_model.m_name,
                                    notice:'开启服务出错：在数据库中更新服务时出错！',
                                    type:'errInfo',
                                    hasRead:0
                                };
                                NoticeCtrl.addNotice(noticeData,function (err, data) {
                                    if(err)
                                    {
                                        return res.end('Error!');
                                    }
                                });
                                return res.end(JSON.stringify({
                                    "res":"Error",
                                    "mess":"Error in update object"
                                }));
                            }
                            //存储通知消息
                            var noticeData = {
                                time:new Date(),
                                ms_name:ms.ms_model.m_name,
                                notice:'模型服务已开启！',
                                type:'startServer',
                                hasRead:0
                            };
                            NoticeCtrl.addNotice(noticeData,function (err, data) {
                                if(err)
                                {
                                    return res.end('Error!');
                                }
                            });
                            return res.end(JSON.stringify({
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
                    //存储通知消息
                    var noticeData = {
                        time:new Date(),
                        ms_name:item.ms_model.m_name,
                        notice:'删除服务出错：在数据库中删除服务时出错！',
                        type:'errInfo',
                        hasRead:0
                    };
                    NoticeCtrl.addNotice(noticeData,function (lerr, data) {
                        if(lerr)
                        {
                            return res.end('Error in log!');
                        }
                        return res.end(JSON.stringify({
                            res:'err',
                            err:err
                        }));
                    });
                }
                //存储通知消息
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
                        return res.end('Error!');
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
                ModelSerCrtl.getInputData(ms._id, function (err, data) {
                    if(err)
                    {
                        return res.end('Error in get input data : ' + JSON.stringify(err))
                    }
                    console.log('input data : ' + JSON.stringify(data));
                    return res.render('modelRunPro',{
                        modelSer:ms,
                        input:data
                    });
                });
            });
        });

    //获取某个Model_Service的JSON数据
    app.route('/modelser/json/:msid')
        .get(function(req,res,next)
        {
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
            else
            {
                ModelSerCrtl.getModelSerByMsId(msid, function(err,data)
                {
                    return res.end(JSON.stringify(data));
                });
            }
        });

    app.route('/modelser/test/:msid')
        .get(function (req, res, next) {
            // ModelSerCrtl.run(req.params.msid, function (err, data) {
            //     res.end('END!');
            // });
            ModelSerCrtl.getInputData(req.params.msid, function (err, data) {
                if(err)
                {
                    return res.end(JSON.stringify(err));
                }
                return res.end(JSON.stringify(data));
            });
        });
}