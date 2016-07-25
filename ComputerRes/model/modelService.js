/**
 * Created by Franklin on 16-4-5.
 * model for ModelService
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var uuid = require('node-uuid');
var exec = require('child_process').exec;

//ModelService模型
function ModelService(modelser)
{
    if(modelser != null)
    {
        this._id = modelser._id;
        this.ms_model = modelser.ms_model;
        this.mv_num = modelser.mv_num;
        this.ms_des = modelser.ms_des;
        this.ms_update = modelser.ms_update;
        this.ms_path = modelser.ms_path;
        this.ms_file = modelser.ms_file;
        this.ms_xml = modelser.ms_xml;
        this.ms_status = modelser.ms_status;
        this.ms_user = modelser.ms_user;
    }
    else
    {
        this._id = new ObjectId();
        this.ms_model = '';
        this.mv_num = 0;
        this.ms_des = '';
        this.ms_update = '';
        this.ms_path = '';
        this.ms_file = '';
        this.ms_xml = '';
        this.ms_status = 0;
        this.ms_user = '';
    }
    return this;
}

module.exports = ModelService;

//新增模型服务信息
ModelService.prototype.save = function(callback)
{
    //ModelService
    var modelservice = {
        _id : new ObjectId(this._id),
        ms_model : this.ms_model,
        mv_num : this.mv_num,
        ms_des : this.ms_des,
        ms_update : this.ms_update,
        ms_path : this.ms_path,
        ms_file : this.ms_file,
        ms_xml : this.ms_xml,
        ms_status : this.ms_status,
        ms_user : this.ms_user
    };

    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }
        //打开数据集
        db.collection('modelservice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            //插入一条数据
            collection.insert(modelservice,{safe:true},function(err,modelservice)
            {
                mongodb.close();
                if(err)
                {
                    return callback(err);
                }
                callback(null,modelservice.ops[0]);
            });
        });
    });
};

//根据计算服务器获取模型服务
ModelService.getAll = function(start, end, callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            console.log(err);
            return callback(err);
        }

        db.collection('modelservice',function(err,collection)
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
};

//根据OID获取Model
ModelService.getByOID = function(_oid,callback)
{
    //打开数据库
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        //打开数据集
        db.collection('modelservice',function(err,collection)
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

//更新模型数据
ModelService.update = function(newmodelser,callback)
{
    mongodb.open(function(err,db)
    {
        if(err)
        {
            return callback(err);
        }

        db.collection('modelservice',function(err,collection)
        {
            if(err)
            {
                mongodb.close();
                return callback(err);
            }
            collection.update(
                {_id:newmodelser._id},
                {$set:{
                    ms_model : newmodelser.ms_model,
                    mv_num : newmodelser.mv_num,
                    ms_path : newmodelser.ms_path,
                    ms_file : newmodelser.ms_file,
                    ms_xml : newmodelser.ms_xml,
                    ms_status : newmodelser.ms_status,
                    ms_user : newmodelser.ms_user
                }},
                function(err, modelservice)
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

//启动一个模型服务实例
ModelService.run = function (ms_id, callback) {
    this.getByOID(ms_id, function (err, ms) {
        if(err)
        {
            return callback(err);
        }
        ModelService.getByOID(ms_id, function (err, ms) {
           fs.readFile(__dirname + '/../geo_model/' + ms.ms_path + 'package.config', 'utf-8',function(err,data){
                if(err){
                    return callback(err);
                }else{
                    var params = data.split('\r\n');
                    var startPos = '';
                    var muid = uuid.v1();
                    for(var i = 0; i < params.length; i++)
                    {
                        params[i] = params[i].split(' ');
                        if(params[i][0] == 'start')
                        {
                            startPos = params[i][1];
                        }
                    }
                    //执行程序
                    exec(__dirname + '/../geo_model/' + ms.ms_path + startPos, [muid] ,{
                        cwd:__dirname + '/../geo_model/' + ms.ms_path
                    });
                    return callback(null, muid, ms);
                }
            });
        });
        return callback(null, true);
    });
}
