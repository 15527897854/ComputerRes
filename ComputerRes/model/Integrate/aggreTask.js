/**
 * Created by Administrator on 4.19.
 */

var mongoose = require('../mongooseModel');

var mongodb = require('../mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('../modelBase');

function AggreTask(aggreTask){
    if(aggreTask){
        for(var key in aggreTask){
            this[key] = aggreTask[key];
        }
        if(!taskInstance._id){
            this._id = new ObjectId();
        }
    }
    else{
        this._id = new ObjectId();
        this.taskCfg = {};
        this.taskInfo = {};
        this.taskState = {};
        this.MSState = [];
        this.time = (new Date()).getTime();
    }
}

AggreTask.__proto__ = ModelBase;
module.exports = AggreTask;

var taskSchema = new mongoose.Schema({
    taskCfg:mongoose.Schema.Types.Mixed,
    taskInfo:mongoose.Schema.Types.Mixed,
    taskState:String,
    MSState:Array,
    time:Number
},{collection:'aggreTask'});

var taskModel = mongoose.model('aggreTask',taskSchema);
AggreTask.baseModel = taskModel;
AggreTask.modelName = 'aggreTask';
