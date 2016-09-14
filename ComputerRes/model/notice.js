/**
 * Created by ChaoRan on 2016/8/20.
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;

function Notice(notice)
{
    if(notice != null)
    {
        if(notice._id){
            this._id = notice._id;
        }
        else {
            this._id = new ObjectId();
        }
        this.time = notice.time;
        this.ms_name = notice.ms_name;
        this.notice = notice.notice;
        this.type = notice.type;
        this.hasRead = notice.hasRead;
    }
    else
    {
        this._id = new ObjectId();
        this.time = '';
        this.ms_name = '';
        this.notice = '';
        this.type = '';
        this.hasRead = 0;
    }
    return this;
}

module.exports = Notice;

function createTTL() {
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //删除生命周期索引
            collection.dropIndex({"time":-1});
            //有效期7天
            // collection.createIndex({"time": -1},{expireAfterSeconds: 604800});
        });
    });
}

// createTTL();

//新增模型服务信息
Notice.save = function(notice,callback) {
    //Notice
    // var notice = {
    //     _id : new ObjectId(this._id),
    //     time : this.time,
    //     ms_name : this.ms_name,
    //     notice : this.notice,
    //     type : this.type,
    //     hasRead : this.hasRead
    // };

    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //插入一条数据
            collection.insert(notice,{safe:true},function(err,notice)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                callback(null,notice.ops[0]);
            });
        });
    });
};

Notice.delByOID = function (_oid, callback) {
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            var oid = new ObjectId(_oid);
            collection.remove({_id:oid}, function(err, ms) {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null, ms);
            });
        });
    });
};

Notice.getWhere = function(where, callback) {
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            console.log(err);
            return callback(err);
        }
        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.find(where).sort({time:-1}).toArray(function(err,data)
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
};

Notice.getByOID = function(_oid, callback) {
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        //打开数据集
        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            var oid = new ObjectId(_oid);
            collection.findOne({_id:oid},function(err,ms)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null, ms);
            })
        });
    });
};

Notice.update = function(newNotice,callback){
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('notice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.update(
                {_id:newNotice._id},
                {$set:{
                    hasRead : newNotice.hasRead
                }},
                function(err, notice)
                {
                    mongodb.close();
                    if(err)
                    {
                        return callback(err);
                    }
                    return callback(null,true);
                }
            );
        });
    });
};