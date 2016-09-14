
var setting = require('../setting');
var fs = require('fs');

var ModelSerRun = require('../model/modelSerRun');
var ModelSer = require('../model/modelService');

function ModelSerRunCtrl()
{}

module.exports = ModelSerRunCtrl;

//新增模型运行记录
ModelSerRunCtrl.addItem = function (msr, callback) {
    var newmsr = new ModelSerRun(msr);
    newmsr.save(function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//根据OID查询模型运行记录
ModelSerRunCtrl.getByOID = function (oid, callback) {
    ModelSerRun.getByOID(oid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
}

//根据GUID查询模型运行记录信息
ModelSerRunCtrl.getByGUID = function (guid, callback) {
    ModelSerRun.getByGUID(guid, function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
}

//根据MSID查询模型运行记录
ModelSerRunCtrl.getByMSID = function (msid, callback) {
    ModelSerRun.getByMsId(msid, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}

//得到全部模型运行记录
ModelSerRunCtrl.getAll = function (callback) {
    ModelSerRun.getAll(function (err, data) {
        if(err)
        {
            return callback(err);
        }

        // var pending = (function (pcallback) {
        //     var count = 0;
        //     return function (index) {
        //         count ++;
        //         return function (err, ms) {
        //             count --;
        //             if(err)
        //             {
        //                 data[index].ms = {};
        //                 console.log(err);
        //             }
        //             data[index].ms = ms;
        //             if(count == 0)
        //             {
        //                 pcallback();
        //             }
        //         }
        //     }
        // });
        //
        // var done = pending(function () {
        //     return callback(null, data);
        // });
        //
        // for(var i = 0; i < data.length; i++)
        // {
        //     ModelSer.getByOID(data[i].ms_id.toString(), done(i));
        // }
        return callback(null, data);
    });
}

//更新模型运行记录信息
ModelSerRunCtrl.update = function (msr, callback) {
    ModelSerRun.update(msr, function (err, data) {
       if(err)
       {
           return callback(err);
       }
       return (null, data);
    });
}