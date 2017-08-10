/**
 * Created by Franklin on 2016/7/31.
 * Route for GeoData
 */

var formidable = require('formidable');
var fs = require('fs');
var uuid = require('node-uuid');

var GeoDataCtrl = require('../control/geoDataControl');
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');
var request = require('request');
var childCtrl = require('../control/childControl');
var fileOpera = require('../utils/fileOpera');
var RouteBase = require('./routeBase');
var cp = require('../utils/child-process'); 

module.exports = function (app) {
    //得到全部数据的JSON
    app.route('/geodata/json/all')
        .get(function (req, res, next) {
            GeoDataCtrl.getAllData(RouteBase.returnFunction(res, 'error in getting all geo data!'));
        });

    //返回下载的json数据
    app.route('/geodata/json/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            GeoDataCtrl.getByKey(gdid, function (err, gd) {
                if(err)
                {
                    return res.end('error');
                }
                if(gd == null)
                {
                    return res.end('No Data!');
                }
                if(gd.gd_type == 'FILE')
                {
                    fs.access(__dirname + '/../geo_data/' + gd.gd_value, fs.R_OK, function(err){
                        if(err){
                             GeoDataCtrl.delete(gdid, function(err, reslut){
                                 return res.end('Data file do not exist!')
                             });
                        }
                        else
                        {
                            fs.readFile(__dirname + '/../geo_data/' + gd.gd_value, 'utf8' ,function (err, data) {
                                if(err)
                                {
                                    return res.end('error');
                                }
                                res.send('<xmp>' + data + '</xmp>');
                                //res.send(data);
                                return res.end();
                            });
                        }
                    });
                }
                else if(gd.gd_type == 'STREAM')
                {
                    res.end(gd.gd_value);
                }
            });
        });

    //数据中心页面
    app.route('/geodata/all')
        .get(function (req, res, next) {
            return res.render('dataCollection');
        });

    // scr 返回数据文件及数据标签
    app.route('/geodata/detail/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            GeoDataCtrl.getByKey(gdid, function (err, gd) {
                if(err)
                {
                    return res.end(JSON.stringify({error:err}));
                }
                if(gd == null)
                {
                    return res.end(JSON.stringify({error:'error'}));
                }
                var filename = gd.gd_id + '.xml';
                if(gd.gd_type == 'FILE')
                {
                    fs.access(__dirname + '/../geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                        if (err) {
                            GeoDataCtrl.delete(gdid, function (err, reslut) {
                                return res.end(JSON.stringify({error:err}));
                            });
                        }
                        else {
                            fs.readFile(__dirname + '/../geo_data/' + gd.gd_value, function (err, data) {
                                if(err)
                                {
                                    return res.end(JSON.stringify({error:'error'}));
                                }
                                // res.set({
                                //     'Content-Type': 'file/xml',
                                //     'Content-Length': data.length });
                                // res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                // res.end(data);
                                gd.gd_value = data;
                                res.end(JSON.stringify(gd));
                            });
                        }
                    });
                }
                else if(gd.gd_type == 'STREAM')
                {
                    // res.set({
                    //     'Content-Type': 'file/xml',
                    //     'Content-Length': gd.gd_value.length });
                    // res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                    res.end(JSON.stringify(gd));
                }
            });
        });

    // scr
    app.route('/geodata/exist/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            GeoDataCtrl.exist(gdid,function (err, exist) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,exist:exist}));
                }
            })
        });

    //下载数据文件
    app.route('/geodata/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            GeoDataCtrl.getByKey(gdid, function (err, gd) {
                if(err)
                {
                    return res.end('error');
                }
                if(gd == null)
                {
                    return res.end('No Data!');
                }
                ModelSerRunCtrl.IsOutputData2BDestroyed(gd.gd_id, function(err, destroyed){
                    if(err){
                        return res.end('error');
                    }
                    var filename = gd.gd_id + '.xml';
                    if(gd.gd_type == 'FILE')
                    {
                        fs.access(__dirname + '/../geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                            if (err) {
                                GeoDataCtrl.delete(gdid, function (err, reslut) {
                                    return res.end('Data file do not exist!')
                                });
                            }
                            else {
                                fs.readFile(__dirname + '/../geo_data/' + gd.gd_value, function (err, data) {
                                    if(err)
                                    {
                                        return res.end('error');
                                    }
                                    res.set({
                                        'Content-Type': 'file/xml',
                                        'Content-Length': data.length });
                                    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                    res.end(data);
                                    //销毁数据
                                    if(destroyed){
                                        GeoDataCtrl.delete(gd.gd_id, function(err, result){});
                                    }
                                });
                            }
                        });
                    }
                    else if(gd.gd_type == 'STREAM')
                    {
                        res.set({
                            'Content-Type': 'file/xml',
                            'Content-Length': gd.gd_value.length });
                        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                        res.end(gd.gd_value);
                        //销毁数据
                        if(destroyed){
                            GeoDataCtrl.delete(gd.gd_id, function(err, result){});
                        }
                    }
                });
            });
        })
        .delete(function(req, res, next){
            var gdid = req.params.gdid;
            if(gdid == 'all'){
                if(req.query.month){
                    var month = req.query.month;
                    month = parseInt(month);
                    GeoDataCtrl.deleteByMonth(month, RouteBase.returnFunction(res, 'Error in delete geo-data by month'));
                }
            }
            else{
                GeoDataCtrl.delete(gdid, RouteBase.returnFunction(res, 'Error in delete a geo-data!'));
            }
        });

    app.route('/geodata/snapshot/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            cp.newVisualization(gdid,null,function (err, data) {
                if(err){
                    return res.end(JSON.stringify({err:err}));
                }
                else{
                    return res.end(data);
                }
            });
        });

    //////////////////////////////////////远程

    //请求转发 上传文件
    app.route('/geodata/file/:host')
        .post(function (req, res, next) {
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    res.end(JSON.stringify({
                        res:'err',
                        mess:JSON.stringify(error)
                    }));
                }
                var port = child.port;
                var url = 'http://' + host + ':' + port + '/geodata?type=file';
                remoteReqCtrl.postRequest(req,url,function (err, data) {
                    if(err){
                        console.log('---------------------err--------------------\n'+err);
                        return res.end(JSON.stringify({
                            res:'err',
                            mess:JSON.stringify(err)
                        }));
                    }
                    return res.end(data);
                });
            });
        });

    //请求转发 数据流
    app.route('/geodata/stream/:host')
        .post(function (req, res, next) {
            var host = req.params.host;
            childCtrl.getByWhere({host:host},function (error, child) {
                if(error){
                    res.end(JSON.stringify({
                        res:'err',
                        mess:JSON.stringify(error)
                    }));
                }
                var port = child.port;
                req.pipe(request.post('http://' + host + ':' + port +'/geodata?type=stream',function (err, respose, body) {
                    if(err){
                        console.log('---------------------err--------------------\n'+err);
                        return res.end(JSON.stringify({
                            res:'err',
                            mess:JSON.stringify(err)
                        }));
                    }
                    return res.end(body);
                }));
            });
        });

    //某一计算节点的数据
    app.route('/geodata/rmt/json/all/:host')
        .get(function (req, res, next) {
            var host = req.params.host;
            GeoDataCtrl.getAllRmtData(host, function (err, data) {
                if(err)
                {
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : JSON.stringify(err)
                    }));
                }
                if(data.result == 'suc'){
                    return res.end(JSON.stringify({
                        result : 'suc',
                        data : data.data
                    }));
                }
            });
        });

    //远程下载
    app.route('/geodata/rmt/:host/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            var host = req.params.host;
            GeoDataCtrl.getRmtData(req, host, gdid, function(err, data)
            {
                if(err)
                {
                    return res.end('err');
                }
                var filename = gdid + '.xml';
                res.set({
                    'Content-Type': 'file/xml',
                    'Content-Length': data.length });
                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                return res.end(data);
            });
        });
    
    app.route('/geodata/snapshot/rmt/:host/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            var host = req.params.host;
            cp.newVisualization(gdid,host,function (err, data) {
                if(err){
                    res.end(JSON.stringify({err:err}));
                }
                else {
                    return res.end(data);
                }
            })
        });

};