/**
 * Created by Franklin on 16-3-27.
 * Control fot ModelService
 */
var setting = require('../setting');
var http = require('http');
var fs = require('fs');
var rimraf = require('rimraf');

var ModelSerModel = require('../model/modelService');
var File = require('../model/fileOpera');
var Child = require('../model/child');
var remoteReqCtrl = require('./remoteReqControl');

function ModelSerControl()
{}

module.exports = ModelSerControl;

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function(headers, callback)
{
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
                path: '/modelser/json/all',
                method: 'GET'
            };
            remoteReqCtrl.Request(options, null, done(i));
        }
    });
}

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (cid, msid, callback) {

}

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSer = function(callback)
{
    ModelSerModel.getAll('AVAI', function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//新增模型服务
ModelSerControl.addNewModelSer = function(newmodelser, callback)
{
    var ms = new ModelSerModel(newmodelser);
    ms.save(function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
}

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
            File.deleteDir(setting.modelpath + item.ms_path);
            return callback(null, item);
        });
    });
}

//根据OID查询模型服务信息
ModelSerControl.getByOID = function(msid, callback)
{
    ModelSerModel.getByOID(msid,function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//更新模型服务信息
ModelSerControl.update = function(ms, callback)
{
    ModelSerModel.update(ms, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//开启运行实例
ModelSerControl.run = function (ms_id, guid, callback) {
    ModelSerModel.run(ms_id, guid, function (err, ms) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, ms);
    })
}

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
                return callback(null, state);
            }
            catch (newerr)
            {
                console.log('Error in data makeup ; ' + newerr);
                return  callback(newerr);
            }
        });
    });
}