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
        this.username = msa.username;
        this.pwd = msa.pwd;
        this.platform = msa.platform;
        this.accepted = msa.accepted;
        this.pid = msa.pid;
        this.path = msa.path;
    }
    else
    {
        this.username = '';
        this.pwd = 0;
        this.platform = 0;
        this.accepted = 0;
        this.pid = '';
        this.path = '';
    }
}

ModelSerAccess.__proto__ = ModelBase;
module.exports = ModelSerAccess;

var ModelSerAccessSchema = new mongoose.Schema({
    username:String,
    pwd:String,
    deadline:String,
    times:Number,
    pid :String,
    path :String
},{collection:'modelseraccess'});
var ModelSerAccessModel = mongoose.model('modelseraccess',ModelSerAccessSchema);
ModelSerAccess.baseModel = ModelSerAccessModel;
ModelSerAccess.modelName = "modelseraccess";

ModelSerAccess.getByPath = function(path, callback){
    ModelSerAccess.getByWhere({path : path}, ModelBase.returnFunction(callback, 'error in getting ModelSerAccess by path in model layer!'));
}