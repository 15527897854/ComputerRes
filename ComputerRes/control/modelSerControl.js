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

var setting = require('../setting');
var ModelSerModel = require('../model/modelService');
var ModelSerRunModel = require('../model/modelSerRun');
var FileOpera = require('../utils/fileOpera');
var Child = require('../model/child');
var remoteReqCtrl = require('./remoteReqControl');
var ControlBase = require('./controlBase');
var ParamCheck = require('../utils/paramCheck');

var ModelSerControl = function () {};
ModelSerControl.__proto__ = ControlBase;

module.exports = ModelSerControl;

//搜索子节点模型服务信息信息 scr
ModelSerControl.getChildInfo = function (req,routePath,callback) {
    Child.getAll(function (err, childMs) {
        var reqOne = function (index) {
            url = 'http://' + childMs[index].host + ':' + childMs[index].port + routePath;
            remoteReqCtrl.getRequest(req,url,function (err, data) {
                if(err){
                    childMs[index].ping = 'err';
                }
                else{
                    if(typeof data == 'string'){
                        data = JSON.parse(data);
                    }
                    childMs[index].ping = 'suc';
                    if(routePath == '/modelserrun/json/all')
                        childMs[index].msr = data;
                    else if(routePath == '/modelser/json/rmtall')
                        childMs[index]._doc.ms = data;
                }
                if(index<childMs.length-1)
                    reqOne(index+1);
                else if(index == childMs.length-1)
                    callback(null,childMs);
            });
        };
		if(childMs.length == 0)
		{
			return callback(null, []);
		}
        reqOne(0);
    })
};

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function(headers, callback){
    Child.getAll(function (err, childMs) {
        if(err)
        {
            return callback(err);
        }
        var pending = (function (pcallback) {
            var count = 0;
            return function(index)
            {
                count ++;
                return function (err, data) {
                    count --;
                    if(err)
                    {
                        childMs[index].ping = 'err';
                    }
                    else
                    {
                        if(data[0] == '[' && data[data.length - 1] == ']')
                        {
                            childMs[index].ping = 'suc';
                            childMs[index].ms = data;
                        }
                        else
                        {
                            childMs[index].ping = 'err';
                        }
                    }
                    if(count == 0)
                    {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, childMs);
        });

        for(var i = 0; i < childMs.length; i++)
        {
            var options = {
                host: childMs[i].host,
                port: childMs[i].port,
                path: '/modelser/json/rmtall',
                method: 'GET'
            };
            remoteReqCtrl.Request(options, null, done(i));
        }
    });
}

//搜做子节点的模型服务运行记录
ModelSerControl.getChildMSR = function (headers, callback) {
    Child.getAll(function (err, childMsr) {
        if(err){
            return callback(err);
        }
        var pending = (function (pcallback) {
            var count = 0;
            return function(index)
            {
                count ++;
                return function (err, data) {
                    count --;
                    if(err)
                    {
                        childMsr[index].ping = 'err';
                    }
                    else
                    {
                        if(data[0] == '[' && data[data.length - 1] == ']')
                        {
                            childMsr[index].ping = 'suc';
                            childMsr[index].msr = data;
                        }
                        else
                        {
                            childMsr[index].ping = 'err';
                        }
                    }
                    if(count == 0)
                    {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, childMsr);
        });

        for(var i = 0; i < childMsr.length; i++)
        {
            var options = {
                host: childMsr[i].host,
                port: childMsr[i].port,
                path: '/modelserrun/json/all',
                method: 'GET'
            };
            remoteReqCtrl.Request(options, null, done(i));
        }
    });
}

//搜做子节点的模型服务运行实例
ModelSerControl.getChildMSRI = function (headers, callback) {
    Child.getAll(function (err, childMsri) {
        if(err){
            return callback(err);
        }
        var pending = (function (pcallback) {
            var count = 0;
            return function(index)
            {
                count ++;
                return function (err, data) {
                    console.log('data in get child MSRI\n' + JSON.stringify(data));
                    count --;
                    if(err)
                    {
                        childMsri[index].ping = 'err';
                    }
                    else
                    {
                        if(data[0] == '[' && data[data.length - 1] == ']')
                        {
                            childMsri[index].ping = 'suc';
                            childMsri[index].msri = JSON.parse(data);
                        }
                        else
                        {
                            childMsri[index].ping = 'err';
                        }
                    }
                    if(count == 0)
                    {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, childMsri);
        });

        for(var i = 0; i < childMsri.length; i++)
        {
            var options = {
                host: childMsri[i].host,
                port: childMsri[i].port,
                path: '/modelins/json/all',
                method: 'GET'
            };
            remoteReqCtrl.Request(options, null, done(i));
        }
    });
}

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (cid, msid, callback) {
    Child.getByOID(cid, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        var options = {
            host: child.host,
            port: child.port,
            path: '/modelser/json/' + msid,
            method: 'GET'
        };
        remoteReqCtrl.Request(options, null, function (err, data) {
            if(err)
            {
                return callback(err);
            }
            return callback(null, data);
        });
    });
}

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSer = function(callback){
    ModelSerModel.getAll('AVAI', this.returnFunction(callback, 'error in getting all model services'));
};

//新增模型服务
ModelSerControl.addNewModelSer = function(fields, files, callback){
    ModelSerControl.parseConfig(files.file_model.path, function (config, fileStruct) {
        if( !config.host || !config.port || !config.start || !config.mdl){
            return callback({
                message : '长传的压缩包不包含config文件或config文件结构不正确！',
                code : -101
            });
        }
        else if(!fileStruct.model || !fileStruct.mdl || !fileStruct.start){
            //文件结构不对
            //删除文件
            fs.unlinkSync(files.file_model.path);
            return callback({
                message : '上传文件结构不正确！',
                code : -102
            });
        }
        //通过验证
        var date = new Date();
        var img = null;
        if(files.ms_img.size != 0)
        {
            img = uuid.v1() + path.extname(files.ms_img.path);
            fs.renameSync(files.ms_img.path, setting.modelpath + '../public/images/modelImg/' + img);
        }
        else
        {
            FileOpera.rmdir(files.ms_img.path);
        }

        //产生新的OID
        var oid = new ObjectId();

        //解压路径
        var model_path = setting.modelpath + oid.toString() + '/';

        //解压
        fs.createReadStream(files.file_model.path).pipe(unzip.Extract({path: model_path}));

        //删除文件
        FileOpera.rmdir(files.file_model.path);

        //生成新的纪录
        var newmodelser = {
            _id : oid,
            ms_model : {
                m_name:fields.m_name,
                m_type:fields.m_type,
                m_url:fields.m_url
            },
            ms_limited:fields.ms_limited,
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

        var ms = new ModelSerModel(newmodelser);
        ms.save(this.returnFunction(callback, 'error in inserting a model service'));
    }.bind(this));

};

//将记录放置在回收站
//并删除文件
ModelSerControl.deleteToTrush = function (_oid, callback) {
    ModelSerModel.getByOID(_oid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        item.ms_status = -1;
        ModelSerModel.update(item, function (err, mess) {
            if(err)
            {
                return callback(err);
            }
            //删除文件
            FileOpera.rmdir(setting.modelpath + item.ms_path);
            return callback(null, item);
        });
    });
};

//根据OID查询模型服务信息
ModelSerControl.getByOID = function(msid, callback){
    ModelSerModel.getByOID(msid,function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//更新模型服务信息
ModelSerControl.update = function(ms, callback){
    ModelSerModel.update(ms, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//开启运行实例
ModelSerControl.run = function (ms_id, guid, callback) {
    ModelSerModel.run(ms_id, guid, function (err, stdout, stderr) {
        ModelSerRunModel.getByGUID(guid, function (err2, item) {
           if(err2)
           {
               return console.log(JSON.stringify(err2));
           }
           if(err){
               item.msr_des += 'Error Message : ' + JSON.stringify(err) + '\r\n';
            }
           if(stdout){
               item.msr_des += 'Stand Output Message : ' + JSON.stringify(stdout) + '\r\n';
           }
           if(stderr){
               item.msr_des += 'Stand Error Message : ' + JSON.stringify(stderr) + '\r\n';
           }
           global.app.modelInsColl.removeByGUID(guid);
           ModelSerRunModel.update(item, function (err, res) {
               if(err)
               {
                   return console.log(JSON.stringify(err2));
               }
           })
        });
    }, function (err, ms) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, ms);
    })
};

//得到初始输入数据
ModelSerControl.getInputData = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if(err)
        {
            return callback(err);
        }
        ModelSerModel.readMDL(ms, function (err, mdl) {
            if(err)
            {
                return callback(err);
            }
            try
            {
                var dataDecs = mdl.ModelClass.Behavior.DatasetDeclarations.DatasetDeclaration;
                var state = mdl.ModelClass.Behavior.StateGroup.States.State;
                if(state instanceof Array)
                {
                    for(var k = 0; k < state.length; k++)
                    {
                        for(var i = 0; i < state[k].Event.length; i++)
                        {
                            for(var j = 0; j < dataDecs.length; j++) {
                                if(state[k].Event[i].hasOwnProperty('ResponseParameter'))
                                {
                                    if (state[k].Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name)
                                    {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j].UDXDeclaration;
                                    }
                                }
                                else if(state[k].Event[i].hasOwnProperty('DispatchParameter'))
                                {
                                    if (state[k].Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name)
                                    {
                                        state[k].Event[i].UDXDeclaration = dataDecs[j].UDXDeclaration;
                                    }
                                }
                            }
                        }
                    }
                    return callback(null, state);
                }
                else
                {
                    for(var i = 0; i < state.Event.length; i++)
                    {
                        for(var j = 0; j < dataDecs.length; j++) {
                            if(state.Event[i].hasOwnProperty('ResponseParameter'))
                            {
                                if (state.Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name)
                                {
                                    state.Event[i].UDXDeclaration = dataDecs[j].UDXDeclaration;
                                }
                            }
                            else if(state.Event[i].hasOwnProperty('DispatchParameter'))
                            {
                                if (state.Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name)
                                {
                                    state.Event[i].UDXDeclaration = dataDecs[j].UDXDeclaration;
                                }
                            }
                        }
                    }
                    var arr = [state];
                    return callback(null, arr);
                }
                return callback(null, state);
            }
            catch (newerr)
            {
                console.log('Error in data makeup ; ' + newerr);
                return  callback(newerr);
            }
        });
    });
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

ModelSerControl.parseConfig = function (path, callback) {
    var config = {
        host : "",
        port : "",
        start : "",
        type : "",
        mdl : "",
        testdata : "",
        engine : ""
    };
    fs.createReadStream(path)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path.split('/');
            if (fileName[fileName.length - 1] === 'package.config') {
                fs.exists(__dirname + '/../public/tmp/',function (exists) {
                    if (!exists) {
                        fs.mkdir(__dirname + '/../public/tmp/');
                    }
                    var path = __dirname + '/../public/tmp/' + Date.parse(new Date())+'.config';
                    entry.pipe(fs.createWriteStream(path));
                    ModelSerControl.readCfgBypath(path,function (err, cfg) {
                        config = cfg;
                        console.log('--------------------------------------------\n'+JSON.stringify(config));
                        fs.exists(path, function (exist) {
                            if(exist){
                                fs.unlink(path);
                            }
                        });
                    });
                });
            }
            else {
                entry.autodrain();
            }
        })
        .on('close',function () {
            if( config.host && config.port && config.start && config.mdl){
                ModelSerControl.parseUploadFile(path,config,callback);
            }
            else if(config){
                fs.unlinkSync(path);
                callback(config,null);
            }
        });
};

ModelSerControl.parseUploadFile = function(path,config,callback){
    var fileStruct = {
        model : 0,
        testify : 0,
        start : 0,
        mdl : 0,
        config : 0
    };
    fs.createReadStream(path)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path;
            if(fileName == 'model/' ){
                fileStruct.model = 1;
            }
            else if(fileName == 'testify/'){
                fileStruct.testify = 1;
            }
            else if(fileName == config.start){
                fileStruct.start = 1;
            }
            else if(fileName == config.mdl){
                fileStruct.mdl = 1;
            }
            entry.autodrain();
        })
        .on('close',function () {
            fileStruct.config = 1;
            callback(config, fileStruct);
        });
};

//根据MID查询
// ModelSerControl.getByMID(mid, function (err, item) {
//     return callback(err, item);
// });