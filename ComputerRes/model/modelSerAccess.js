/**
 * Created by Franklin on 2017/5/24.
 */

var ObjectId = require('mongodb').ObjectID;
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');

function ModelSerAccess(msa) {
    if(msa != null)
    {
        this._id = msa._id;
        this.username = msa.username;
        this.pwd = msa.pwd;
        this.platform = msa.platform;
        this.accepted = msa.accepted;
        this.pid = msa.pid;
        this.msrs = msa.msrs;
    }
    else
    {
        this._id = new ObjectId();
        this.username = '';
        this.pwd = 0;
        this.platform = 0;
        this.accepted = 0;
        this.pid = '';
        this.msrs = [];
    }
}

ModelSerAccess.__proto__ = ModelBase;
module.exports = ModelSerAccess;

var ModelSerAccessSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    username : String,
    pwd : String,
    deadline : String,
    times : Number,
    pid : String,
    msrs : Array
},{collection:'modelseraccess'});
var ModelSerAccessModel = mongoose.model('modelseraccess',ModelSerAccessSchema);
ModelSerAccess.baseModel = ModelSerAccessModel;
ModelSerAccess.modelName = "modelseraccess";

ModelSerAccess.getByPID = function(pid, callback){
    ModelSerAccess.getByWhere({pid : pid}, this.returnFunction(callback, 'error in getting ModelSerAccess by PID in model layer!'));
}

ModelSerAccess.getByMSRID = function(msrid, callback){
    ModelSerAccess.getByWhere({msrs : msrid }, this.returnFunction(callback, 'error in getting ModelSerAccess by MSRID in model layer!'))
}