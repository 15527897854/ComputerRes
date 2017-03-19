/**
 * Created by ChaoRan on 2016/8/20.
 */
var mongoose = require('./mongooseModel');

var mongodb = require('./mongoDB');
var ObjectId = require('mongodb').ObjectID;
var ModelBase = require('./modelBase');
var ParamCheck = require('../utils/paramCheck');

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
Notice.__proto__ = ModelBase;
module.exports = Notice;

var noteSchema = new mongoose.Schema({
    time : {type:Date, index: { unique: true, expires: '3600*24*14' }},
    ms_name : String,
    notice : String,
    type : String,
    hasRead : Number
},{collection:'notice'});

var Note = mongoose.model('notice',noteSchema);
Notice.baseModel = Note;
Notice.modelName = 'model';

//新增模型服务信息
Notice.save = function(notice,callback) {
    notice = new Note(notice);
    notice.save(function (err, res) {
        if(err)
        {
            console.log('mongoDB err in save!');
            return callback(err);
        }
        callback(err,res);
    });
};

Notice.delByOID = function (_oid, callback) {
    ParamCheck.checkParam(callback,_oid);
    var oid = new ObjectId(_oid);
    Note.remove({'_id':oid},this.returnFunction(callback, 'Error in delete by oid in notice'));
};

Notice.getWhere = function(where, callback) {
    ParamCheck.checkParam(callback, where);
    Note.find(where,this.returnFunction(callback, 'Error in getting where in notice'));
};

Notice.getByOID = function(_oid, callback) {
    ParamCheck.checkParam(callback, _oid);
    var oid = new ObjectId(_oid);
    Note.findOne({'_id':oid},this.returnFunction(callback, 'Error in getting by oid in notice'));
};

