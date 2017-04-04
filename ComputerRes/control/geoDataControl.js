/**
 * Created by Franklin on 2016/8/1.
 * Control for GeoData
 */
var GeoData = require('../model/geoData');
var Child = require('../model/child');
var ParamCheck = require('../utils/paramCheck');
var RemoteReqControl = require('./remoteReqControl');

function GeoDataCtrl() {}

module.exports = GeoDataCtrl;

//添加数据
GeoDataCtrl.addData = function (data, callback) {
    var geodata = new GeoData(data);
    geodata.save(function (err, result) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, result);
    });
};

//获取数据
GeoDataCtrl.getByKey = function (key, callback) {
    GeoData.getByKey(key, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//更新数据
GeoDataCtrl.update = function (data, callback) {
    var geodata = new GeoData(data);
    geodata.save(function (err, gd) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, gd);
    });
};

//获取全部数据
GeoDataCtrl.getAllData = function(callback){
    GeoData.getAll(function(err, items){
        if(err)
        {
            return callback(err);
        }
        return callback(null, items);
    });
};

//获取远程数据
GeoDataCtrl.getRmtData = function(req, host, gdid, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        if(ParamCheck.checkParam(callback, gdid))
        {
            Child.getByHost(host, function(err, child){
                if(err)
                {
                    return callback(err);
                }
                if(ParamCheck.checkParam(callback, child))
                {
                    RemoteReqControl.getRequest(req, 'http://' + child.host + ':' + child.port + '/geodata/' + gdid, function(err, data){
                        if(err)
                        {
                            return callback(err);
                        }
                        return callback(null, data);
                    }) ;
                }
            });
        }
    }
};

//上传远程数据
GeoDataCtrl.postRmtData = function(req, host, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        Child.getByHost(host, function(err, child){
            if(err)
            {
                return callback(err);
            }
            if(ParamCheck.checkParam(callback, child))
            {
                RemoteReqControl.postRequest(req, 'http://' + child.host + ':' + child.port + '/geodata', function(err, data){
                    if(err)
                    {
                        return callback(err);
                    }
                    return callback(null, data);
                }) ;
            }
        });
    }
};