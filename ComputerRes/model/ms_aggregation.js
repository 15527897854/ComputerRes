/**
 * Created by SCR on 2017/7/8.
 */
var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');

function Aggregation(aggre){
    if(aggre){
        this._id = aggre._id;
        this.name = aggre.name;
    }
    else{
        this._id = new ObjectId();
        this.name = '';
    }
}

Aggregation.__proto__ = ModelBase;
module.exports = Aggregation;

var AggreSchema = new mongoose.Schema({
    name : String,
    SADL : String,
    layout : String,
    deploy_time : String
},{collection:'aggregation'});

var AggreModel = mongoose.model('aggregation',AggreSchema);
Aggregation.baseModel = AggreModel;
Aggregation.modelName = 'aggregation';
