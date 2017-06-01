/**
 * Created by Franklin on 2017/5/27.
 */

var formidable = require('formidable');
var uuid = require('node-uuid');

var setting = require('../setting');
var MidBase = require('./midBase');
var GeoDataCtrl = require('../control/geoDataControl');

var GeoDataMid = function(){};
GeoDataMid.__proto__ = MidBase;
module.exports = GeoDataMid;

GeoDataMid.postStreamData = function(req, callback){
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
        var filename = guid + '.xml';
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
    
}