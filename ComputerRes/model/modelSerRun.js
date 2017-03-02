/**
 * 数据库的增删查改
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var settings = require('../setting');
var mongoose = require('./mongooseModel');

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

var MSRSchema = new mongoose.Schema({
    ms_id : mongoose.Schema.Types.ObjectId,
    msr_ms :  mongoose.Schema.Types.Mixed,
    msr_date :  String,
    msr_time : Number,
    msr_user :  mongoose.Schema.Types.Mixed,
    msr_guid :  String,
    msr_input :  Array,
    msr_output :  Array,
    msr_des :  String
},{collection:'modelserrun'});
var MSR = mongoose.model('modelserrun',MSRSchema);

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
    modelserRun = new MSR(modelserRun);
    modelserRun.save(function (err, res) {
        if(err)
        {
            console.log('mongoDB err in save!');
            return callback(err);
        }
        callback(err,res);
    });
};

//获取模型运行服务
ModelSerRun.getAll = function(callback)
{
    MSR.find({},function (err, res) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        callback(err,res);
    });
};

//根据OID获取ModelSerRun
ModelSerRun.getByOID = function(_oid, callback)
{
    var oid = new ObjectId(_oid);
    MSR.findOne({_id:oid},function (err, res) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        callback(err,res);
    });
};

//根据ms_id获取ModelSerRun
ModelSerRun.getByMsId = function(_msid, callback)
{
    var msid = new ObjectId(_msid);
    MSR.find({ms_id:msid},function (err, res) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        callback(err,res);
    });
};

//根据msr_guid获取ModelSerRun
ModelSerRun.getByGUID = function(guid, callback)
{
    MSR.findOne({msr_guid : guid},function (err, res) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        callback(err,res);
    });
};

//更新模型运行数据
ModelSerRun.update = function(newmsr, callback)
{
    var where = {_id:newmsr._id},
        toUpdate = newmsr;
    MSR.update(where,toUpdate,function (err, res) {
        if(err)
        {
            console.log('mongoDB err in update!');
            return callback(err);
        }
        callback(err,res);
    });
};