/**
 * Created by Franklin on 16-3-27.
 * Control fot ModelService
 */
var http = require('http');
var fs = require('fs');
var path = require('path');

var rimraf = require('rimraf');
var unzip = require('unzip');
var ObjectId = require('mongodb').ObjectID;
var uuid = require('node-uuid');
var iconv = require('iconv-lite');

var setting = require('../setting');
var ModelSerModel = require('../model/modelService');
var ModelSerRunModel = require('../model/modelSerRun');
var GeoDataCtrl = require('./geoDataControl');
var ModelIns = require('../model/modelInstance');
var FileOpera = require('../utils/fileOpera');
var Child = require('../model/child');
var remoteReqCtrl = require('./remoteReqControl');
var ControlBase = require('./controlBase');
var ParamCheck = require('../utils/paramCheck');
var CommonMethod = require('../utils/commonMethod');
var SystemCtrl = require('./sysControl');
var ModelSerRunCtrl = require('./modelSerRunControl');
var NoticeCtrl = require('../control/noticeCtrl');
var testifyCtrl = require('../control/testifyCtrl');

var ModelSerControl = function () {
};
ModelSerControl.__proto__ = ControlBase;
ModelSerControl.model = ModelSerModel;

module.exports = ModelSerControl;

////////////////远程服务

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function(callback){
    Child.getAllAvai(function (err, children) {
        if(err){
            return callback(err);
        }

        if(children.length == 0){
            return callback(null, [])
        }

        var pending = (function (pcallback) {
            var count = 0;
            return function (index) {
                count ++;
                return function (err, data) {
                    count --;
                    if (err) {
                        children[index].ping = 'err';
                    }
                    else {
                        children[index].ping = 'suc';
                        children[index].ms = data;
                    }
                    if (count == 0) {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, children);
        });

        for(var i = 0; i < children.length; i++){
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelser/json/all?token=' + children[i].access_token, done(i));
        }
    });
};

//搜索单个子节点模型服务信息
ModelSerControl.getChildModelSerByHost = function(host, callback){
    if(ParamCheck.checkParam(callback, host)){
        Child.getByHost(host, function(err, child){
            if(err){
                return callback(err);
            }
            remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/all?token=' + child.access_token, this.returnFunction(callback, 'Error in getting rmt model services by host!'));
        }.bind(this));
    }
}

//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMis = function (headers, callback) {
    Child.getAllAvai(function (err, children) {
        if (err) {
            return callback(err);
        }

        var pending = (function (i, host) {
            count++;
            return function (err, mis) {
                count --;
                if (!err) {
                    children[i].mis = mis;
                }
                if (count == 0) {
                    return callback(null, children[i]);
                }
            }
        });

        var count = 0;
        for (var i = 0; i < children.length; i++) {
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelins/json/all?token=' + children[i].access_token, pending(i));
        }
    });
};
//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMisByHost = function (host, callback) {
    if(ParamCheck.checkParam(callback, host)){
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/all?token=' + child.access_token, 
                this.returnFunction(callback, 'error in getting rmt model service instances'));
        }.bind(this));
    }
};

//查询某个子节点某个模型服务运行实例
ModelSerControl.getRmtMis = function(host, guid, callback){
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, guid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/' + guid + '?token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service instance"));
                }
            }.bind(this));
        }
    }
};

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (host, msid, callback) {
    if(ParamCheck.checkParam(callback, host)){
        if(ParamCheck.checkParam(callback, msid)){
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid + '?token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//启动远程模型
ModelSerControl.startRmtModelSer = function (host, msid, callback) {
    if(ParamCheck.checkParam(callback, host)){
        if(ParamCheck.checkParam(callback, msid)){
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=start&token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//关闭远程模型
ModelSerControl.stopRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=stop&token=' + child.access_token, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//获取远程模型输入信息
ModelSerControl.getRmtInputDate = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/inputdata/json/' + msid + '?token=' + child.access_token , this.returnFunction(callback, "error in get input data of rmt model service"));
                }
            }.bind(this));
        }
    }
};

//运行远程模型
ModelSerControl.runRmtModelSer = function(host, msid, inputdata, outputdata, callback){
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, host)) {
            Child.getByHost(host, function(err, child){
                if (err) {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid +  '?ac=run&inputdata=' + inputdata + '&outputdata=' + outputdata + '&token=' + child.access_token, function(err, data)
                    {
                        if(err)
                        {
                            return callback(err);
                        }
                        return callback(null, data);
                    });
                }
            });
        }
    }
};

//删除远程模型服务
ModelSerControl.deleteRmtModelSer = function(host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.deleteRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?token=' + child.access_token, this.returnFunction(callback, "error in get input data of rmt model service"));
            }.bind(this));
        }
    }
};

//远程上传模型
ModelSerControl.postRmtModelSer = function(req, host, callback){
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.postRequest(req, 'http://' + child.host + ':' + child.port + '/modelser/' + req.sessionID + '?token=' + child.access_token, this.returnFunction(callback, "error in get input data of rmt model service"));
        }.bind(this));
    }
};

//远程上传模型进度
ModelSerControl.getRmtModelSerProgress = function(req, host, callback){
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            var url = 'http://' + host + ':' + child.port + '/modelser/file/' + req.sessionID + '?token=' + child.access_token;
            remoteReqCtrl.getRequest(req, url, this.returnFunction(callback, "error in get rmt model service file progress"));
        }.bind(this));
    }
};

//远程查看图像
ModelSerControl.getRmtImg = function(host, imgname, res, callback){
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, imgname)) {
            Child.getByHost(host, function(err, child){
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestPipe(res, 'http://' + child.host + ':' + child.port + '/images/modelImg/' + imgname);
                return callback(null, true);
            });
        }
    }
};

///////////////本地服务

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSer = function(callback){
    ModelSerModel.getAll('AVAI', this.returnFunction(callback, 'error in getting all model services'));
};

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSerByPage = function(start, count, callback){
    try{
        start = parseInt(start);
        count = parseInt(count);
    }
    catch(ex){
        return callback(ex);
    }
    ModelSerModel.getAllByPage(start, count, this.returnFunction(callback, 'error in getting all model services'));
};

//搜寻本地可用模型信息(包括管理员私有)
ModelSerControl.getLocalModelSerByAdmin = function(callback){
    ModelSerModel.getAll('ADMIN', this.returnFunction(callback, 'error in getting all model services'));
}

//模型压缩包文件结构验证
//成功返回 isValidate == true，失败返回 错误信息
//status == 0 表示后台读取数据库或者文件出错
ModelSerControl.validate = function (modelPath, callback) {
    var configPath = modelPath + 'package.config';
    var rst = {
        status:1,
        isValidate:true,
        cfgfile:true,
        cfg:[],
        mdl:true,
        start:true
    };
    fs.stat(configPath,function (err,stat) {
        if(err && err.code == 'ENOENT'){
            rst.cfgfile = false;
            rst.isValidate = false;
            callback(rst);
        }
        else if(err){
            callback({status:0});
        }
        else if(stat){
            ModelSerControl.readCfgBypath(configPath,function (err, cfg) {
                if(err){
                    callback({status:0});
                }
                else{
                    //验证config文件
                    {
                        if(!cfg.host){
                            rst.isValidate = false;
                            rst.cfg.push('host');
                        }
                        else if(!cfg.port){
                            rst.isValidate = false;
                            rst.cfg.push('port');
                        }
                        else if(!cfg.start){
                            rst.isValidate = false;
                            rst.cfg.push('start');
                        }
                        else if(!cfg.type){
                            rst.isValidate = false;
                            rst.cfg.push('type');
                        }
                        else if(!cfg.mdl){
                            rst.isValidate = false;
                            rst.cfg.push('mdl');
                        }
                        if(!rst.isValidate){
                            callback(rst);
                        }
                    }
                    //验证 模型启动文件、mdl
                    var startPath = modelPath + cfg.start;
                    var mdlPath = modelPath + cfg.mdl;
                    fs.stat(startPath,function (err,stat) {
                        if(err && err.code == 'ENOENT'){
                            rst.start = false;
                            rst.isValidate = false;
                            fs.stat(mdlPath,function (err, stat2) {
                                if(err && err.code == 'ENOENT'){
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if(err){
                                    callback({status:0});
                                }
                                else if(stat2){
                                    callback(rst);
                                }
                            });
                        }
                        else if(err){
                            callback({status:0});
                        }
                        else if(stat){
                            fs.stat(mdlPath,function (err, stat2) {
                                if(err && err.code == 'ENOENT'){
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if(err){
                                    callback({status:0});
                                }
                                else if(stat2){
                                    callback(rst);
                                }
            });
        }
                    });
                }
            });
        }
        
    });
};

//新增模型服务
//先解压到以_oid命名的文件夹中，验证成功在添加记录，失败不添加记录并删除该文件夹
ModelSerControl.addNewModelSer = function(fields, files, callback){
    var date = new Date();
    var img = null;
    if(files.ms_img) {
        if (files.ms_img.size != 0) {
            img = uuid.v1() + path.extname(files.ms_img.path);
            fs.renameSync(files.ms_img.path, setting.modelpath + '../public/images/modelImg/' + img);
        }
        else {
            FileOpera.rmdir(files.ms_img.path);
        }
    }

    if(!files.file_model){
        return callback(new Error('No package file'));
    }

    //产生新的OID
    var oid = new ObjectId();

    //解压路径
    var model_path = setting.modelpath + oid.toString() + '/';
    //MD5码
    FileOpera.getMD5(files.file_model.path, function(err, md5_value){
        if(err){
            return callback(err);
        }

        ModelSerControl.getMIDByPID(md5_value, function(err, mid){
            if(err){
                mid = null;
            }
            fields.m_register = false;
            if(mid != undefined || mid != null){
                fields.m_register = true;
                if(fields.m_id){
                    mid = fields.m_id;
                }
            }

            CommonMethod.Uncompress(files.file_model.path, model_path, function(err){
                if(err){
                    return callback(err);
                }
                
                //添加默认测试数据，不用异步请求，两者不相关
                testifyCtrl.addDefaultTestify(oid.toString(),ModelSerControl.getInputData);

                //! TODO (要改)添加模型运行文件权限
                if (setting.platform == 2) {
                    //
                    ModelSerModel.readCfgBypath(model_path + 'package.config', function (err, cfg) {
                        if(err) {

                        }
                        else {
                            FileOpera.chmod(model_path + cfg.start, 'exec');
                        }
                    });
                }

                //删除文件
                FileOpera.rmdir(files.file_model.path);

                ModelSerModel.readMDLByPath(setting.modelpath + oid + '/model/', function(err, mdl){
                    if(err){
                        return callback(err);
                    }
                    
                    try{
                        fields.m_name = mdl.ModelClass.$.name;
                        var category = mdl.ModelClass.AttributeSet.Categories.Category;
                        if(category.constructor == Array){
                            category = category[0];
                        }
                        else if(category.constructor == Object){
                            category = category;
                        }
                        fields.m_type = category.$.path + ' - ' + category.$.principle;
                        var attr = mdl.ModelClass.AttributeSet.LocalAttributes.LocalAttribute;
                        if(attr.constructor == Array){
                            var i;
                            for(i = 0; i < attr.length; i++){
                                if(attr[i].$.local == 'ZH_CN'){
                                    attr = attr[i];
                                    break;
                                }
                            }
                            if(i == attr.length){
                                attr = attr[0];
                            }
                        }
                        else if(attr.constructor == Object){
                            attr = attr;
                        }
                        fields.m_url = attr.$.wiki;
                        fields.ms_des = attr.Abstract;
                        fields.mv_num = mdl.ModelClass.Runtime.$.version;
                    }
                    catch(ex){
                        return callback(ex);
                    }
                    //新路径
                    var newPath = setting.modelpath + fields.m_name + '_' + oid.toString();

                    //生成新的纪录
                    var newmodelser = {
                        _id : oid,
                        ms_model : Object.assign({
                            m_name : fields.m_name,
                            m_type : fields.m_type,
                            m_url : fields.m_url,
                            p_id : md5_value,
                            m_id : mid,
                            m_register : fields.m_register
                        }, fields.m_model_append),
                        ms_limited:fields.ms_limited,
                        ms_permission:fields.ms_permission,
                        mv_num:fields.mv_num,
                        ms_des:fields.ms_des,
                        ms_update:date.toLocaleString(),
                        ms_platform:setting.platform,
                        ms_path:fields.m_name + '_' + oid.toString() + '/',
                        ms_img:img,
                        ms_xml:JSON.stringify(mdl),
                        ms_status:0,
                        ms_user:{
                            u_name:fields.u_name,
                            u_email:fields.u_email
                        }
                    };

                    var ms = new ModelSerModel(newmodelser);
                    ModelSerModel.save(ms,function (err, data) {
                        if(err){
                            console.log(err);
                            callback(null,{status:0});
                        }
                        else{
                            fs.renameSync(model_path, newPath);
                            //添加运行实例临时文件目录
                            FileOpera.BuildDir(newPath + '/instance/', function(){});
                            callback(null,{isValidate:true, data : ms});
                        }
                    });
                });
            });
        });
    });
};

//将记录放置在回收站
//并删除文件
ModelSerControl.deleteToTrush = function (_oid, callback) {
    var oid = _oid;
    ModelSerModel.getByOID(_oid, function (err, item) {
        if (err) {
            return callback(err);
        }
        item.ms_status = -1;
        ModelSerModel.update(item, function (err, mess) {
            if (err) {
                return callback(err);
            }
            //删除文件
            FileOpera.rmdir(setting.modelpath + item.ms_path);
            //删除模型包
            FileOpera.rmdir(setting.modelpath + 'packages/' + oid + '.zip');
            return callback(null, item);
        });
    });
};

//根据OID查询模型服务信息
ModelSerControl.getByOID = function(msid, callback){
    ModelSerModel.getByOID(msid, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//根据MID查询模型服务
ModelSerControl.getByMID = function(mid, callback){
    ModelSerModel.getByMID(mid, this.returnFunction(callback, 'error in getting model service by MID'));
};

//根据PID查询模型服务
ModelSerControl.getByPID = function(mid, callback){
    ModelSerModel.getByPID(mid, this.returnFunction(callback, 'error in getting model service by PID'));
};

//根据PID查询模型服务
ModelSerControl.getByPIDforPortal = function(mid, callback){
    ModelSerModel.getByPIDforPortal(mid, this.returnFunction(callback, 'error in getting model service by PID for portal'));
};

//批量开启模型
ModelSerControl.batchStart = function(msids, callback){
    try{
        var msids = JSON.parse(msids);
        ModelSerModel.batchStart(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch(ex){
        return callback(ex);
    }
}

//批量开启模型
ModelSerControl.batchStop = function(msids, callback){
    try{
        var msids = JSON.parse(msids);
        ModelSerModel.batchStop(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch(ex){
        return callback(ex);
    }
}

//批量锁定模型
ModelSerControl.batchLock = function(msids, callback){
    try{
        var msids = JSON.parse(msids);
        ModelSerModel.batchLock(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch(ex){
        return callback(ex);
    }
}

//批量解锁启模型
ModelSerControl.batchUnlock = function(msids, callback){
    try{
        var msids = JSON.parse(msids);
        ModelSerModel.batchUnlock(msids, this.returnFunction(callback, 'error in batch updating model service!'));
    }
    catch(ex){
        return callback(ex);
    }
}

//更新模型服务信息
ModelSerControl.update = function(ms, callback){
    ModelSerModel.update(ms, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//运行模型服务
ModelSerControl.run = function (msid, inputData, outputData, user, callback) {
    if(inputData == undefined || inputData == null){
        return callback(new Error('No input data!'));
    }

    if(outputData == undefined || outputData == null){
        outputData = [];
    }
    if(typeof outputData == 'string'){
        outputData = JSON.parse(outputData);
    }
    ModelSerControl.getInputData(msid, function(err, data){
        if(err) { return callback(err);}
        data = data.States;
        // Data Info Completion
        for(var k = 0; k < data.length; k++) {
            for(var i = 0; i < data[k].Event.length; i++)
            {
                if(data[k].Event[i].$.type == 'noresponse')
                {
                    //! Output Data
                    var j;
                    for(j = 0; j < outputData.length; j++){
                        if(outputData[j].StateId == data[k].$.id && outputData[j].Event == data[k].Event[i].$.name){
                            outputData[j].StateName = data[k].$.name;
                            outputData[j].StateDes = data[k].$.description;
                            if(outputData[j].Destroyed == undefined || outputData[j].Destroyed == null){
                                outputData[j]['Destroyed'] = false;
                            }
                            if(outputData[j].DataId == undefined || outputData[j].DataId == null){
                                outputData[j]['DataId'] = 'gd_' + uuid.v1();
                            }
                            if(outputData[j].Tag == undefined || outputData[j].Tag == null){
                                outputData[j]['Tag'] = data[k].$.name + '-' + data[k].Event[i].$.name;
                            }
                            break;
                        }
                    }
                    if(j == outputData.length){
                        var dataid = 'gd_' + uuid.v1();
                        var item = {
                            StateId : data[k].$.id,
                            StateName : data[k].$.name,
                            StateDes : data[k].$.description,
                            Event : data[k].Event[i].$.name,
                            Destroyed : false,
                            Tag : data[k].$.name + '-' + data[k].Event[i].$.name,
                            DataId : dataid
                        };
                        outputData.push(item);
                    }
                }
                else if(data[k].Event[i].$.type == 'response'){
                    //! Input Data
                    var j;
                    for(j = 0; j < inputData.length; j++){
                        if(inputData[j].StateId == data[k].$.id && inputData[j].Event == data[k].Event[i].$.name){
                            inputData[j].StateName = data[k].$.name;
                            inputData[j].StateDes = data[k].$.description;
                            if(inputData[j].Destroyed == undefined || inputData[j].Destroyed == null){
                                inputData[j].Destroyed = false;
                            }
                            if(inputData[j].DataId == undefined || inputData[j].DataId == null){
                                inputData[j].DataId = 'gd_' + uuid.v1();
                            }
                            if(inputData[j].Tag == undefined || inputData[j].Tag == null){
                                //! TODO GET IN REDIS
                                inputData[j].Tag = '';
                            }
                            break;
                        }
                    }
                    
                }
            }
        }

        if(inputData == undefined || inputData == null){
            return callback(new Error('No input data!'));
        }

        if(outputData == undefined || outputData == null){
            outputData = [];
        }
        if(typeof outputData == 'string'){
            outputData = JSON.parse(outputData);
        }
        // Data Info Completion
        for(var k = 0; k < data.length; k++) {
            for(var i = 0; i < data[k].Event.length; i++)
            {
                if(data[k].Event[i].$.type == 'noresponse')
                {
                    //! Output Data
                    var j;
                    for(j = 0; j < outputData.length; j++){
                        if(outputData[j].StateId == data[k].$.id && outputData[j].Event == data[k].Event[i].$.name){
                            outputData[j].StateName = data[k].$.name;
                            outputData[j].StateDes = data[k].$.description;
                            if(outputData[j].Destroyed == undefined || outputData[j].Destroyed == null){
                                outputData[j]['Destroyed'] = false;
                            }
                            if(outputData[j].DataId == undefined || outputData[j].DataId == null){
                                outputData[j]['DataId'] = 'gd_' + uuid.v1();
                            }
                            if(outputData[j].Tag == undefined || outputData[j].Tag == null){
                                outputData[j]['Tag'] = data[k].$.Name + '-' + data[k].Event[i].$.name;
                            }
                            break;
                        }
                    }
                    if(j == outputData.length){
                        var dataid = 'gd_' + uuid.v1();
                        var item = {
                            StateId : data[k].$.id,
                            StateName : data[k].$.name,
                            StateDes : data[k].$.description,
                            Event : data[k].Event[i].$.name,
                            Destroyed : false,
                            Tag : data[k].$.name + '-' + data[k].Event[i].$.name,
                            DataId : dataid
                        };
                        outputData.push(item);
                    }
                }
                else if(data[k].Event[i].$.type == 'response'){
                    //! Input Data
                    var j;
                    for(j = 0; j < inputData.length; j++){
                        if(inputData[j].StateId == data[k].$.id && inputData[j].Event == data[k].Event[i].$.name){
                            inputData[j].StateName = data[k].$.name;
                            inputData[j].StateDes = data[k].$.description;
                            if(inputData[j].Destroyed == undefined || inputData[j].Destroyed == null){
                                inputData[j].Destroyed = false;
                            }
                            if(inputData[j].DataId == undefined || inputData[j].DataId == null){
                                inputData[j].DataId = 'gd_' + uuid.v1();
                            }
                            if(inputData[j].Tag == undefined || inputData[j].Tag == null){
                                //! TODO GET IN REDIS
                                inputData[j].Tag = '';
                            }
                            break;
                        }
                    }
                    
                }
            }
        }


        //生成唯一字符串GUID
        var guid = uuid.v4();

        ModelSerModel.getByOID(msid, function(err, ms){
            if(err){
                return callback(err);
            }
            if(ms.ms_status != 1)
            {
                return callback(new Error('Service is not available'));
            }
            
            //向内存中添加模型运行记录条目
            var date = new Date();
            var mis = {
                guid : guid,
                socket : null,
                ms : ms,
                input : inputData,
                output : outputData,
                log : [],
                start : date.toLocaleString(),
                state : 'MC_READY'
            };
            var modelIns = new ModelIns(mis);
            app.modelInsColl.addIns(modelIns);

            //添加纪录
            var msr = {
                ms_id : ms._id,
                msr_ms : ms,
                msr_datetime : date.toLocaleString(),
                msr_span : 0,
                msr_user : user,
                msr_guid : guid,
                msr_input : inputData,
                msr_output : outputData,
                msr_status : 0,
                msr_logs : [],
                msr_runninginfo : {}
            };
            ModelSerRunCtrl.save(msr ,function (err, msr) {
                if(err) {
                    return res.end('Error : ' + err);
                }
                ModelSerModel.run(msid, guid, function (err, stdout, stderr) {
                    ModelSerRunModel.getByGUID(guid, function (err2, item) {
                        if(err2)
                        {
                            return console.log(JSON.stringify(err2));
                        }
                        if(item == null)
                        {
                            return console.log( 'Can not find MSR when it is ended !');
                        }
                        if(err){
                            item.msr_runninginfo.InvokeErr = JSON.stringify(err);
                        }
                        if(stdout){
                            item.msr_runninginfo.StdOut = JSON.stringify(err);
                        }
                        if(stderr){
                            item.msr_runninginfo.StdErr = JSON.stringify(err);
                        }
                        var mis = global.app.modelInsColl.getByGUID(guid);
                        //没有配置环境，进程无法启动
                        if(mis.state == "MC_READY" && mis.socket == null){
                            global.app.modelInsColl.removeByGUID(guid);
                            item.msr_status = -1;
                            ModelSerRunModel.update(item, function (err, res) {
                                if(err)
                                {
                                    return console.log(JSON.stringify(err2));
                                }
                            })
                        }
                        else {
                            ModelSerRunModel.updateRunningInfo(item._id, item.msr_des, function (err, res) {
                                if(err)
                                {
                                    return console.log(JSON.stringify(err2));
                                }
                            });
                        }
                    });
                    
                }, function (err, ms) {
                    if(err)
                    {
                        return callback(err);
                    }
                    //绑定内存实例的ms属性
                    global.app.modelInsColl.bindMs(guid, ms);

                    //存储通知消息
                    var notice = {
                        time : new Date(),
                        title : ms.ms_model.m_name + '开始运行！',
                        detail : '',
                        type : 'start-run',
                        hasRead : false
                    };
                    NoticeCtrl.save(notice, function (err, data) {
                        if(err)
                        {
                            console.log(JSON.stringify(err));
                        }
                    });

                    return callback(null, msr);
                });
            });
        });

    });
}

//获取所有门户网站模型服务
ModelSerControl.getCloudModelsers = function(callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ModelItemToContainerServlet', this.returnFunction(callback, 'error in get cloud model service'));
};

//获取模型门户所有类别
ModelSerControl.getCloudModelserCategory = function(callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetClassServlet', function(err, categories){
        if(err){
            return callback(err);
        }
        for(var i = 0; i < categories.length; i++){
            if(categories[i].children.length > 0){
                categories[i]['nodes'] = [];
            }
            for(var j = 0; j < categories[i].children.length; j++){
                var index = ModelSerControl.getCategoryById(categories, categories[i].children[j]);
                if(index != -1){
                    categories[index]['backColor'] = '#FFFFFF';
                    categories[index]['text'] = categories[index]['name'];
                    if(categories[index]['isLeaf'] === 'true'){
                        categories[index]['selectable'] = true;
                        categories[index]['icon'] = "fa fa-book";
                        categories[index]['selectedIcon'] = "fa fa-check";
                    }
                    else{
                        categories[index]['selectable'] = false;
                        categories[index]['state'] = {
                            expanded : false
                        };
                    }
                    categories[i].nodes.push(categories[index]);
                }
            }
        }

        return callback(null, categories[0]);
    });
};

ModelSerControl.getCategoryById = function(array, id){
    for(var i = 0; i < array.length; i++){
        if(array[i].id == id){
            return i;
        }
    }
    return -1;
};

//获取某一条目下的所有模型部署包
ModelSerControl.getCloudModelPackageByMid = function(mid, callback){
    mid = CommonMethod.Encode64(CommonMethod.Encode64(mid));
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetComputerServicesServlet?modelItemId=' + mid, function(err, packages){
        if(err){
            return callback(err);
        }
        var count = 0;
        if(packages.length == 0) {
            return callback(null, packages);
        }
        var pending = function(index){
            count ++;
            return function(err, ms){
                if(ms.length != 0){
                    packages[index]['pulled'] = true;
                    packages[index]['ms_id'] = ms[0]._id;
                }
                else{
                    packages[index]['pulled'] = false;
                }
                
                count --;
                if(count == 0){
                    return callback(null, packages);
                }
            }
        };

        for(var i = 0; i < packages.length; i++){
            if(packages[i].id && packages[i].id != '')
            ModelSerModel.getByPID(packages[i].id, pending(i));
        }
    });
};

//获取某一类别下的所有模型
ModelSerControl.getCloudModelByCategoryId = function(id, page, callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/modelItemServlet?uid=' + id + '&page=' + page + '&sortType=name&TagOrClass=class', function(err, items){
        if(err){
            return callback(err);
        }
        var itemsCount = items.count;
        items = items.modelItems;
        if(items.length == 0){
            return callback(null, {
                count : 0,
                items : []
            });
        }
        var count = 0;
        var pending = function(index){
            count ++;
            return function (err, mss){
                if(mss.length != 0) {
                    items[index]['pulled'] = true;
                }
                else {
                    items[index]['pulled'] = false;
                }
                count --;
                if(count == 0){
                    return callback(null, {
                        count : itemsCount,
                        items : items
                    });
                }
            }

        };
        for(var i = 0; i < items.length; i++){
            ModelSerModel.getByMID(items[i].model_id, pending(i));
        }
    });
};

//上传模型部署包
ModelSerControl.uploadPackage = function(msid, mid, pkg_name, pkg_version, pkg_des, mupload, portal_uname, portal_pwd, callback){
    var pending = function(){
        SystemCtrl.loginPortal(portal_uname, portal_pwd, function(err, result){
            if(err){
                return callback(err);
            }
            if(result){
                var pending2 = function(){
                    remoteReqCtrl.postRequestJSONWithFormData('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/UploadPackageZipServlet', {
                        id : mid,
                        file : fs.createReadStream(setting.modelpath + 'packages/' + msid + '.zip')
                    }, function(err, data){
                        if(err){
                            return callback(err);
                        }
                        if(data == null){
                            return callback(new Error('portal result in null!'));
                        }
                        if(data.result == 'no'){
                            return callback(new Error('Error in login portal!'));
                        }
                        var resJson = data;
                        var url = 'http://' + setting.portal.host + ':' + setting.portal.port +
                            '/GeoModeling/DeploymentPackageHandleServlet';
                           // '?calcName=' + pkg_name + '&calcDesc=' + pkg_des + '&calcPlatform=1&modelItemId=' + mid + '&calcFcId=' + resJson.fcId + '&calcFileName=' + resJson.result;
                        url = encodeURI(url);
                        remoteReqCtrl.postRequestJSONWithForm(url,{
                            calcName : pkg_name,
                            calcDesc : pkg_des,
                            calcPlatform: 1,
                            modelItemId: mid,
                            calcFcId: resJson.fcId,
                            calcFileName : resJson.result
                        }, function(err, data){
                            if(err){
                                return callback(err);
                            }
                            if(data.result == 'no'){
                                return callback(new Error('Link fail in portal !'));
                            }
                            ModelSerModel.getByOID(msid, function(err, ms){
                                if(err){
                                    return callback(err);
                                }
                                ms.ms_model.m_id = mid;
                                ModelSerControl.update(ms, function(err, result){
                                    if(err){
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        fcid : resJson.fcId
                                    });
                                });
                            });
                        });
                    });
                };
                if(mupload == 'on'){
                    if(!fs.existsSync(setting.modelpath + 'packages/' + msid + '.zip')){
                        CommonMethod.compress(setting.modelpath + 'packages/' + msid + '.zip', setting.modelpath + msid);
                    }
                    pending2();
                }
                else{
                    ModelSerControl.getByOID(msid, function(err, ms){
                        if(err){
                            return callback(err);
                        }
                        remoteReqCtrl.postRequestJSONWithForm('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/RegisterComputerServiceServlet', {
                            port : setting.port,
                            userid : portal_uname,
                            password : portal_pwd,
                            pinfo : JSON.stringify({
                                name : pkg_name,
                                desc : pkg_des,
                                pid : ms.ms_model.p_id,
                                mid : mid
                            })
                        }, function(err, result){
                            if(err){
                                return callback(err);
                            }
                            if(result.result == 'suc'){
                                ms.ms_model.m_id = mid;
                                ModelSerControl.update(ms, function(err, result){
                                    if(err){
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        fcid : 'virtual'
                                    });
                                });
                            }
                            else if(result == 'error'){
                                return callback(new Error(result.message));
                            }
                            else{
                                return callback(new Error('No Response!'));
                            }
                        });
                    });
                }
            }
            else{
                return callback(new Error('Login fail!', -1));
            }
        });
    };

    if(!portal_uname){
        SystemCtrl.getPortalToken(function(err, token){
            if(err){
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            pending();
        });
    }
    else{
        pending();
    }
};

//登记模型服务
ModelSerControl.RegisterModelService = function(msid, callback){
    ModelSerModel.getByOID(msid, function(err, ms){
        if(err){
            return callback(err);
        }
        if(ms == null){
            return callback(new Error('Can not find model service'));
        }
        SystemCtrl.getPortalToken(function(err, token){
            if(err){
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            SystemCtrl.loginPortal(portal_uname, portal_pwd, function(err, result){
                if(err){
                    return callback(new Error('Can not login Portal'));
                }
                ModelSerModel.readCfg(ms, function(err, cfg){
                    if(err){
                        return callback(err);
                    }
                    
                    var mdlPath = __dirname + '/../geo_model/' + ms._id + '/' + cfg.mdl;

                    remoteReqCtrl.postRequestJSONWithFormData('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/RegisterComputerServiceServlet', {
                        name : ms.ms_model.m_name,
                        description : ms.ms_des,
                        id : ms.ms_model.p_id,
                        port : setting.port,
                        platform : setting.platform,
                        mdl : fs.createReadStream(mdlPath)
                    }, function(err, data){
                        if(err){
                            return callback(err);
                        }
                        if(data.result == 'suc'){
                            ms.ms_model.m_register = true;
                            ModelSerModel.update(ms, function(err, result){
                                if(err){
                                    return callback(err);
                                }
                                return callback(null, true);
                            });
                        }
                        else if(data.result == 'error'){
                            return callback(new Error('Error : ' + data.message));
                        }
                        else{
                            return callback(new Error('Unknown Error '));
                        }
                    });
                });
                
            });
        });
    });
};

//退登模型服务
ModelSerControl.UnregisterModelService = function(msid, callback){
    ModelSerModel.getByOID(msid, function(err, ms){
        if(err){
            return callback(err);
        }
        if(ms == null){
            return callback(new Error('Can not find model service'));
        }
        
        SystemCtrl.getPortalToken(function(err, token){
            if(err){
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            SystemCtrl.loginPortal(portal_uname, portal_pwd, function(err, result){
                if(err){
                    return callback(new Error('Can not login Portal'));
                }
                remoteReqCtrl.postRequestJSONWithForm('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/CancelComputerServiceServlet', {
                    id : ms.ms_model.p_id,
                    port : setting.port
                }, function(err, data){
                    if(err){
                        return callback(err);
                    }
                    if(data.result == 'suc'){
                        ms.ms_model.m_register = false;
                        ModelSerModel.update(ms, function(err, result){
                            if(err){
                                return callback(err);
                            }
                            return callback(null, true);
                        });
                    }
                    else if(data.result == 'error'){
                        return callback(new Error('Error : ' + data.message));
                    }
                    else{
                        return callback(new Error('Unknown Error '));
                    }
                    ms.ms_model.m_register = false;
                    ModelSerControl.update(ms, this.returnFunction(callback, 'Error in unregistering this model service!'));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

//根据OID更新门户的ModelItemID
ModelSerControl.getMIDByOID = function(oid, callback){
    if(ParamCheck.checkParam(callback, oid)){
        ModelSerModel.getByOID(oid, function(err, ms){
            if(err){
                return callback(err);
            }
            if(item.ms_model.p_id){
                return callback(null, ms.ms_model.mid);
            }
            else{
                return callback(new Error('No PID'));
            }
        });
    }
};

//根据PID更新门户的ModelItemID
ModelSerControl.getMIDByPID = function(pid, callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/DeploymentPackageHandleServlet?uid=' + pid, function(err, data){
        if(err){
            return callback(err);
        }
        if(data.modelItemId){
            return callback(null, data.modelItemId);
        }
        else{
            return callback(new Error('can not get MID'));
        }
    });
};

//得到初始输入数据
ModelSerControl.getInputData = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if (err) {
            return callback(err);
        }
        ModelSerModel.readMDL(ms, function (err, mdl) {
            if (err) {
                return callback(err);
            }
            try {
                var dataDecs = null;
                if (mdl.ModelClass.Behavior.RelatedDatasets != null) {
                    dataDecs = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
                }
                else if (mdl.ModelClass.Behavior.DatasetDeclarations != null) {
                    dataDecs = mdl.ModelClass.Behavior.DatasetDeclarations.DatasetDeclaration;
                }
                var state = mdl.ModelClass.Behavior.StateGroup.States.State;
                if (state instanceof Array) {
                    for (var k = 0; k < state.length; k++) {
                        if(!(state[k].Event instanceof Array)){
                            state[k].Event = [state[k].Event];
                        }
                        for (var i = 0; i < state[k].Event.length; i++) {
                            for(var j = 0; j < dataDecs.length; j++) {
                                if (state[k].Event[i].hasOwnProperty('ResponseParameter')) {
                                    if (state[k].Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if (state[k].Event[i].hasOwnProperty('DispatchParameter')) {
                                    if (state[k].Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if (state[k].Event[i].hasOwnProperty('ControlParameter')) {
                                    if (state[k].Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return callback(null, {
                        States : state,
                        Limited : ms.ms_limited
                    });
                }
                else {
                    for (var i = 0; i < state.Event.length; i++) {
                        for(var j = 0; j < dataDecs.length; j++) {
                            if (state.Event[i].hasOwnProperty('ResponseParameter')) {
                                if (state.Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state.Event[i].hasOwnProperty('DispatchParameter')) {
                                if (state.Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state.Event[i].hasOwnProperty('ControlParameter')) {
                                if (state.Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                        }
                    }
                    var arr = [state];
                    return callback(null, {
                        States : arr,
                        Permission : ms.ms_permission
                    });
                }
            }
            catch (newerr) {
                console.log('Error in data makeup ; ' + newerr);
                return  callback(newerr);
            }
        });
    });
};

ModelSerControl.readMDLByPath = function (path, callback) {
    ModelSerModel.readMDLByPath(path,function (err, data) {
        if(err){
            return callback(err);
        }
        return callback(null,data);
    })
};

ModelSerControl.getMSDetail = function (msid, cb) {
    ModelSerModel.getMSDetail(msid,function (err, rst) {
        err?cb(err):cb(null,rst);
    })
};

ModelSerControl.parseMDLStr = function (mdlStr, callback) {
    ModelSerModel.parseMDLStr(mdlStr,function (err, json) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,json);
        }
    })
};

ModelSerControl.readCfg = function (ms, callback) {
    ModelSerModel.readCfg(ms,function (err, data) {
        if(err){
            return callback(err);
        }
        return callback(null,data);
    });
};

ModelSerControl.readCfgBypath = function (path, callback) {
    ModelSerModel.readCfgBypath(path,function (err, data) {
        if(err){
            return callback(err);
        }
        return callback(null,data);
    });
};

ModelSerControl.getRmtPreparationData = function(host, msid, callback){
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                return callback(null, data);
            });
        }
            });
    }
    }
};

//从门户网站或本机获取runtime节点
ModelSerControl.getRuntimeByPid = function (pid, place, cb) {
    var runtime = {};
    if(place == 'local'){
        ModelSerModel.getByPID(pid,function (err, ms) {
        if(err){
                return cb(err);
            }
            else{
                if(!ms || ms.length ==0)
                    return cb({code:'查不到对应模型！'});
                ms = ms[0];
                ModelSerModel.readMDL(ms,function (err, mdl) {
                if(err){
                        return cb(err);
                }
                                    else{
                        if(!mdl)
                            return cb({code:'解析模型MDL出错！'});
                        ModelSerControl.getRuntimeFromMDL(mdl,function (demands) {
                            return cb(null,demands);
                                    });
                                    }
                })
                                        }
        })
                                    }
    else if(place == 'portal'){
        var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetMDLFromPidServlet?pid=' + pid;
        remoteReqCtrl.getByServer(url,null,function (err, mdlStr) {
                        if (err) {
                return cb(err);
                        }
                        else{
                if(mdlStr && mdlStr != ''){
                    ModelSerControl.parseMDLStr(mdlStr,function (err, mdl) {
                        if(err){
                            return cb(err);
                            }
                            else{
                            ModelSerControl.getRuntimeFromMDL(mdl,function (demands) {
                                return cb(null,demands);
                            })
                                }
                    });
        }
            else{
                    return cb(null,[]);
            }
            }
        })
            }
                    };


                    ModelSerControl.getRuntimeFromMDL = function (mdl, cb) {
    var softDemands = [],hardDemands = [];
    var hardJSON = mdl.ModelClass.Runtime.HardwareConfigures.INSERT;
    var softJSON = mdl.ModelClass.Runtime.SoftwareConfigures.INSERT;
    if(hardJSON == undefined)
        hardJSON = [];
    if(softJSON == undefined)
        softJSON = [];
    for(var i=0;i<hardJSON.length;i++){
        hardDemands.push({name:hardJSON[i].$.name,value:hardJSON[i]._});
            }
    for(var j=0;j<softJSON.length;j++){
        softDemands.push({
            name:softJSON[j].$.name,
            platform:softJSON[j].$.platform == undefined?'':softJSON[j].$.platform,
            version:softJSON[j]._
        });
            }
    cb({
        swe:softDemands,
        hwe:hardDemands
    });
};

ModelSerControl.addDefaultTestify = function (msid, cb) {
    testifyCtrl.addDefaultTestify(msid,ModelSerControl.getInputData,cb);
};