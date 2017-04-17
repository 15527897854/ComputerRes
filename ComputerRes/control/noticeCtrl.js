/**
 * Created by ChaoRan on 2016/8/20.
 */

var ModelNotice = require('../model/notice');

function ModelNoticeCtrl() {

}

module.exports = ModelNoticeCtrl;

ModelNoticeCtrl.getByWhere = function(where,callback) {
    ModelNotice.getByWhere(where, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelNoticeCtrl.addNotice = function(newNotice, callback) {
    ModelNotice.save(newNotice,function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelNoticeCtrl.delByOID = function(msid, callback) {
    ModelNotice.delete(msid,function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelNoticeCtrl.getByOID = function(msid, callback) {
    ModelNotice.getByOID(msid,function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelNoticeCtrl.update = function(notice, callback) {
    ModelNotice.update(notice, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

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