var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');

function SoftwareEnviro(swe) {
    if(swe){
        this._id = swe._id;
        this.name = swe.name;
        this.version = swe.version;
        this.alias = swe.alias;
        this.des = swe.des;
        this.type = swe.type;
        this.publisher = swe.publisher;
        // this.dependencies = swe.dependencies;
    }
    else{
        this._id = new ObjectId();
        this.name = '';
        this.version = '';
        this.alias = [];
        this.des = '';
        this.type = '';
        this.publisher = '';
        // this.dependencies = [];
    }
}

SoftwareEnviro.__proto__ = ModelBase;
module.exports = SoftwareEnviro;

var SWESchema = new mongoose.Schema({
    name : String,
    version:String,
    alias:Array,
    description:String,
    type:String,
    publisher:String
    // dependencies:Array
},{collection:'softwareEnviro'});

var SWE = mongoose.model('softwareEnviro',SWESchema);
SoftwareEnviro.baseModel = SWE;
SoftwareEnviro.modelName = 'softwareEnviro';