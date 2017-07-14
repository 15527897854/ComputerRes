/**
 * Created by Franklin on 16-4-5.
 * model for ModelService
 */

var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var exec = require('child_process').exec;
var xmlparse = require('xml2js').parseString;
var setting = require('../setting');
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');

//ModelService模型
function ModelService(modelser)
{
    if(modelser != null)
    {
        this._id = modelser._id;
        this.ms_model = modelser.ms_model;
        this.mv_num = modelser.mv_num;
        this.ms_des = modelser.ms_des;
        this.ms_platform = modelser.ms_platform;
        this.ms_update = modelser.ms_update;
        this.ms_path = modelser.ms_path;
        this.ms_img = modelser.ms_img;
        this.ms_xml = modelser.ms_xml;
        this.ms_status = modelser.ms_status;
        this.ms_user = modelser.ms_user;
        this.ms_limited = modelser.ms_limited;
    }
    else
    {
        this._id = new ObjectId();
        this.ms_model = '';
        this.mv_num = '';
        this.ms_des = '';
        this.ms_update = '';
        this.ms_path = '';
        this.ms_xml = '';
        this.ms_status = 0;
        this.ms_user = '';
        this.ms_limited = 0;
    }
    return this;
}

ModelService.__proto__ = ModelBase;
module.exports = ModelService;

var msSchema = new mongoose.Schema({
    ms_model : mongoose.Schema.Types.Mixed,
    mv_num : String,
    ms_des : String,
    ms_update : String,
    ms_platform : Number,
    ms_path : String,
    ms_xml : String,
    ms_status : Number,
    ms_limited : Number,    //权限：是否只能该节点可用，父节点不可用。
    ms_user : mongoose.Schema.Types.Mixed,
    ms_img : String
},{collection:'modelservice'});
var MS = mongoose.model('modelservice',msSchema);
ModelService.baseModel = MS;
ModelService.modelName = "model service";

//根据计算服务器获取模型服务
ModelService.getAll = function(flag, callback){
    if(ParamCheck.checkParam(callback, flag))
    {
        var where = {};
        if(flag == 'ALL'){
            where = {};
        }
        else{
            where = { ms_status : { $ne : -1 }}
        }
        MS.find(where, this.returnFunction(callback, 'Error in getting all model service'));
    }
};

//通过PID查询
ModelService.getByPid = function (pid, callback) {
    if(ParamCheck.checkParam(callback, pid))
    {
        var where = { "ms_model.p_id" : pid, "ms_status" : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//通过MID查询
ModelService.getByMID = function (mid, callback) {
    if(ParamCheck.checkParam(callback, mid))
    {
        var where = { "ms_model.m_id" : mid, "ms_status" : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//通过PID查询
ModelService.getByPID = function (mid, callback) {
    if(ParamCheck.checkParam(callback, mid))
    {
        var where = { "ms_model.p_id" : mid, "ms_status" : {$ne:-1}};
        this.getByWhere(where, callback);
    }
};

//启动一个模型服务实例
ModelService.run = function (ms_id, guid, exeoutcb, callback) {
    if(ParamCheck.checkParam(callback, ms_id)){
        if(ParamCheck.checkParam(callback, guid)){
            ModelService.getByOID(ms_id, function (err, ms) {
                if (err) {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, ms))
                {
                    ModelService.readCfg(ms, function (err, cfg) {
                        if (err) {
                            return callback(err);
                        }
                        //执行程序
                        var cmd;
                        if (cfg.type == 'exe') {
                            cmd = setting.modelpath + ms.ms_path + cfg.start + '  ' + guid;
                        }
                        else if (cfg.type == 'java') {
                            cmd = 'java -jar ' + setting.modelpath + ms.ms_path + cfg.start + '  ' + guid;
                        }
                        else if (cfg.type == 'lnx') {
                            cmd = setting.modelpath + ms.ms_path + cfg.start + '  ' + guid;
                        }
                        else if (cfg.type == 'sh') {
                            cmd ='sh ' +  setting.modelpath + ms.ms_path + cfg.start + '  ' + guid;
                        }
                        else {
                            cmd = setting.modelpath + ms.ms_path + cfg.start + '  ' + guid;
                        }
                        console.log('ModelService Run CMD : ' + cmd);
                        exec(cmd, {
                            cwd: setting.modelpath + ms.ms_path
                        }, exeoutcb);
                        return callback(null, ms);
                    });
                }
            }.bind(this));
        }
    }
};

//读取MDL文件
ModelService.readMDL = function (ms, callback) {
    if(ParamCheck.checkParam(callback, ms))
    {
        ModelService.readCfg(ms, function (err, cfg) {
            if(err)
            {
                return callback(err);
            }
            fs.readFile(__dirname + '/../geo_model/' + ms.ms_path + cfg.mdl, function (err, data) {
                if(err)
                {
                    console.log('Error in read mdl file : ' + err);
                    return callback(err);
                }
                var mdl = xmlparse(data, { explicitArray : false, ignoreAttrs : false }, function (err, json) {
                    if(err)
                    {
                        console.log('Error in parse mdl file : ' + err);
                        return callback(err);
                    }
                    return callback(null, json);
                });
            })
        });
    }
};

ModelService.getMSDetail = function(msid, cb){
    ModelService.getByOID(msid, function (err, ms) {
        if (err) {
            return cb(err);
        }
        ModelService.readMDL(ms,function (err, mdlJSON) {
            if(err)
                return cb(err);
            return cb(null,{
                MS:ms,
                MDL:mdlJSON
            });
        })
    });
};

ModelService.readMDLByPath = function (path, callback) {
    fs.readFile(path, function (err, data) {
        if(err)
        {
            console.log('Error in read mdl file : ' + err);
            return callback(err);
        }
        var mdl = xmlparse(data, { explicitArray : false, ignoreAttrs : false }, function (err, json) {
            if(err)
            {
                console.log('Error in parse mdl file : ' + err);
                return callback(err);
            }
            return callback(null, json);
        });
    })
};

ModelService.parseMDLStr = function (mdlStr, callback) {
    xmlparse(mdlStr, { explicitArray : false, ignoreAttrs : false }, function (err, json) {
        if(err)
        {
            console.log('Error in parse mdl file : ' + err);
            return callback(err);
        }
        return callback(null, json);
    });
};

//读取config文件
ModelService.readCfg = function (ms, callback) {
    if(ParamCheck.checkParam(callback, ms))
    {
        fs.readFile(__dirname + '/../geo_model/' + ms.ms_path + 'package.config', 'utf-8',function(err,data){
            if(err){
                console.log('Error in read config file : ' + err);
                return callback(err);
            }
            else{
                var cfg = {
                    host : "",
                    port : "",
                    start : "",
                    type : "",
                    mdl : "",
                    testdata : "",
                    engine : ""
                };
                var params = data.split('\r\n');
                for(var i = 0; i < params.length; i++)
                {
                    params[i] = params[i].split(' ');
                    switch (params[i][0])
                    {
                        case 'host':
                        {
                            cfg.host = params[i][1];
                            break;
                        }
                        case 'port':
                        {
                            cfg.port = params[i][1];
                            break;
                        }
                        case 'start':
                        {
                            if(params[i].length < 2)
                            {
                                break;
                            }
                            cfg.start = params[i][1];
                            for(var j = 2; j < params[i].length; j++)
                            {
                                cfg.start = cfg.start + ' ' + params[i][j];
                            }
                            break;
                        }
                        case 'mdl':
                        {
                            cfg.mdl = params[i][1];
                            break;
                        }
                        case 'testdata':
                        {
                            cfg.testdata = params[i][1];
                            break;
                        }
                        case 'engine':
                        {
                            cfg.engine = params[i][1];
                            break;
                        }
                        case 'type':
                        {
                            cfg.type = params[i][1];
                            break;
                        }
                    }
                }
                return callback(null, cfg);
            }
        });
    }
};

//读取config文件
ModelService.readCfgBypath = function (path, callback) {
    if(ParamCheck.checkParam(callback, path)){
        fs.readFile(path, 'utf-8',function(err, data){
            if(err){
                console.log('Error in read config file : ' + err);
                return callback(err);
            }
            else{
                var cfg = {
                    host : "",
                    port : "",
                    start : "",
                    type : "",
                    mdl : "",
                    testdata : "",
                    engine : ""
                };
                var params = data.split('\r\n');
                for(var i = 0; i < params.length; i++)
                {
                    params[i] = params[i].split(' ');
                    switch (params[i][0])
                    {
                        case 'host':
                        {
                            cfg.host = params[i][1];
                            break;
                        }
                        case 'port':
                        {
                            cfg.port = params[i][1];
                            break;
                        }
                        case 'start':
                        {
                            if(params[i].length < 2)
                            {
                                break;
                            }
                            cfg.start = params[i][1];
                            for(var j = 2; j < params[i].length; j++)
                            {
                                cfg.start = cfg.start + ' ' + params[i][j];
                            }
                            break;
                        }
                        case 'mdl':
                        {
                            cfg.mdl = params[i][1];
                            break;
                        }
                        case 'testdata':
                        {
                            cfg.testdata = params[i][1];
                            break;
                        }
                        case 'engine':
                        {
                            cfg.engine = params[i][1];
                            break;
                        }
                        case 'type':
                        {
                            cfg.type = params[i][1];
                            break;
                        }
                    }
                }
                return callback(null, cfg);
            }
        });
    }
};