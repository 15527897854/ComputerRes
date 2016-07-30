/**
 * Created by Franklin on 16-3-27.
 * Route for ModelService
 */

var mount_uploadify = require('uploadify');
var fs = require('fs');
var crypto = require('crypto');

var ModelSerCrtl = require('../control/modelSerControl');
var ModelCrtl = require('../control/modelControl');
var setting = require('../setting');

module.exports = function(app)
{
    //uploadify for deployment of model_service
    mount_uploadify(app,
        {
            path:'/modelser/space/upload/*',
            fileKey:'myfile',
            multer:{ dest: 'geo_model/tmp/' },
            callback:function(req)
            {
                var dirname = __dirname + '\\..\\geo_model\\';
                var nowDir = req.body.path;
                var files = req.files;
                for(var i = 0; i < files.length; i++)
                {
                    var tmpfile = files[i];
                    var path = tmpfile.path;
                    var index = path.lastIndexOf('\\');
                    var newpath = dirname + nowDir + tmpfile.originalname;
                    fs.rename(tmpfile.path,  newpath);
                    files[i].path = newpath;
                }
                return files;
            }
        });

    //新增模型服务
    app.route('/modelser')
        .post(function(req, res, next)
        {
            var myDate = new Date();
            var newmodelser = {
                m_id:req.body.m_id,
                mv_num:req.body.mv_num,
                ms_des:req.body.ms_des,
                ms_update:myDate.getYear() + '-' + myDate.getMonth() + '-' + myDate.getDay() + ' '
                + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds(),
                ms_xml:req.body.ms_xml,
                ms_status:0,
                cr_id:setting.oid,
//                ms_user:req.body.u_id
                u_id:'0'
            };
            ModelSerCrtl.addNewModelSer(newmodelser, function(err, data)
            {
                if(err)
                {
                    return res.end('Error');
                }
                return res.redirect('/modelser/space/' + data._id + '/master');
            });
        });

    //部署某个模型的模型服务
    app.route('/modelser/deployment/:mid')
        .get(function(req, res, next)
        {
            var mid = req.params.mid;
            ModelCrtl.getByOID(mid, function(err, data)
            {
                if(err)
                {
                    return res.render('modelSerDeploy',
                        {
                            model:null
                        });
                }
                return res.render('modelSerDeploy',
                    {
                        model:data
                    });
            })
        });

    //展示某个Model_Service
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
                            data:data
                        });
                });
            }
            else if(msid == 'new')
            {
                //新增模型服务页面
                res.end('to be continue!!!');
            }
            else
            {
                //停止服务
                if(req.query.ac == "stop")
                {
                    ModelSerCrtl.getByOID(msid,function (err, ms) {
                        if(err)
                        {
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
                            ModelSerCrtl.update(ms, function (err, data) {
                                if(err)
                                {
                                    return res.end(JSON.stringify({
                                        "res":"Error",
                                        "mess":"Error in update object"
                                    }));
                                }
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
                                if(err)
                                {
                                    return res.end(JSON.stringify({
                                        "res":"Error",
                                        "mess":"Error in update object"
                                    }));
                                }
                                return res.end(JSON.stringify({
                                    "res":"Success"
                                }));
                            })
                        }
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
                        return res.render('modelSer',{
                            modelSer:ms
                        });
                    });
                }
            }
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
            ModelSerCrtl.getModelSerByMsId(msid, function(err,data)
            {
                return res.end(JSON.stringify(data));
            });
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