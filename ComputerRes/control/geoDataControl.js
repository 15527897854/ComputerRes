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
var fs = require('fs');
var Promise = require('bluebird');
var Path = require('path');
var request = require('request');
var uuid = require('node-uuid');

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
        //找到这个数据的权限信息


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

//删除月份之前的数据
GeoDataCtrl.deleteByMonth = function(month, callback){
    if(ParamCheck.checkParam(callback, month)){
        var date_now = new Date();
        date_now.setMonth(date_now.getMonth() - month);
        GeoDataCtrl.getAllData(function(err, data){
            if(err){
                return callback(err);
            }
            var count = data.length;
            for(var i = 0; i < data.length; i++){
                var date = new Date(data[i].gd_datetime);
                if(date < date_now){
                    GeoDataCtrl.delete(data[i].gd_id, function(err, data){
                        count = count - 1;
                        if(count == 0){
                            return callback(null, true);
                        }
                    });
                }
                else{
                    count = count - 1;
                    if(count == 0){
                        return callback(null, true);
                    }
                }
            }
        });
    }
}

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
    
};

GeoDataCtrl.exist = function (gdid, cb) {
    GeoData.getByKey(gdid, function (err, data) {
        if(err) {
            return cb(err);
        }
        if(data != null){
            return cb(null,true);
        }
        return cb(null, false);
    });
};

// 拿到数据坐标，下载数据并添加到数据库中
GeoDataCtrl.onReceivedDataPosition = function (dataPosition) {
    var self = this;
    var url = null;
    if(dataPosition.posType == 'LOCAL'){
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    else if(dataPosition.posType == 'MODEL SERVICE'){
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    else if(dataPosition.posType == 'DATA SERVICE'){
        url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
        // url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/' + dataPosition.gdid;
    }
    // 先查询有没有
    GeoDataCtrl.exist(dataPosition.gdid,function (err, exist) {
        if (err) {

        }
        else {
            if (exist) {

            }
            else {
                // 请求数据文件
                new Promise(function (resolve, reject) {
                    // request(url,function (err, response, body) {
                    //     if(err){
                    //         console.log(err);
                    //         // let data = JSON.stringify({error:err});
                    //         // return res.end(data);
                    //     }
                    //     else{
                    //         // res.set({
                    //         //     'Content-Type': response.headers['Content-Type'],
                    //         //     'Content-Length': response.headers['Content-Length']
                    //         // });
                    //         // res.setHeader('Content-Disposition', response.headers['content-disposition']);
                    //         // return res.end(new Buffer(body));
                    //
                    //         // save file
                    //         var hasFname = false;
                    //         var fname = response.headers['content-disposition'];
                    //         if(fname){
                    //             var index = fname.indexOf('filename=');
                    //             if(index != -1){
                    //                 fname = fname.substring(index + 9);
                    //                 hasFname = true;
                    //             }
                    //         }
                    //         if(!hasFname){
                    //             fname = 'gd_' + uuid.v1();
                    //         }
                    //         fname = Path.join(__dirname, '../geo_data',fname);
                    //         var stream = fs.createWriteStream(fname).pipe(body);
                    //     }
                    // });

                    RemoteReqControl.getByServer(url,null,function (err, res) {
                        if(err){
                            return reject(err);
                        }
                        else {
                            return resolve(JSON.parse(res));
                        }
                    })
                })
                // 保存数据
                    .then(function (gd) {
                        return new Promise(function (resolve, reject) {
                            if(gd.error){
                                return reject(new Error(gd.error));
                            }

                            // if(gd.gd_type == 'STREAM'){
                            //     GeoDataCtrl.addData(gd,function (err, rst) {
                            //         if(err){
                            //             return reject(err);
                            //         }
                            //     })
                            // }
                            // else if(gd.gd_type == 'FILE'){

                            // output data has no fname!
                            var fname = gd.gd_fname;
                            var extName = Path.extname(fname);
                            // var extName = null;
                            var path = Path.join(__dirname,'../geo_data/' + fname);
                            var fdata = null;
                            if(gd.gd_type == 'STREAM'){
                                fdata = gd.gd_value;
                            }
                            else if(gd.gd_type == 'FILE' || gd.gd_type == 'XML'){
                                fdata = new Buffer(gd.gd_value, 'binary');
                            }
                            else if(gd.gd_type == 'ZIP'){
                                fdata = new Buffer(gd.gd_value,'binary');
                            }
                            // TODO 写入二进制数据有时候不对！
                            fs.writeFile(path, fdata, function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                else{
                                    if(extName == '.zip'){
                                        gd.gd_type = 'ZIP';
                                    }
                                    else if(extName == '.xml'){
                                        gd.gd_type = 'FILE';
                                    }

                                    gd.gd_value = fname;
                                    GeoDataCtrl.addData(gd,function (err, rst) {
                                        if(err){
                                            return reject(err);
                                        }
                                    })
                                }
                            });
                            // }
                        })
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }
        }
    });
}