/**
 * Created by ChaoRan on 2016/8/20.
 */

var ModelNotice = require('../model/notice');

function ModelNoticeCtrl() {

}

module.exports = ModelNoticeCtrl;

ModelNoticeCtrl.getWhere = function(where,callback) {
    ModelNotice.getWhere(where, function(err, data)
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
    ModelNotice.delByOID(msid,function(err, data)
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

ModelNoticeCtrl.update = function(ms, callback) {
    ModelNotice.update(ms, function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};