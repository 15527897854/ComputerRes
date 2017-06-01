
var setting = require('../setting');
var fs = require('fs');

var ModelSerRun = require('../model/modelSerRun');
var RemoteReqControl = require('./remoteReqControl');
var Child = require('../model/child');
var ParamCheck = require('../utils/paramCheck');
var controlBase = require('./controlBase');

function ModelSerRunCtrl()
{}

ModelSerRunCtrl.__proto__ = controlBase;
module.exports = ModelSerRunCtrl;
ModelSerRunCtrl.model = ModelSerRun;

//新增模型运行记录
ModelSerRunCtrl.addItem = function (msr, callback) {
    var newmsr = new ModelSerRun(msr);
    ModelSerRun.save(newmsr,function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//根据OID查询模型运行记录
ModelSerRunCtrl.getByOID = function (oid, callback) {
    ModelSerRun.getByOID(oid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
};

//根据GUID查询模型运行记录信息
ModelSerRunCtrl.getByGUID = function (guid, callback) {
    ModelSerRun.getByGUID(guid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
};

//根据MSID查询模型运行记录
ModelSerRunCtrl.getByMSID = function (msid, callback) {
    ModelSerRun.getByMsId(msid, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//得到全部模型运行记录
ModelSerRunCtrl.getAll = function (callback) {
    ModelSerRun.getAll(function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//更新模型运行记录信息
ModelSerRunCtrl.update = function (msr, callback) {
    ModelSerRun.update(msr, function (err, data) {
       if(err)
       {
           return callback(err);
       }
       return callback(null, data);
    });
};

/////////////////////远程

ModelSerRunCtrl.getRmtModelSerRun = function (host, msrid, callback) {
    if(ParamCheck.checkParam(callback, host)){
        if(ParamCheck.checkParam(callback, msrid)){
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/' + msrid + '?token=' + child.access_token, function (err, data) {
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

ModelSerRunCtrl.getAllRmtModelSerRun = function (callback) {
    Child.getAll(function(err, children){
        if(err)
        {
            return callback(err);
        }
        if(children.length == 0)
        {
            return callback(null, [])
        }
        var count = 0;
        var pending = function(index)
        {
            count ++;
            return function (err, data)
            {
                count --;
                if(err)
                {
                    children[index].ping = 'err';
                    children[index].err = err;
                }
                else
                {
                    children[index].ping = 'suc';
                    children[index].msr = data;
                }
                if(count == 0)
                {
                    return callback(null, children);
                }
            }
        };

        for(var i = 0; i < children.length; i++)
        {
            RemoteReqControl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelserrun/json/all?token=' + children[i].access_token, pending(i));
        }
    });
};