/**
 * Created by Franklin on 16-4-9.
 * Model for SystemSetting
 */
var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;

function SystemSetting(ss)
{
    if(ss == null)
    {
        this._id = new ObjectId();
        this.ss_index = '';
        this.ss_value = '';
    }
    else
    {
        this._id = ss._id;
        this.ss_index = ss.ss_index;
        this.ss_value = ss.ss_value;
    }
    return this;
}

module.exports = SystemSetting;

SystemSetting.prototype.save = function(callback)
{
    //SystemSetting
    var systemSetting = {
        ss_index:this.ss_index,
        ss_value:this.ss_value
    };

    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('systemsetting', function(err, collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //插入一条数据
            collection.insert(systemSetting, {safe: true}, function(err, modelser)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null, modelser[0]);
            });
        });
    });
}

SystemSetting.getValueByIndex = function(ss_index, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('systemsetting',function(err, collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({ss_index: ss_index},function(err, ss)
            {
                mongodb.close();
                if(err)
                {
                    callback(err);
                }
                callback(null, ss);
            });
        });
    });
}

SystemSetting.update = function(ss, callback)
{
    mongodb.open(function(err, db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('systemsetting', function(err, collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.update(
                {_id:ss._id},
                {
                    $set:{
                        ss_index:ss.ss_index,
                        ss_value:ss.ss_value
                    }
                },
                function(err, newss)
                {
                    mongodb.close();
                    if(err)
                    {
                        return callback(err);
                    }
                    return callback(err, true);
                }
            );
        });
    });
}