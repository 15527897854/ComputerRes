/**
 * 数据库的增删查改
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;

//ModelSerRun模型
function ModelSerRun( modelserRun )
{
    if(modelserRun != null)
    {
        this._id = modelserRun._id;
        this.ms_id = modelserRun.ms_id;
        this.msr_ms = modelserRun.msr_ms;
        this.msr_date = modelserRun.msr_date;
        this.msr_time = modelserRun.msr_time;
        this.msr_user = modelserRun.msr_user;
        this.msr_guid = modelserRun.msr_guid;
        this.msr_input = modelserRun.msr_input;
        this.msr_output = modelserRun.msr_output;
        this.msr_des = modelserRun.msr_des;
    }
    else
    {
        this._id = new ObjectId();
        this.ms_id = '';
        this.msr_ms = {};
        this.msr_date = '';
        this.msr_time = 0;
        this.msr_user = {};
        this.msr_guid = '';
        this.msr_input = [];
        this.msr_output = [];
        this.msr_des = '';
    }
    return this;
}

module.exports = ModelSerRun;

//新增模型服务运行信息
ModelSerRun.prototype.save = function(callback)
{
    //ModelSerRun
    var modelserRun = {
        ms_id:this.ms_id,
        msr_ms:this.msr_ms,
        msr_date:this.msr_date,
        msr_time:this.msr_time,
        msr_user:this.msr_user,
        msr_guid:this.msr_guid,
        msr_input:this.msr_input,
        msr_output:this.msr_output,
        msr_des:this.msr_des
    };

    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('modelserrun',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //插入一条数据
            collection.insert(modelserRun,{safe:true},function(err,modelserRun) {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                callback(null,modelserRun.ops[0]);
            });
        });
    });
};

//获取模型运行服务
ModelSerRun.getAll = function(callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            console.log(err);
            return callback(err);
        }

        db.collection('modelserrun',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.find().toArray(function(err, data)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null, data);
            });
        });
    });
};

//根据OID获取ModelSerRun
ModelSerRun.getByOID = function(_oid, callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        //打开数据集
        db.collection('modelserrun',function(err,collection)
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
                return callback(null,ms);
            })
        });
    });
};

//根据ms_id获取ModelSerRun
ModelSerRun.getByMsId = function(_msid, callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('modelserrun',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            var msid = new ObjectId(_msid);
            collection.find({ms_id : msid}).toArray(function (err, data) {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null, data);
            });
        });
    });
};

//根据msr_guid获取ModelSerRun
ModelSerRun.getByGUID = function(guid, callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('modelserrun',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({msr_guid : guid},function(err,msr)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                return callback(null,msr);
            })
        });
    });
};

//更新模型运行数据
ModelSerRun.update = function(newmsr, callback)
{
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('modelserrun',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.update(
                {_id:newmsr._id},
                {$set:{
                    ms_id : newmsr.ms_id,
                    msr_date : newmsr.msr_date,
                    msr_time : newmsr.msr_time,
                    msr_user : newmsr.msr_user,
                    msr_uid : newmsr.msr_uid,
                    msr_input : newmsr.msr_input,
                    msr_output : newmsr.msr_output,
                    msr_des : newmsr.msr_des
                }},
                function(err, data)
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