/**
 * Created by Administrator on 4.19.
 */

var mongoose = require('../mongooseModel');

var mongodb = require('../mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('../modelBase');

function AggreSolution(aggreSolution){
    if(aggreSolution){
        this._id = aggreSolution._id;
        this.layoutCfg = aggreSolution.layoutCfg;
        this.solutionCfg = aggreSolution.solutionCfg;
        this.solutionInfo = aggreSolution.solutionInfo;
        this.time = aggreSolution.time;
    }
    else{
        this._id = new ObjectId();
        this.layoutCfg = {};
        this.solutionCfg = {};
        this.solutionInfo = {};
        this.time = new Date().getTime();
    }
}

AggreSolution.__proto__ = ModelBase;
module.exports = AggreSolution;

var solutionSchema = new mongoose.Schema({
    layoutCfg:mongoose.Schema.Types.Mixed,
    solutionCfg:mongoose.Schema.Types.Mixed,
    solutionInfo:mongoose.Schema.Types.Mixed,
    time:Number
},{collection:'aggreSolution'});

var solutionModel = mongoose.model('aggreSolution',solutionSchema);
AggreSolution.baseModel = solutionModel;
AggreSolution.modelName = 'aggreSolution';

AggreSolution.getServiceByMSID = function (_id, MSID, cb) {
    AggreSolution.getByOID(_id,function (err, solution) {
        if(err){
            return cb(err);
        }
        else{
            var serviceList = solution.solutionCfg.serviceList;
            for(let i=0;i<serviceList.length;i++){
                var service = serviceList[i];
                if(service._id == MSID){
                    return cb(null,service);
                }
            }
            return cb(null,null);
        }
    })
};