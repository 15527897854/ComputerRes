/**
 * Created by Franklin on 2017/3/16.
 */
var CommonBase = require('../utils/commonBase');
var ParamCheck = require('../utils/paramCheck');
var ObjectId = require('mongodb').ObjectID;

var ModelBase = function () {};
ModelBase.__proto__ = CommonBase;
this.baseModel = null;
this.modelName = "";

module.exports = ModelBase;

ModelBase.delete = function (_oid, callback) {
    if(ParamCheck.checkParam(callback, _oid))
    {
        var oid = new ObjectId(_oid);
        this.baseModel.remove({_id: oid},this.returnFunction(callback, "Error in removing" + this.modelName));
    }
};

ModelBase.getByOID = function(_oid,callback){
    if(ParamCheck.checkParam(callback, _oid))
    {
        var oid = new ObjectId(_oid);
        this.baseModel.findOne({'_id' : oid}, this.returnFunction(callback, 'Error in getting a ' + this.modelName + ' by id'));
    }
};

ModelBase.getByWhere = function (where, callback) {
    if(ParamCheck.checkParam(callback, where))
    {
        this.baseModel.find(where, this.returnFunction(callback, 'Error in getting a ' + this.modelName + ' by id'));
    }
};

ModelBase.update = function (newItem, callback) {
    var where = {'_id':newItem._id},
        toUpdate = newItem;
    this.baseModel.update(where,toUpdate,this.returnFunction(callback, 'Error in updating a ' + this.modelName + ' by where'));
};