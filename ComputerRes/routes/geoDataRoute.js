/**
 * Created by Franklin on 2016/7/31.
 * Route for GeoData
 */

var formidable = require('formidable');
var fs = require('fs');
var uuid = require('node-uuid');

var GeoDataCtrl = require('../control/geoDataControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');
var request = require('request');
var childCtrl = require('../control/childControl');
var fileOpera = require('../utils/fileOpera');
var RouteBase = require('./routeBase');
var cp = require('../utils/child-process'); 

module.exports = function (app) {
    //上传地理模型数据文件
    app.route('/geodata/file')
        .post(function (req, res, next) {
            var form = new formidable.IncomingForm();               //创建上传表单
            form.encoding = 'utf-8';		                        //设置编辑
            form.uploadDir = setting.modelpath + '/../geo_data/';   //设置上传目录
            form.keepExtensions = true;                             //保留后缀
            form.maxFieldsSize = 500 * 1024 * 1024;                 //文件大小

            form.parse(req, function (err, fields, files) {
                if(err)
                {
                    console.log(err);
                    return res.end(JSON.stringify(
                        {
                            res:'err',
                            mess:JSON.stringify(err)
                        }));
                }
                //生成数据ID
                var gdid = 'gd_' + uuid.v1();
                var fname = gdid + '.xml';

                //读取文件状态
                if(files.myfile == undefined)
                {
                    return res.end("Error : Can not find files ! " );
                }
                var gd_tag = '';
                if(fields.gd_tag)
                {
                    gd_tag = fields.gd_tag;
                }
                fs.stat(files.myfile.path, function (err, stats) {
                    //判断文件大小
                    if(stats.size - 16 > setting.data_size)
                    {
                        //重命名
                        fs.rename(files.myfile.path, setting.modelpath + '/../geo_data/' + fname, function () {
                            //存入数据库
                            var geodata = {
                                gd_id : gdid,
                                gd_tag : gd_tag,
                                gd_type : 'FILE',
                                gd_value : fname
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
                        });
                    }
                    else
                    {
                        //读取数据
                        fs.readFile(files.myfile.path, function (err, data) {
                            var geodata = {
                                gd_id : gdid,
                                gd_tag : gd_tag,
                                gd_type : 'STREAM',
                                gd_value : data
                            };

                            //添加纪录
                            GeoDataCtrl.addData(geodata, function (err, blsuc) {
                                if(err)
                                {
                                    return res.end('Error : ' + err)
                                }
                                fs.unlinkSync(files.myfile.path);
                                return res.end(JSON.stringify(
                                    {
                                        res : 'suc',
                                        gd_id : gdid
                                    }));
                            });
                        });

                    }
                });
            });
        });

    //上传数据流
    app.route('/geodata/stream')
        .post(function (req, res, next) {
            var data = req.body.data;
            var gd_tag = '';
            if(req.body.gd_tag)
            {
                gd_tag = req.body.gd_tag;
            }

            //生成数据ID
            var gdid = 'gd_' + uuid.v1();
            if(data.length > setting.data_size)
            {
                var filename = gdid + '.xml';
                fs.writeFile(__dirname + '/../geo_data/' + filename, data, {encoding : 'uft8'},
                    function (err, data) {
                        if(err)
                        {
                            return res.end('Error in write file : ' + err);
                        }
                        //存入数据库
                        var geodata = {
                            gd_id : gdid,
                            gd_tag : gd_tag,
                            gd_type : 'FILE',
                            gd_value : fname
                        };

                        //添加记录
                        GeoDataCtrl.addData(geodata, function (err, blsuc) {
                            if(err) {
                                return res.end('Error : ' + err);
                            }
                            return res.end(JSON.stringify({
                                    res : 'suc',
                                    gd_id : gdid
                                }));
                        });
                    });
            }
            else
            {
                //存入数据库
                var geodata = {
                    gd_id : gdid,
                    gd_tag : gd_tag,
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
            }
        });

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

    // 返回数据文件及数据标签
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
                }
            });
        })
        .delete(function(req, res, next){
            var gdid = req.params.gdid;
            GeoDataCtrl.delete(gdid, RouteBase.returnFunction(res, 'Error in delete a geo-data!'));
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
                var url = 'http://' + host + ':' + port + '/geodata/file';
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
                req.pipe(request.post('http://' + host + ':' + port +'/geodata/stream',function (err, respose, body) {
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