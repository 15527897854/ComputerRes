/**
 * Created by Franklin on 2016/8/1.
 * Control for GeoData
 */
var GeoData = require('../model/geoData');

function GeoDataCtrl() {
}

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