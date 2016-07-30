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

//新增模型服务
ModelSerControl.addNewModelSer = function(newmodelser, callback)
{
    // //请求参数
    // var options = {
    //     host: setting.gate.host,
    //     port: setting.gate.port,
    //     path: '/modelser',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
    //     }
    // };
    // //像门户网站发送登记信息
    // romoteReqCtrl.Request(
    //     options,
    //     newmodelser,
    //     function(err, data)
    //     {
    //         if(err)
    //         {
    //             return callback(err);
    //         }
    //         var ms = new ModelSerModel(data);
    //         ms.save(function(err, data)
    //         {
    //             var path = __dirname + '\\..\\geo_model\\' + data._id + '\\';
    //             fs.mkdirSync(path);
    //             return callback(null, data);
    //         });
    //     }
    // );
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
ModelSerControl.run = function (ms_id, callback) {
    ModelSerModel.run(ms_id, function (err, muid, ms) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, muid, ms);
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

// ModelSerControl.fileTraverse = function(path, callback)
// {
//     fs.readdir(path, function(err, data)
//     {
//         if(err)
//         {
//             return callback(err);
//         }
//
//         for(var i = 0; i < data.length; i++)
//         {
//             var tmpfile = path + data[i];
//             var tmpsta = fs.statSync(tmpfile);
//             if(tmpsta.isDirectory())
//             {
//                 data[i] =
//                 {
//                     "type":"dir",
//                     "name":data[i],
//                     "update":(tmpsta.birthtime.getYear() + 1900) + '-'
//                         + tmpsta.birthtime.getMonth() + '-'
//                         + tmpsta.birthtime.getDay() + ' '
//                         + tmpsta.birthtime.getHours() + ':'
//                         + tmpsta.birthtime.getMinutes() + ':'
//                         + tmpsta.birthtime.getSeconds()
//                 };
//             }
//             else
//             {
//                 data[i] =
//                 {
//                     "type":"file",
//                     "name":data[i],
//                     "size":tmpsta.size,
//                     "update":(tmpsta.birthtime.getYear() + 1900) + '-'
//                         + tmpsta.birthtime.getMonth() + '-'
//                         + tmpsta.birthtime.getDay() + ' '
//                         + tmpsta.birthtime.getHours() + ':'
//                         + tmpsta.birthtime.getMinutes() + ':'
//                         + tmpsta.birthtime.getSeconds()
//                 };
//             }
//         }
//         return callback(null, data);
//     });
// };
//
// ModelSerControl.newDir = function(dirname, callback)
// {
//     return fs.mkdir(dirname, function(err, res)
//     {
//         if(err)
//         {
//             return callback(err);
//         }
//         return callback(null, res);
//     });
// }