/**
 * Created by ChaoRan on 2016/8/20.
 */
var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;

function Notice(notice)
{
    if(notice != null)
    {
        if(notice._id){
            this._id = notice._id;
        }
        else {
            this._id = new ObjectId();
        }
        this.time = notice.time;
        this.ms_name = notice.ms_name;
        this.notice = notice.notice;
        this.type = notice.type;
        this.hasRead = notice.hasRead;
    }
    else
    {
        this._id = new ObjectId();
        this.time = '';
        this.ms_name = '';
        this.notice = '';
        this.type = '';
        this.hasRead = 0;
    }
    return this;
}

module.exports = Notice;

var noteSchema = new mongoose.Schema({
    time : {type:Date, index: { unique: true, expires: '3600*24*14' }},
    ms_name : String,
    notice : String,
    type : String,
    hasRead : Number
},{collection:'notice'});

var Note = mongoose.model('notice',noteSchema);

//新增模型服务信息
Notice.save = function(notice,callback) {
    notice = new Note(notice);
    notice.save(function (err, res) {
        callback(err,res);
    });
};

Notice.delByOID = function (_oid, callback) {
    var oid = new ObjectId(_oid);
    Note.remove({'_id':oid},function (err, res) {
        callback(err,res);
    });
};

Notice.getWhere = function(where, callback) {
    Note.find(where,function (err, res) {
        callback(err,res);
    });
};

Notice.getByOID = function(_oid, callback) {
    var oid = new ObjectId(_oid);
    Note.findOne({'_id':oid},function (err, res) {
        callback(err,res);
    });
};

Notice.update = function(newNotice,callback){
    var where = {'_id':newNotice._id},
        toUpdate = newNotice;
    Note.update(where,toUpdate,function (err, res) {
        callback(err,res);
    });
};