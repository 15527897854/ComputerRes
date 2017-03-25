/**
 * Created by Franklin on 2016/9/13.
 */

var Child = require('../model/child');

function ChildCtrl() {
    
}

module.exports = ChildCtrl;

//得到全部子节点信息
ChildCtrl.getAll = function (callback) {
    Child.getAll(function (err, data) {
       if(err)
       {
           return callback(err)
       }
       return callback(null, data);
    });
};

//根据OID得到子节点信息
ChildCtrl.getByOID = function (oid, callback) {
    Child.getByOID(oid, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, child);
    });
};

//条件查询
ChildCtrl.getByWhere = function (where, callback) {
    Child.getByWhere(where, function (err, child) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, child);
    });
};

//根据Host查询
ChildCtrl.getByHost = function (host, callback) {
    Child.getByHost(host, function (err, data) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//新增子节点
ChildCtrl.AddNewChild = function(child, callback)
{
    var cld = new Child(child);
    cld.save(function (err, item) {
        if(err)
        {
            return callback(err);
        }
        return callback(null, item);
    });
};