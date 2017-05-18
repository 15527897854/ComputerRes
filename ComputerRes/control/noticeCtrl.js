/**
 * Created by ChaoRan on 2016/8/20.
 */

var ModelNotice = require('../model/notice');
var controlBase = require('./controlBase');

function ModelNoticeCtrl() {

}

ModelNoticeCtrl.__proto__ = controlBase;
ModelNoticeCtrl.model = ModelNotice;
module.exports = ModelNoticeCtrl;


//将未读标记为已读
ModelNoticeCtrl.updateState = function (where, callback) {
    if(where._id == 'all'){
        ModelNotice.updateByWhere({},{$set:{hasRead:true}},{multi:true,upsert:false},function (err, data) {
            if(err){
                return callback(null,JSON.stringify({status:0}));
            }
            return callback(null,JSON.stringify({status:1}));
        });
    }
    else{
        ModelNotice.getByOID(where._id,function (err, data) {
            if(err){
                return callback(null,JSON.stringify({status:0}));
            }
            if(data){
                data.hasRead = true;
                ModelNotice.update(data,function (err, data) {
                    if(err){
                        return callback(null,JSON.stringify({status:0}));
                    }
                    return callback(null,JSON.stringify({status:1}));
                })
            }
        });
    }
};