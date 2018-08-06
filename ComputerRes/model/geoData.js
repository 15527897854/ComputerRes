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
        this.gd_tag = '';
        this.gd_datetime = '';
        this.gd_type = '';
        this.gd_size = 0;
        this.gd_value = '';
        this.gd_fname = '';
    }
    else {
        this.gd_id = gd.gd_id;
        this.gd_tag = gd.gd_tag;
        this.gd_datetime = gd.gd_datetime;
        this.gd_type = gd.gd_type;
        this.gd_size = gd.gd_size;
        this.gd_value = gd.gd_value;
        this.gd_fname = gd.gd_fname;
    }
    return this;
}

module.exports = GeoData;

//保存数据
GeoData.prototype.save = function (callback) {
    var key = this.gd_id;
    var fields =
    {
        "gd_tag" : this.gd_tag,
        "gd_datetime" : this.gd_datetime,
        "gd_type" : this.gd_type,
        "gd_size" : this.gd_size,
        "gd_value" : this.gd_value,
        "gd_fname" : this.gd_fname
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
};

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
};

//获取全部数据
GeoData.getAll = function(callback){
    client.SELECT(setting.redis.dbIndex, function (err) {
        if(err)
        {
            console.log('Error in getting redis data : ' + err);
            return callback(err);
        }
        client.KEYS('*', function(err, keys){
            if(err)
            {
                console.log('Error in getting redis data : ' + err);
                return callback(err);
            }
            var allData = [];
            var count = 0;
            if(keys.length == 0)
            {
                return callback(null, []);
            }

            var pending = function(index)
            {
                count ++;
                return function (err, obj)
                {
                    count--;
                    if(err)
                    {
                        console.log('Error in getting redis data : ' + err);
                    }
                    if(obj != null)
                    {
                        obj.gd_id = keys[index];
                    }
                    allData.push(obj);
                    if(count == 0)
                    {
                        return callback(null, allData);
                    }

                }
            };

            for(var i = 0; i < keys.length; i++)
            {
                client.HGETALL(keys[i], pending(i));
            }
        });
    });
};

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
};