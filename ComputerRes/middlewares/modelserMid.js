/**
 * Created by Franklin on 2017/3/15.
 */

var formidable = require('formidable');
var uuid = require('node-uuid');

var Setting = require('../setting');
var FileOpera = require('../utils/fileOpera');
var ModelSerControl = require('../control/modelSerControl');
var RemoteReqControl = require('../control/remoteReqControl');
var MidBase = require('./midBase');

var ModelSerMid = function () {
    
};

ModelSerMid.__proto__ = MidBase;

module.exports = ModelSerMid;

//新增模型服务
ModelSerMid.NewModelSer = function (req, callback) {
    FileOpera.BuildDir(Setting.modelpath, function () {
        FileOpera.BuildDir(Setting.modelpath + 'tmp/', function () {
            var form = new formidable.IncomingForm();
            form.encoding = 'utf-8';    	                //设置编辑
            form.uploadDir = Setting.modelpath + 'tmp/';	//设置上传目录
            form.keepExtensions = true;                     //保留后缀
            form.maxFieldsSize = 500 * 1024 * 1024;         //文件大小
            //解析请求
            form.parse(req, function (err, fields, files) {
                if (err) {
                    return callback(err);
                }
                ModelSerControl.addNewModelSer(fields, files, this.returnFunction(callback, "err in new a service"));

            }.bind(this));
            //初始化文件传输进度
            global.fileupload.add({
                sessionId : req.sessionID,
                process : 0
            });
            //上传过程中传递进度
            form.on('progress', function (bytesReceived, bytesExpected)
            {
                var percent = Math.round(bytesReceived/bytesExpected * 100);
                var newItem = {
                    sessionId : req.sessionID,
                    value : percent
                };
                global.fileupload.update(newItem);
            });
        }.bind(this));
    }.bind(this));
};

//新增远程模型服务
ModelSerMid.NewRmtModelSer = function (req, callback) {
    FileOpera.BuildDir(Setting.modelpath, function () {
        FileOpera.BuildDir(Setting.modelpath + 'tmp/', function () {
            var sessionID = req.params.sessionid;
            var form = new formidable.IncomingForm();
            form.encoding = 'utf-8';    	                //设置编辑
            form.uploadDir = Setting.modelpath + 'tmp/';	//设置上传目录
            form.keepExtensions = true;                     //保留后缀
            form.maxFieldsSize = 500 * 1024 * 1024;         //文件大小
            //解析请求
            form.parse(req, function (err, fields, files) {
                if (err) {
                    return callback(err);
                }
                ModelSerControl.addNewModelSer(fields, files, this.returnFunction(callback, "err in new a service"));

            }.bind(this));
            //初始化文件传输进度
            global.fileupload.add({
                sessionId : sessionID,
                process : 0
            });
            //上传过程中传递进度
            form.on('progress', function (bytesReceived, bytesExpected)
            {
                var percent = Math.round(bytesReceived/bytesExpected * 100);
                var newItem = {
                    sessionId : sessionID,
                    value : percent
                };
                global.fileupload.update(newItem);
            });
        }.bind(this));
    }.bind(this));
};

//下载门户模型包
ModelSerMid.getCloudPackage = function(fields, pid, callback){
    var fileName = Setting.modelpath + 'tmp/' + pid + '.zip';
    RemoteReqControl.postDownload('http://' + Setting.gate.host + ':' + Setting.gate.port + '/GeoModeling/GetDeployPackageServlet',
        {
            uid : pid
        }, fileName,
        function(){
            fields = JSON.parse(fields);
            var ms = {
                m_name : fields.model_name,
                m_type : null,
                m_url : "",
                ms_limited : 1,
                mv_num : 1,
                ms_des : fields.model_description,
                ms_xml : null,
                u_name : fields.model_author,
                m_model_append : {
                    m_id : fields.model_id,
                    p_id : pid
                }
            };
            ModelSerControl.addNewModelSer(ms, {
                file_model : {
                    path : fileName
                },
                ms_img : {
                    size : 0
                }
            }, this.returnFunction(callback, "err in download a service"))
        }.bind(this)
    );
};