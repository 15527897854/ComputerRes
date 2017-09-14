
var setting = require('../setting');
var fs = require('fs');

var ModelSerRun = require('../model/modelSerRun');
var ModelSer = require('../model/modelService');
var RemoteReqControl = require('./remoteReqControl');
var Child = require('../model/child');
var ParamCheck = require('../utils/paramCheck');
var CommonMethod = require('../utils/commonMethod');
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

//更新模型运行记录日志信息
ModelSerRunCtrl.updateLog = function (msr, msr_log, callback) {
    ModelSerRun.updateLog(msr, msr_log, function (err, data) {
       if(err)
       {
           return callback(err);
       }
       return callback(null, data);
    });
};

//判断数据是否需要销毁
ModelSerRunCtrl.IsOutputData2BDestroyed = function(DataId, callback){
    ModelSerRun.getByOutputDataID(DataId, function(err, data){
        if(err){
            return callback(err);
        }
        if(!data){
            return callback(null, false);
        }
        if(data.Destroyed){
            return callback(null, true);
        }
        return callback(null, false);
    });
}

//统计模型运行记录信息
ModelSerRunCtrl.getStatisticInfoRecent = function(msid, days, callback){
    var date = [];
    days = parseInt(days);
    if(days < 1){
        return callback(new Error('Days is illegal'));
    }
    for(var i = 0; i < (days + 1); i++){
        date.push(CommonMethod.getStartDate(i - (days - 1)));
    }
    var statisticInfo = {
        data : [],
        ticks : [],
    };
    var count = 0;
    var pending = (function(index){
        count ++;
        return function(err, data){
            count--;
            if(err){
                return console.log('Error in getting statistic info of msr!')
            }
            else{
                statisticInfo.data[index][1] = data.length;
            }
            if(count == 0){
                return callback(null, statisticInfo);
            }
        }
    });
    for(var i = 0; i < date.length - 1; i++){
        ModelSerRun.getStatisticInfoByDate(msid, date[i], date[i + 1], pending(i));
        if(date.length > 40){
            if(i%5 == 0){
                statisticInfo.ticks.push([i, CommonMethod.getMonthWord(date[i].getMonth()) + ' ' + date[i].getDate()]);
            }
        }
        else{
            statisticInfo.ticks.push([i, CommonMethod.getMonthWord(date[i].getMonth()) + ' ' + date[i].getDate()]);
        }
        statisticInfo.data.push([i, 0]);
    }
}

//统计模型运行记录信息
ModelSerRunCtrl.getTimesStatisticInfo = function(callback){
    ModelSerRun.getTimesStatisticInfoByMSID(function(err, data){
        if(err){
            return callback(err);
        }
        if(data.length == 0){
            return callback(null, []);
        }
        var count = 0
        var allcount = 0;
        var pending = (function(index){
            count ++;
            return function(err, ms){
                count --;
                if(err || ms == null){
                    data[index].label = 'Others';
                }
                else{
                    data[index].label = ms.ms_model.m_name;
                }
                data[index].data = data[index].count*100/allcount;
                if(count == 0){
                    return callback(null, data);
                }
            }
        });
        data.sort(function(a, b){
            return b.count - a.count;
        });
        if(data.length > 4){
            var otherCount = 0;
            for(var i = 4; i < data.length; i++){
                otherCount =  data[4].count + data[i].count;
            }
            data[4].length = otherCount;
            data[4]._id.ms_id = null;
            for(var i = 0; i < 5; i++){
                ModelSer.getByOID(data[i]._id.ms_id, pending(i));
                allcount = allcount + data[i].count;
            }
        }
        else{
            for(var i = 0; i < data.length; i++){
                ModelSer.getByOID(data[i]._id.ms_id, pending(i));
                allcount = allcount + data[i].count;
            }
        }
    });
}

/////////////////////远程


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

ModelSerRunCtrl.getRmtModelSerRun = function(host, msrid, callback){
    if(ParamCheck.checkParam(callback, host)){
        if(ParamCheck.checkParam(callback, msrid)){
            Child.getByHost(host, function(err, child){
                if(err){
                    return callback(err);
                }
                if(child){
                    return RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/' + msrid + '?token=' + child.access_token, 
                        this.returnRemoteFunction(callback, 'Error in getting rmt model serivce running records by Host and Msrid'));
                }
                else{
                    return callback(new Error('No child!'))
                }
            }.bind(this));
        }
    }
};

ModelSerRunCtrl.getRmtModelSerRunsByHost = function (host, callback) {
    Child.getByHost(host, function(err, child){
        if(err){
            return callback(err);
        }
        if(child){
            return RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/all?token=' + child.access_token, 
                this.returnRemoteFunction(callback, 'Error in getting rmt model serivce running records by Host'));
        }
        else{
            return callback(new Error('No child!'))
        }
    }.bind(this));
};

ModelSerRunCtrl.getRmtModelSerRunsByHostAndMsid = function (host, msid, callback) {
    Child.getByHost(host, function(err, child){
        if(err){
            return callback(err);
        }
        if(child){
            return RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/all?token=' + child.access_token + '&msid=' + msid, 
                this.returnRemoteFunction(callback, 'Error in getting rmt model serivce running records by Host and Msid'));
        }
        else{
            return callback(new Error('No child!'));
        }
    }.bind(this));
};

ModelSerRunCtrl.getRmtModelSerRunsStatisticByHost = function (host, days, callback) {
    Child.getByHost(host, function(err, child){
        if(err){
            return callback(err);
        }
        if(child){
            return RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/all?type=statistic&token=' + child.access_token + '&days=' + days,  
                this.returnRemoteFunction(callback, 'Error in getting rmt model serivce running statistic info by Host'));
        }
        else{
            return callback(new Error('No child!'))
        }
    }.bind(this));
};

ModelSerRunCtrl.getRmtModelSerRunsStatisticByHostAndMsid = function (host, msid, days, callback) {
    if(ParamCheck.checkParam(callback, host)){
        if(ParamCheck.checkParam(callback, msid)){
            Child.getByHost(host, function (err, child) {
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelserrun/json/all?token=' + child.access_token + '&msid=' + msid + '&type=statistic&days=' + days,  
                        this.returnRemoteFunction(callback, 'Error in getting rmt model serivce running statistic info by Host and Msid'));
                }
            }.bind(this));
        }
    }
};