/**
 * Created by Franklin on 16-3-27.
 * Control fot ModelService
 */
var setting = require('../setting');
var http = require('http');
var fs = require('fs');

var ModelSerModel = require('../model/modelService');
var romoteReqCtrl = require('./remoteReqControl');

function ModelSerControl()
{

}

module.exports = ModelSerControl;

//搜索门户网站服务器信息
ModelSerControl.getRemoteModelSer = function(headers,callback)
{
    romoteReqCtrl.Request(
        setting.gate.host,
        setting.gate.port,
        '/modelser/comres/json/' + setting.oid,
        'GET',
        headers,
        function(err, data)
        {
            if(err)
            {
                return callback(err);
            }
            return callback(null, data);
        }
    );
}

//搜寻本地模型信息
ModelSerControl.getLocalModelSer = function(callback)
{
    ModelSerModel.getAll(0, 0, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//根据msid查询模型信息
ModelSerControl.getModelSerByMsId = function(msid, callback)
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

//新增模型服务
ModelSerControl.addNewModelSer = function(newmodelser, callback)
{
    //请求参数
    var options = {
        host: setting.gate.host,
        port: setting.gate.port,
        path: '/modelser',
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    //像门户网站发送登记信息
    romoteReqCtrl.Request(
        options,
        newmodelser,
        function(err, data)
        {
            if(err)
            {
                return callback(err);
            }
            var ms = new ModelSerModel(data);
            ms.save(function(err, data)
            {
                var path = __dirname + '\\..\\geo_model\\' + data._id + '\\';
                fs.mkdirSync(path);
                return callback(null, data);
            });
        }
    );
}

ModelSerControl.fileTraverse = function(path, callback)
{
    fs.readdir(path, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }

        for(var i = 0; i < data.length; i++)
        {
            var tmpfile = path + data[i];
            var tmpsta = fs.statSync(tmpfile);
            if(tmpsta.isDirectory())
            {
                data[i] =
                {
                    "type":"dir",
                    "name":data[i],
                    "update":(tmpsta.birthtime.getYear() + 1900) + '-'
                        + tmpsta.birthtime.getMonth() + '-'
                        + tmpsta.birthtime.getDay() + ' '
                        + tmpsta.birthtime.getHours() + ':'
                        + tmpsta.birthtime.getMinutes() + ':'
                        + tmpsta.birthtime.getSeconds()
                };
            }
            else
            {
                data[i] =
                {
                    "type":"file",
                    "name":data[i],
                    "size":tmpsta.size,
                    "update":(tmpsta.birthtime.getYear() + 1900) + '-'
                        + tmpsta.birthtime.getMonth() + '-'
                        + tmpsta.birthtime.getDay() + ' '
                        + tmpsta.birthtime.getHours() + ':'
                        + tmpsta.birthtime.getMinutes() + ':'
                        + tmpsta.birthtime.getSeconds()
                };
            }
        }
        return callback(null, data);
    });
};

ModelSerControl.newDir = function(dirname, callback)
{
    return fs.mkdir(dirname, function(err, res)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, res);
    });
}

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