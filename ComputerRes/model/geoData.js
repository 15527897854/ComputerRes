/**
 * Created by Franklin on 2016/7/31.
 */
//Redis Database
var client = require('./redisDB');
var setting = require('../setting');

function GeoData(gd) {
    if(gd == null)
    {
        this.gd_id = '';
        this.gd_rstate = '';
        this.gd_io = '';
        this.gd_type = '';
        this.gd_value = '';
    }
    else {
        this.gd_id = gd.gd_id;
        this.gd_rstate = gd.gd_rstate;
        this.gd_io = gd.gd_io;
        this.gd_type = gd.gd_type;
        this.gd_value = gd.gd_value;
    }
    return this;
}

module.exports = GeoData;

//保存数据
GeoData.prototype.save = function (callback) {
    var key = this.gd_id;
    var fields =
    {
        "gd_rstate" : this.gd_rstate,
        "gd_io" : this.gd_io,
        "gd_type" : this.gd_type,
        "gd_value" : this.gd_value
    };
    client.SELECT(setting.redis.dbIndex, function (err) {
        if(err)
        {
            console.log('Error in redis data save : ' + err);
            return callback(err);
        }
        client.HMSET(key, fields, function (err, res) {
            if(err)
            {
                console.log('Error in redis data save : ' + err);
                return callback(err);
            }
            return callback(null, true);
        });
    });
}

//获取数据
GeoData.getByKey = function (key, callback) {
    client.SELECT(setting.redis.dbIndex, function (err) {
        if(err)
        {
            console.log('Error in getting redis data : ' + err);
            return callback(err);
        }
        client.HGETALL(key, function (err, obj) {
            if(err)
            {
                console.log('Error in getting redis data : ' + err);
                return callback(err);
            }
            if(obj != null)
            {
                obj.gd_id = key;
            }
            return callback(null, obj);
        });
    });
}

//删除数据记录
GeoData.remove = function (key, callback) {
    client.DEL(key, function (err, res) {
        if(err)
        {
            console.log('Error in deleting key \'' + key + '\' ' + err);
            return callback(err);
        }
        return callback(null, res);
    });
}