/**
 * Created by Franklin on 2016/8/1.
 * Control for GeoData
 */
var GeoData = require('../model/geoData');
var Child = require('../model/child');
var ParamCheck = require('../utils/paramCheck');
var RemoteReqControl = require('./remoteReqControl');
var CommonMethod = require('../utils/commonMethod');
var FileOpera = require('../utils/fileOpera');
var Settings = require('../setting');

function GeoDataCtrl() {}

module.exports = GeoDataCtrl;

//添加数据
GeoDataCtrl.addData = function (data, callback) {
    data['gd_datetime'] = CommonMethod.getDateTimeNow();
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

//删除数据
GeoDataCtrl.delete = function(key, callback){
    GeoData.getByKey(key, function(err, item){
        if(err)
        {
            return callback(err);
        }
        if(item == null)
        {
            return callback(null, {
                res : 'suc'
            });
        }
        if(item.gd_type === 'FILE')
        {
            FileOpera.rmdir(Settings.modelpath + '../geo_data/' + item.gd_value);
        }
        GeoData.remove(key, function(err, res){
            if(err)
            {
                return callback(err);
            }
            return callback(null, {
                res : 'suc'
            });
        });
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
                    RemoteReqControl.getRequest(req, 'http://' + child.host + ':' + child.port + '/geodata/' + gdid + '?token=' + child.access_token, function(err, data){
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

//获取远程数据
GeoDataCtrl.getAllRmtData = function(host, callback){
    if(ParamCheck.checkParam(callback, host))
    {
        Child.getByHost(host, function(err, child){
            if(err)
            {
                return callback(err);
            }
            if(ParamCheck.checkParam(callback, child))
            {
                RemoteReqControl.getRequestJSON('http://' + child.host + ':' + child.port + '/geodata/json/all?token=' + child.access_token, function(err, data){
                    if(err)
                    {
                        return callback(err);
                    }
                    return callback(null, data);
                });
            }
        });
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
                RemoteReqControl.postRequest(req, 'http://' + child.host + ':' + child.port + '/geodata?token=' + child.access_token, function(err, data){
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

//上传数据流数据
GeoDataCtrl.addStreamData = function(gdid, gdtag, data, callback){
    
    //存入数据库
    var geodata = {
        gd_id : gdid,
        gd_tag : gdtag,
        gd_type : 'STREAM',
        gd_value : data
    };

    //添加记录
    GeoDataCtrl.addData(geodata, function (err, blsuc) {
        if(err)
        {
            return res.end('Error : ' + err)
        }
        return res.end(JSON.stringify(
            {
                res : 'suc',
                gd_id : gdid
            }));
    });
};

//上传文件数据
GeoDataCtrl.addFileData = function(){
    
}