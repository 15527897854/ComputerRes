var options = {
    // tmpDir: __dirname + '/../public/uploaded/tmp',
    // publicDir: __dirname + '/../public/uploaded',
    // unzipPath: __dirname + '/../geo_model',
    uploadDir: __dirname + '/../public/uploaded',
    uploadUrl: '/uploaded/',
    maxPostSize: 11000000000, // 11 GB
    minFileSize: 1,
    maxFileSize: 10000000000, // 10 GB
    acceptFileTypes: /.+/i,
    // Files not matched by this regular expression force a download dialog,
    // to prevent executing any scripts in the context of the service domain:
    inlineFileTypes: /\.(gif|jpe?g|png)$/i,
    imageTypes: /\.(gif|jpe?g|png)$/i,
    copyImgAsThumb: true,
    imageVersions: {
        maxWidth: 80,
        maxHeight: 80
    },
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
    },
    storage : {
        type : 'local'
    },
    nodeStatic: {
        cache: 3600 // seconds to cache served files
    }
};

var ModelSerCtrl = require('../control/modelSerControl');
var ModelSerModel = require('../model/modelService');
var ObjectId = require('mongodb').ObjectID;
var unzip = require('unzip');
var formidable = require('formidable'),
    util = require('util'),
    fs=require('fs');
var path = require('path');
var uploader = require('blueimp-file-upload-expressjs')(options);
var uploadModelPath,modelImage;

module.exports = function(app)
{
    app.route('/modelser/new')
        .get(function (req, res) {
            res.render('upload',{
                title:'添加模型服务'
            })
        });
    // app.route('/json/modelser/new')
    //     .get(function (req, res) {
    //         uploader.get(req, res, function(err, obj) {
    //             res.send(JSON.stringify(obj));
    //         });
    //     });
    app.route('/modelser/new')
        .post(function(req,res) {
            // console.log(req);
            uploader.post(req, res, function(err, obj) {
                // console.log(options.uploadDir +"/"+ obj.files[i].name);
                uploadModelPath = (options.uploadDir +"/" + obj.files[0].name);
                res.send(JSON.stringify(obj));
            });
        });
    app.route('/uploaded/:name')
        .delete(function(req,res) {
            uploader.delete(req, res, function(err, obj) {
                uploadModelPath = '';
                res.send(JSON.stringify(obj));
            });
        });
    app.route('/modelser/mongo')
        .post(function(req, res, next) {
            // console.log(req.body);
            // console.log("path:  "+options.unzipName);
            var myDate = new Date();
            var newmodelser = new ModelSerModel();
            newmodelser.ms_model = {
                _id : new ObjectId(),
                m_name:req.body.m_name,
                m_type:req.body.m_type,
                m_url:req.body.m_url
            };
            newmodelser.mv_num = req.body.mv_num;
            newmodelser.ms_des = req.body.ms_des;
            newmodelser.ms_update = myDate.getFullYear() + '-' + (myDate.getMonth() +1) + '-' + myDate.getDay() + ' ' + myDate.getHours() + ':' + (myDate.getMinutes()<10?'0'+myDate.getMinutes():myDate.getMinutes()) + ':' + myDate.getSeconds();
            newmodelser.ms_platform = req.body.ms_platform;
            newmodelser.ms_path = req.body.ms_path;
            newmodelser.ms_xml = req.body.ms_xml;
            newmodelser.ms_status = req.body.ms_status;
            newmodelser.ms_user = {
                u_name:req.body.u_name,
                u_email:req.body.u_email
            };
            newmodelser.ms_img = null;
            if(modelImage){
                newmodelser.ms_img = modelImage;
            }

            var unzipPath = __dirname + '/../geo_model/' + newmodelser.ms_model._id;
            var extname = path.extname(uploadModelPath);
            if (extname=='.zip') {
                //bug: 存之前检查是否同一个表单保存了两次，在数据库中查找是否已经存储过
                //      防止后退再前进之后重复保存
                //      重复与更新
                ModelSerCtrl.addNewModelSer(newmodelser, function(err, data)
                {
                    if(err)
                    {
                        res.send({"status":0});
                        return;
                        // return res.end('Error');
                    }
                    console.log("temp path:  "+uploadModelPath);
                    console.log("final path:  "+unzipPath);
                    fs.createReadStream(uploadModelPath).pipe(unzip.Extract({path: unzipPath}));
                    uploadModelPath = null;
                    res.send({"status":1});
                    // return res.redirect('/modelser/space/' + data._id + '/master');
                    // return res.redirect('/index');//防止表单重复提交
                });
            }
            else{
                res.send({'status':2});
            }
        });
    app.route('/upload/image')
        .post(function (req, res) {
            var form = new formidable.IncomingForm(),
                files=[],	//
                fields=[],
                docs=[];
            console.log('start upload');

            //存放目录
            form.uploadDir =__dirname + '/../public/uploaded/';

            form
                .on('file', function(field, file) {
                    files.push([field, file]);
                    docs.push(file);

                    var types = file.name.split('.');
                    var date = new Date();
                    var ms = Date.parse(date);
                    modelImage = form.uploadDir + ms + '_'+file.name;
                    fs.renameSync(file.path, modelImage);
                })
                .on('end', function() {
                    console.log('-> upload done');
                    res.writeHead(200, {
                        'content-type': 'text/plain'
                    });
                    var out={
                        Resopnse:{
                            'result-code':0,
                            timeStamp:new Date()
                        },
                        files:docs
                    };
                    var sout=JSON.stringify(out);
                    res.end(sout);
                });

            form.parse(req, function(err, fields, files) {  //解析request对象
                err && console.log('formidabel error : ' + err);
                console.log('parsing done');
            });
        })
};
