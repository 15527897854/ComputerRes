/**
 * Created by Franklin on 2016/7/31.
 * Route for GeoData
 */

var formidable = require('formidable');
var fs = require('fs');
var uuid = require('node-uuid');
var GeoDataCtrl = require('../control/geoDataControl');
var setting = require('../setting');

module.exports = function (app) {
    //上传地理模型数据文件
    app.route('/geodata/file')
        .post(function (req, res, next) {
            var form = new formidable.IncomingForm();               //创建上传表单
            form.encoding = 'utf-8';		                        //设置编辑
            form.uploadDir = setting.modelpath + '\\..\\geo_data\\';//设置上传目录
            form.keepExtensions = true;                             //保留后缀
            form.maxFieldsSize = 100 * 1024 * 1024;                 //文件大小

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
                fs.stat(files.myfile.path, function (err, stats) {
                    //判断文件大小
                    if(stats.size - 16 > 1024)
                    {
                        //重命名
                        fs.rename(files.myfile.path, setting.modelpath + '\\..\\geo_data\\' + fname, function () {
                            //存入数据库
                            var geodata = {
                                gd_id : gdid,
                                gd_rstate : fields.state,
                                gd_io : 'INPUT',
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
                                        res:'suc',
                                        gd_id:gdid
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
                                gd_rstate :fields.state,
                                gd_io : 'INPUT',
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
            var state = req.body.state;

            //生成数据ID
            var gdid = 'gd_' + uuid.v1();
            if(data.length > 1024)
            {
                var filename = guid + '.xml';
                fs.writeFile(__dirname + '\\..\\geo_data\\' + filename, data, {encoding : 'uft8'},
                    function (err, data) {
                    if(err)
                    {
                        return res.end('Error in write file : ' + err);
                    }
                    //存入数据库
                    var geodata = {
                        gd_id : gdid,
                        gd_rstate : state,
                        gd_io : 'INPUT',
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
                                res:'suc',
                                gd_id:gdid
                            }));
                    });
                });
            }
            else
            {
                //存入数据库
                var geodata = {
                    gd_id : gdid,
                    gd_rstate : state,
                    gd_io : 'INPUT',
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
    //下载数据文件
    app.route('/geodata/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            GeoDataCtrl.getByKey(gdid, function (err, gd) {
                if(err)
                {
                    return res.end('error');
                }
                var filename = gd.gd_id + '.xml';
                if(gd.gd_type == 'FILE')
                {
                    fs.readFile(__dirname + '\\..\\geo_data\\' + gd.gd_value, function (err, data) {
                        if(err)
                        {
                            return res.end('error');
                        }
                        res.set({
                            'Content-Type': 'file/xml',
                            'Content-Length': data.length });
                        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                        res.end(data);
                    })
                } else if(gd.gd_type == 'STREAM')
                {
                    res.set({
                        'Content-Type': 'file/xml',
                        'Content-Length': gd.gd_value.length });
                    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                    res.end(gd.gd_value);
                }
            });
        });
}