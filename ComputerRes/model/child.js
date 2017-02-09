/**
 * Created by Franklin on 2016/9/12.
 * for child node Computer Resource
 */
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('./mongooseModel');

function Child(cld) {
    if(cld != null)
    {
        this.host = cld.host;
        this.port = cld.port;
        this.platform = cld.platform;
    }
    else
    {
        this.host = '';
        this.port = 0;
        this.platform = 0;
    }
}

module.exports = Child;

var ChildSchema = new mongoose.Schema({
    host:String,
    port:String,
    platform:Number
},{collection:'child'});
var ChildModel = mongoose.model('child',ChildSchema);
//新增节点
Child.prototype.save = function (callback) {
    var cld = {
        host : this.host,
        port : this.port,
        platform : this.platform
    };
    cld = new ChildModel(cld);
    cld.save(function (err, res) {
        callback(err,res);
    });
};

//得到全部子节点
Child.getAll = function (callback) {
    ChildModel.find({},function (err, res) {
        callback(err,res);
    });
};

//通过OID查询子节点信息
Child.getByOID = function (_oid, callback) {
    var oid = new ObjectId(_oid);
    ChildModel.findOne({_id:oid},function (err, res) {
        callback(err,res);
    });
};

//条件查询
Child.getByWhere = function (where, callback) {
    ChildModel.findOne(where,function (err, res) {
        callback(err,res);
    });
};