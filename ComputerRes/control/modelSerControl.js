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
var GeoDataCtrl = require('../control/geoDataControl');

var ModelSerControl = function () {};
ModelSerControl.__proto__ = ControlBase;

module.exports = ModelSerControl;

////////////////远程服务

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function(callback){
    Child.getAll(function (err, childMs) {
        if(err)
        {
            return callback(err);
        }

        if(childMs.length == 0)
        {
            return callback(null, [])
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
                        childMs[index].ping = 'suc';
                        childMs[index].ms = data;
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
            remoteReqCtrl.getRequestJSON('http://' + childMs[i].host + ':' + childMs[i].port + '/modelser/json/all', done(i));
        }
    });
};

//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMis = function (headers, callback) {
    Child.getAll(function (err, children) {
        if(err)
        {
            return callback(err);
        }

        var pending = (function (i, host) {
            count++;
            return function (err, mis) {
                count --;
                if(!err)
                {
                    children[i].mis = mis;
                }
                if(count == 0)
                {
                    return callback(null, children[i]);
                }
            }
        });

        var count = 0;
        for(var i = 0; i < children.length; i++)
        {
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelins/json/all', pending(i));
        }
    });
};

//查询某个子节点某个模型服务运行实例
ModelSerControl.getRmtMis = function(host, guid, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, guid))
        {
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/' + guid, this.returnFunction(callback, "error in get rmt model service instance"));
                }
            }.bind(this));
        }
    }
};

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (host, msid, callback) {
    ParamCheck.checkParam(callback, host);
    ParamCheck.checkParam(callback, msid);
    Child.getByHost(host, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, this.returnFunction(callback, "error in get rmt model service"));
    }.bind(this));
};

//启动远程模型
ModelSerControl.startRmtModelSer = function (host, msid, callback) {
    ParamCheck.checkParam(callback, host);
    ParamCheck.checkParam(callback, msid);
    Child.getByHost(host, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=start', this.returnFunction(callback, "error in get rmt model service"));
    }.bind(this));
};

//关闭远程模型
ModelSerControl.stopRmtModelSer = function (host, msid, callback) {
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, msid))
        {
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=stop', this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//获取远程模型输入信息
ModelSerControl.getRmtInputDate = function (host, msid, callback) {
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, msid))
        {
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/inputdata/json/' + msid , this.returnFunction(callback, "error in get input data of rmt model service"));
                }
            }.bind(this));
        }
    }
};

//运行远程模型
ModelSerControl.runRmtModelSer = function(host, msid, inputdata, outputdata, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, host))
        {
            Child.getByHost(host, function(err, child){
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid +  '?ac=run&inputdata=' + inputdata + '&outputdata=' + outputdata, function(err, data)
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
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, msid))
        {
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                remoteReqCtrl.deleteRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid , this.returnFunction(callback, "error in get input data of rmt model service"));
            }.bind(this));
        }
    }
};

//远程上传模型
ModelSerControl.postRmtModelSer = function(req, host, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        Child.getByHost(host, function (err, child) {
            if(err)
            {
                return callback(err);
            }
            remoteReqCtrl.postRequest(req, 'http://' + child.host + ':' + child.port + '/modelser/' + req.sessionID , this.returnFunction(callback, "error in get input data of rmt model service"));
        }.bind(this));
    }
};

//远程查看图像
ModelSerControl.getRmtImg = function(host, imgname, res, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, imgname))
        {
            Child.getByHost(host, function(err, child){
                if(err)
                {
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
        fs.createReadStream(files.file_model.path).pipe(unzip.Extract({path: model_path}))
            .on('close',function () {
                //添加默认测试数据，不用异步请求，两者不相关
                ModelSerControl.addDefaultTestify(oid.toString());

                //
                if(setting.platform == 2)
                {
                    //
                    ModelSerModel.readCfgBypath(model_path + 'package.config', function (err, cfg) {
                        if(err) {

                        }
                        else
                        {
                            FileOpera.chmod(model_path + cfg.start, 'exec');
                        }
                    });
                }
            });

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
    ModelSerModel.getByOID(ms_id, function(err, ms)
    {
        if(err)
        {
            return callback(err);
        }
        if(ms.ms_status != 1)
        {
            return callback({
                Error : -1,
                Message : 'Service is not available'
            });
        }
        ModelSerModel.run(ms_id, guid, function (err, stdout, stderr) {
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
                    item.msr_des += 'Error Message : ' + JSON.stringify(err) + '\r\n';
                }
                if(stdout){
                    item.msr_des += 'Stand Output Message : ' + JSON.stringify(stdout) + '\r\n';
                }
                if(stderr){
                    item.msr_des += 'Stand Error Message : ' + JSON.stringify(stderr) + '\r\n';
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
                    ModelSerRunModel.updateDes(item._id, item.msr_des, function (err, res) {
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
            return callback(null, ms);
        });
    });

};

//获取所有门户网站模型服务
ModelSerControl.getCloudModelsers = function(callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.gate.host + ':' + setting.gate.port + '/GeoModeling/ModelItemToContainerServlet', this.returnFunction(callback, 'error in get cloud model service'));
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
                var dataDecs = null;
                if(mdl.ModelClass.Behavior.RelatedDatasets != null)
                {
                    dataDecs = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
                }
                else if(mdl.ModelClass.Behavior.DatasetDeclarations != null)
                {
                    dataDecs = mdl.ModelClass.Behavior.DatasetDeclarations.DatasetDeclaration;
                }
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
                                        if(dataDecs[j].UDXDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if(dataDecs[j].UdxDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if(state[k].Event[i].hasOwnProperty('DispatchParameter'))
                                {
                                    if (state[k].Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name)
                                    {
                                        if(dataDecs[j].UDXDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if(dataDecs[j].UdxDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if(state[k].Event[i].hasOwnProperty('ControlParameter'))
                                {
                                    if (state[k].Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name)
                                    {
                                        if(dataDecs[j].UDXDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if(dataDecs[j].UdxDeclaration)
                                        {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
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
                                    if(dataDecs[j].UDXDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if(dataDecs[j].UdxDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if(state.Event[i].hasOwnProperty('DispatchParameter'))
                            {
                                if (state.Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name)
                                {
                                    if(dataDecs[j].UDXDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if(dataDecs[j].UdxDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if(state.Event[i].hasOwnProperty('ControlParameter'))
                            {
                                if (state.Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name)
                                {
                                    if(dataDecs[j].UDXDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if(dataDecs[j].UdxDeclaration)
                                    {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
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

ModelSerControl.getRmtPreparationData = function(host, msid, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, msid))
        {
            Child.getByHost(host, function(err, child)
            {
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, function(err, data)
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

//将testify文件夹下的测试数据添加到config.json中，同时将测试数据记录在redis中，将数据复制到geo_data中
ModelSerControl.addDefaultTestify = function (msid) {
    var testifyRoot = __dirname + '/../geo_model/' + msid + '/testify';
    var configPath = __dirname + '/../geo_model/' + msid + '/testify/config.json';
    var configData;
    fs.stat(configPath,function (err, stat) {
        if(err){
            if(err.code = 'ENOENT'){
                configData = '[]';
            }
            else{
                return
            }
        }
        else if(stat){
            configData = fs.readFileSync(configPath).toString();
        }
        var configJSON = JSON.parse(configData);
        for(var i=0;i<configJSON.length;i++){
            if(configJSON[i].tag == 'default'){
                //已经生成过默认测试数据
                return
            }
        }
        //得到testify一级目录下的所有xml
        FileOpera.getAllFiles(testifyRoot,'.xml',function (files) {
            ModelSerControl.getInputData(msid,function (err, states) {
                if(err){
                    return;
                }
                var newTestify = {
                    tag:'default',
                    detail:'',
                    path:'',
                    inputs:[]
                };
                var geodataList = [];
                for(var i=0;i<states.length;i++){
                    var stateID = states[i].$.id;
                    var events = states[i].Event;
                    for(var j=0;j<events.length;j++){
                        for(var k=0;k<files.length;k++){
                            //TODO 针对博文的所有测试数据都是input的情况
                            if(events[j].$.name + '.xml' == files[k] && events[j].$.type == 'response'){
                                //复制文件
                                var gdid = 'gd_' + uuid.v1();
                                var fname = gdid + '.xml';
                                var geo_data_Path = __dirname + '/../geo_data/' + fname;
                                var gd_value = fs.readFileSync(testifyRoot + '/' + files[i]).toString();
                                fs.writeFileSync(geo_data_Path, gd_value);
                                //向config.json中添加记录
                                newTestify.inputs.push({
                                    DataId:gdid,
                                    Event:events[j].$.name,
                                    Optional:events[j].$.optional,
                                    StateId:stateID
                                });

                                var stat = fs.statSync(geo_data_Path);
                                var geodata;
                                if(stat.size - 16>setting.data_size){
                                    geodata = {
                                        gd_id:gdid,
                                        gd_tag:'',
                                        gd_type:'FILE',
                                        gd_value:fname
                                    };
                                }
                                else{
                                    geodata = {
                                        gd_id:gdid,
                                        gd_tag:'',
                                        gd_type:'STREAM',
                                        gd_value:gd_value
                                    }
                                }
                                geodataList.push(geodata);
                            }
                        }
                    }
                }
                var addFile = function (i) {
                    //向redis中添加记录
                    GeoDataCtrl.addData(geodataList[i],function (err, rst) {
                        if(err){return}
                        else{
                            if(i == geodataList.length-1){
                                //没有出错在向config.json中添加记录
                                configJSON.push(newTestify);
                                fs.writeFileSync(configPath,JSON.stringify(configJSON));
                            }
                            else{
                                addFile(i+1);
                            }
                        }
                    });
                };
                addFile(0);
            });
        });
    });
};

ModelSerControl.addTestify = function (msrid,testifyData,callback) {
    ModelSerRunModel.getByOID(msrid,function (err, msr) {
        if(err){
            return callback(err);
        }
        var configRoot = __dirname + '/../geo_model/' + msr.ms_id + '/testify';
        var configPath = configRoot + '/config.json';
        fs.stat(configPath,function (err, stat) {
            var configJSON;
            if(stat && !err){
                var configData = fs.readFileSync(configPath).toString();
                if(configData == ""){
                    configData = "[]";
                }
                configJSON = JSON.parse(configData);
                //判断是否已添加该测试记录
                for(var i=0;i<configJSON.length;i++){
                    if(configJSON[i].DataId == msrid){
                        return callback(null,{suc:true,status:2});
                    }
                }
            }
            else if(err.code = 'ENOENT'){
                configJSON = [];
            }
            else{
                callback(err);
            }
            var newTestify = configRoot + '/' + msrid;
            try{
                fs.mkdirSync(newTestify);
            }
            catch(e){
                if(e.code!='EEXIST')
                    return callback(err);
            }
            for(var i=0;i<msr.msr_input.length;i++){
                if(msr.msr_input[i].DataId != "") {
                    var srcPath = __dirname + '/../geo_data/' + msr.msr_input[i].DataId + '.xml';
                    var dstPath = newTestify + '/' + msr.msr_input[i].DataId + '.xml';
                    try{
                        var srcData = fs.readFileSync(srcPath).toString();
                        fs.writeFileSync(dstPath,srcData);
                    }
                    catch(e){
                        callback(e);
                    }
                }
            }


            //添加记录
            testifyData.inputs = [];
            for(var i=0;i<msr.msr_input.length;i++){
                if(msr.msr_input[i].DataId!=""){
                    var input = {
                        DataId:msr.msr_input[i].DataId,
                        Event:msr.msr_input[i].Event,
                        Optional:msr.msr_input[i].Optional,
                        StateId:msr.msr_input[i].StateId
                    };
                    testifyData.inputs.push(input);
                }
            }
            configJSON.push(testifyData);
            fs.writeFile(configPath,JSON.stringify(configJSON),function (err) {
                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null,{suc:true,status:1});
            })
        })
    })
};

ModelSerControl.getTestify = function (msid, callback) {
    var configPath = __dirname + '/../geo_model/' + msid + '/testify/config.json';
    fs.stat(configPath,function (err, stat) {
        var rst;
        if(err){
            if(err.code = 'ENOENT'){
                rst = {status:0,testifies:[]};
            }
            else{
                rst = {status:-1};
            }
        }
        else if(stat){
            var testifyData = fs.readFileSync(configPath).toString();
            rst = {status:1,testifies:JSON.parse(testifyData)};
        }
        rst = JSON.stringify(rst);
        callback(rst);
    })
};

ModelSerControl.delTestify = function (msid,testifyPath, callback) {
    var testifyFolder = __dirname + '/../geo_model/' + msid + '/testify/' + testifyPath;
    var configPath = __dirname + '/../geo_model/' + msid + '/testify/config.json';
    var configData = fs.readFileSync(configPath).toString();
    var configJSON = JSON.parse(configData);
    try{
        //删除记录
        for(var i=0;i<configJSON.length;i++){
            if(testifyPath == configJSON[i].path){
                configJSON.splice(i,1);
                break;
            }
        }
        fs.writeFileSync(configPath,JSON.stringify(configJSON));
        //删除文件
        FileOpera.rmdir(testifyFolder);
        callback(JSON.stringify({suc:true}));
    }
    catch(e){
        return callback(JSON.stringify({suc:false}));
    }
};