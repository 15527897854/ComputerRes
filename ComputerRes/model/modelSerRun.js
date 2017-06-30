/**
 * 数据库的增删查改
 */

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var settings = require('../setting');
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var CheckParam = require('../utils/paramCheck');

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
        this.msr_status = modelserRun.msr_status;
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
        this.msr_status = -1;
        this.msr_des = '';
    }
    return this;
}
ModelSerRun.__proto__ = ModelBase;
ModelSerRun.modelName = "model service run";

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
    msr_status : Number,
    msr_des :  String
},{collection:'modelserrun'});
var MSR = mongoose.model('modelserrun',MSRSchema);

ModelSerRun.baseModel = MSR;

//获取模型运行服务
ModelSerRun.getAll = function(callback)
{
    MSR.find({}, this.returnFunction(callback, "error in getting all model service runs"));
};

//根据ms_id获取ModelSerRun
ModelSerRun.getByMsId = function(_msid, callback){
    if(CheckParam.checkParam(callback,_msid)){
        var msid = new ObjectId(_msid);
        MSR.find({ms_id:msid}, this.returnFunction(callback, "error in getting by MsId model service runs"));
    }
};

//根据msr_guid获取ModelSerRun
ModelSerRun.getByGUID = function(guid, callback){
    if(CheckParam.checkParam(callback,guid)){
        MSR.findOne({msr_guid : guid},this.returnFunction(callback, "error in getting by GUID model service runs"));
    }
};

//根据输出数据的DataId获取此数据
ModelSerRun.getByOutputDataID = function(dataid, callback){
    if(CheckParam.checkParam(callback, dataid)){
        MSR.find({"msr_output.DataId" : { "$in" : [ dataid ]}}, function(err, msr){
            if(err){
                return callback(err);
            }
            if(msr.length == 0){
                return callback(null, null)
            }
            msr = msr[0];
            for(var i = 0; i < msr.msr_output.length; i++){
                if(msr.msr_output[i].DataId == dataid){
                    return callback(null, msr.msr_output[i]);
                }
            }
            return callback(null, null);
        });
    }
};

//更新描述信息
ModelSerRun.updateDes = function (_oid, msr_des, callback) {
    if(CheckParam.checkParam(callback, _oid))
    {
        if(CheckParam.checkParam(callback, msr_des))
        {
            var oid = new ObjectId(_oid);
            var where = {'_id' : oid};
            var update = {
                msr_des : msr_des
            };
            MSR.update(where, update, this.returnFunction(callback, 'Error in updating msr_des a ' + this.modelName + ' by where'));
        }
    }
};

