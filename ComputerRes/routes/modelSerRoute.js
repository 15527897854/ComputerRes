/**
 * Created by Franklin on 16-3-27.
 * Route for ModelService
 */

var mount_uploadify = require('uploadify');
var fs = require('fs');

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
//
//    //所有模型
//    app.route('/modelses/all')
//        .get(function(req, res, next)
//        {
//            //查询本地数据库数据
//            ModelSerCrtl.getLocalModelSer(function(err, data)
//            {
//                if(err)
//                {
//                    return res.end('Error!');
//                }
//                return res.render('modelSers',
//                    {
//                        data:data
//                    });
//            });
//        });

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
//            ModelSerCrtl.getModelSerByMsId(msid,req.headers, function(err,data)
//            {
//                res.render('modelSer',
//                    {
//                        modelSer:data
//                    });
//            });
            if(msid == 'all')
            {
                //查询本地数据库数据
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
            else
            {
                ModelSerCrtl.getModelSerByMsId(msid, function(err, data)
                {
                    if(err)
                    {
                        return res.end('Error!');
                    }
                    return res.render('modelSer',
                        {
                            modelSer:data
                        });
                });
            }
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

    //云盘部署
    app.route('/modelser/space/:msid/master*')
        .get(function(req, res, next)
        {
            var msid = req.params.msid;
            var baseDir = __dirname.substr(0, __dirname.lastIndexOf('\\') + 1);
            var filter = req.originalUrl.substr(req.originalUrl.indexOf('master') + 6) + '/';
            var parent = null;
            var path = msid + filter;
            if(req.originalUrl != '/modelser/space/' + msid + '/master'
                && req.originalUrl != '/modelser/space/' + msid + '/master/')
            {
                parent = req.originalUrl;
                if(req.originalUrl.lastIndexOf('/') == req.originalUrl.length - 1)
                {
                    parent = parent.substr(0, req.originalUrl.lastIndexOf('/'));
                }
                parent = parent.substr(0, req.originalUrl.lastIndexOf('/'));
            }
            ModelSerCrtl.fileTraverse(baseDir + 'geo_model\\' + msid + '\\' + filter,function(err, data)
            {
                if(err)
                {
                    return res.end('Error!');
                }
                return res.render('modelSpace',{
                    filesData:data,
                    parent:parent,
                    path:path,
                    msid:msid
                });
            });
        })
        .delete(function(req, res, next)
        {

        });

    app.route('/modelser/space/newdir')
        .get(function(req, res, next)
        {
            var basedir = __dirname + '\\..\\geo_model\\';
            var path = basedir + req.query.path + req.query.name + '\\';
            var name = req.query.name;

            ModelSerCrtl.newDir(path,function(err, data)
            {
                if(err)
                {
                    return res.end(err.message);
                }
                return res.end('Success!')
            });
        });

    app.route('/modelser/starting/:msid')
        .put(function(req, res, next)
        {
            var msid = req.params.msid;
            var mspath = req.query.path;
            var msname = req.query.name;
            ModelSerCrtl.getByOID(msid, function(err, _ms)
            {
                if(err)
                {
                    return res.end('Error!');
                }
                _ms.ms_path = mspath;
                _ms.ms_file = msname;
                if(_ms.ms_status == -1)
                {
                    _ms.ms_status = 1;
                }
                ModelSerCrtl.update(_ms, function(err, data)
                {
                    if(err)
                    {
                        return res.end('Error!');
                    }
                    return res.end('Success!');
                });
            });
        });
}