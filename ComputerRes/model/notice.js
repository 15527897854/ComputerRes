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
    // time : {type:Date, index: { unique: true, expires: '3600*24*14' }},
    time : {type:Date, index: { unique: true,type:-1}},
    title : String,
    detail : String,
    type : String,
    hasRead : Boolean
},{collection:'notice'});

var Note = mongoose.model('notice',noteSchema);
Notice.baseModel = Note;
Notice.modelName = 'notice';