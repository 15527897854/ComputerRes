/**
 * Created by Franklin on 2017/5/27.
 */

var formidable = require('formidable');
var uuid = require('node-uuid');
var fs = require('fs');

var setting = require('../setting');
var MidBase = require('./midBase');
var GeoDataCtrl = require('../control/geoDataControl');

var GeoDataMid = function(){};
GeoDataMid.__proto__ = MidBase;
module.exports = GeoDataMid;

GeoDataMid.postStreamData = function(req, callback){
    var data = req.body.data;
    var gd_tag = '';
    var gd_destroy = 'FALSE';
    if(req.body.gd_tag)
    {
        gd_tag = req.body.gd_tag;
    }
    if(req.body.gd_destroy)
    {
        gd_destroy = req.body.gd_destroy;
    }
    //生成数据ID
    var gdid = 'gd_' + uuid.v1();
    if(data.length > setting.data_size)
    {
        var filename = guid + '.xml';
        fs.writeFile(__dirname + '/../geo_data/' + filename, data, {encoding : 'uft8'},
            function (err, data) {
                if(err)
                {
                    return callback(err);
                }
                //存入数据库
                var geodata = {
                    gd_id : gdid,
                    gd_tag : gd_tag,
                    gd_type : 'FILE',
                    gd_size : data.length,
                    gd_value : fname
                };

                //添加记录
                GeoDataCtrl.addData(geodata, function (err, blsuc) {
                    if(err) {
                        return callback(err);
                    }
                    return callback(null, gdid);
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
            gd_size : data.length,
            gd_value : data
        };

        //添加记录
        GeoDataCtrl.addData(geodata, function (err, blsuc) {
            if(err)
            {
                return callback(err);
            }
            return callback(null, gdid);
        });
    }
}

GeoDataMid.postFileData = function(req, callback){
    var form = new formidable.IncomingForm();               //创建上传表单
    form.encoding = 'utf-8';		                        //设置编辑
    form.uploadDir = setting.modelpath + '/../geo_data/';   //设置上传目录
    form.keepExtensions = true;                             //保留后缀
    form.maxFieldsSize = 500 * 1024 * 1024;                 //文件大小

    form.parse(req, function (err, fields, files) {
        if(err)
        {
            console.log(err);
            return callback(err);
        }
        //生成数据ID
        var gdid = 'gd_' + uuid.v1();
        var fname = gdid + '.xml';

        //读取文件状态
        if(files.myfile == undefined)
        {
            return callback(new Error('Can not find data file!'));
        }
        var gd_tag = '';
        if(fields.gd_tag)
        {
            gd_tag = fields.gd_tag;
        }
        fs.stat(files.myfile.path, function (err, stats) {
            if(err){
                return callback(err);
            }
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
                        gd_size : stats.size - 16,
                        gd_value : fname
                    };

                    //添加记录
                    GeoDataCtrl.addData(geodata, function (err, blsuc) {
                        if(err)
                        {
                            return callback(err);
                        }
                        return callback(null, gdid);
                    });
                });
            }
            else
            {
                //读取数据
                fs.readFile(files.myfile.path, function (err, data) {
                    if(err){
                        return callback(err);
                    }
                    var geodata = {
                        gd_id : gdid,
                        gd_tag : gd_tag,
                        gd_type : 'STREAM',
                        gd_size : stats.size - 16,
                        gd_value : data
                    };

                    //添加纪录
                    GeoDataCtrl.addData(geodata, function (err, blsuc) {
                        if(err)
                        {
                            return callback(err);
                        }
                        fs.unlinkSync(files.myfile.path);
                        return callback(null, gdid);
                    });
                });

            }
        });
    });
}

GeoDataMid.postUrlData = function(req, callback){
    var url = req.body.url;
    var gd_tag = '';
    var gd_destroy = 'FALSE';
    if(req.body.gd_tag)
    {
        gd_tag = req.body.gd_tag;
    }
    if(req.body.gd_destroy)
    {
        gd_destroy = req.body.gd_destroy;
    }
    //生成数据ID
    var gdid = 'gd_' + uuid.v1();

    
}