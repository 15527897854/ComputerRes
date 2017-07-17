/**
 * Created by Administrator on 4.19.
 */

var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');

function AggreTask(aggreTask){
    if(aggreTask){
        this._id = aggreTask._id;
        this.aggreCfg = aggreTask.aggreCfg;
        this.taskInfo = aggreTask.taskInfo;
        this.execStatus = aggreTask.execStatus;
        this.time = aggreTask.time;
    }
    else{
        this._id = new ObjectId();
        this.aggreCfg = {};
        this.taskInfo = {};
        this.execStatus = {};
        this.time = new Date();
    }
}

AggreTask.__proto__ = ModelBase;
module.exports = AggreTask;

var taskSchema = new mongoose.Schema({
    aggreCfg:mongoose.Schema.Types.Mixed,
    taskInfo:mongoose.Schema.Types.Mixed,
    execStatus:mongoose.Schema.Types.Mixed,
    time:Date
},{collection:'aggreTask'});

var taskModel = mongoose.model('aggreTask',taskSchema);
AggreTask.baseModel = taskModel;
AggreTask.modelName = 'aggreTask';
