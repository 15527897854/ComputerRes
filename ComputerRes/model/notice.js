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
        this.title = notice.title;
        this.detail = notice.detail;
        this.type = notice.type;
        this.hasRead = notice.hasRead;
    }
    else
    {
        this._id = new ObjectId();
        this.time = '';
        this.title = '';
        this.detail = '';
        this.type = '';
        this.hasRead = false;
    }
    return this;
}
Notice.__proto__ = ModelBase;
module.exports = Notice;

var noteSchema = new mongoose.Schema({
    time : Date,
    title : String,
    detail : String,
    type : String,
    hasRead : Boolean
},{collection:'notice'});

var Note = mongoose.model('notice',noteSchema);
Notice.baseModel = Note;
Notice.modelName = 'notice';

Notice.getAll = function(callback){
    this.baseModel.find({}).sort({'time':-1}).exec(this.returnFunction(callback, 'Error in getting all notices by where'));
}

Notice.getAllByTypeAndRead = function(type, read, callback){
    var where = {};
    if(type){
        if(type == 'start'){
            where['type'] = 'start-run';
        }
        else if(type == 'start'){
            where['type'] = 'stop-run';
        }
        else if(type == 'delete'){
            where['type'] = 'del-ms';
        }
    }
    if(read){
        if(read == 'true'){
            where['hasRead'] = true;
        }
        if(read == 'false'){
            where['hasRead'] = false;
        }
    }
    this.baseModel.find(where).sort({'time':-1}).exec(this.returnFunction(callback, 'Error in getting all notices by where'));
}

Notice.markAllAsRead = function(callback){
    var update = {
        $set:{hasRead : true}
    };
    Note.update({hasRead : false}, update, {multi : true}, this.returnFunction(callback, 'Error in updating notice as read by oid'));
}

Notice.markAsRead = function(oid, callback){
    if(ParamCheck.checkParam(callback, oid)){
        var oid = new ObjectId(oid);
        var where = {'_id' : oid};
        var update = {
            hasRead : true
        };
        Note.update(where, update, this.returnFunction(callback, 'Error in updating notice as read by oid'));
    }
}