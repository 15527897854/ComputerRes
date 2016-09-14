/**
 * Created by Franklin on 2016/9/12.
 * for child node Computer Resource
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;

function Child(cld) {
    if(cld != null)
    {
        this.host = cld.host;
        this.port = cld.port;
    }
    else
    {
        this.host = '';
        this.port = 0;
    }
}

module.exports = Child;

//新增节点
Child.prototype.save = function (callback) {
    var cld = {
        host : this.host,
        port : this.port
    };

    //打开数据库
    mongodb.open(function (err, db) {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('child', function (err,collection) {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //插入一条数据
            collection.insert(cld,{safe:true},function(err,_cld)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                callback(null, _cld.ops[0]);
            });
        });
    });
}

//得到全部子节点
Child.getAll = function (callback) {
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            console.log(err);
            return callback(err);
        }

        db.collection('child',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.find().toArray(function(err,data)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null,data);
            });
        });
    });
}

Child.getByC