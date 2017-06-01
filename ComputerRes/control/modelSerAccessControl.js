/**
 * Created by Franklin on 2017/5/24.
 */

var ModelSerAccessModel = require('../model/modelSerAccess');
var ModelSerModel = require('../model/modelService');
var ModelSerCtrl = require('./modelSerControl');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');
var ParamCheck = require('../utils/paramCheck');

var ModelSerAccessControl = function(){};

ModelSerAccessControl.__proto__ = ControlBase;
ModelSerAccessControl.model = ModelSerAccessModel;

module.exports = ModelSerAccessControl;

//通过Path查询这条记录所关联的模型服务
ModelSerAccessControl.getModelSerByPath = function(path, callback){
    ModelSerAccessModel.getByPath(path, function(err, msa){
        if(err){
            return callback(err);
        }
        msa = msa[0];
        if(msa){
            ModelSerModel.getByPID(msa.pid, function(err, ms){
                if(err){
                    return callback(err);
                }
                if(ms.length == 0){
                    return callback(null, null);
                }
                return callback(null, ms[0]);
            });
        }
        else{
            return callback(null, null);
        }
    });
};

//通过Path查询这条记录所需的数据
ModelSerAccessControl.getModelSerInputDataByPath = function(path, callback){
    ModelSerAccessModel.getByPath(path, function(err, msa){
        if(err){
            return callback(err);
        }
        msa = msa[0];
        if(!msa){
            return callback(null, null);
        }
        ModelSerModel.getByPid(msa.pid, function(err, ms){
            if(err){
                return callback(err);
            }
            ms = ms[0];
            if(!ms){
                return callback(err, null)
            }
            ModelSerCtrl.getInputData(ms._id, function(err, data){
                if(err){
                    return callback(err, data);
                }
                return callback(null, data);
            });
        });
    });
};

//模型权限登录
ModelSerAccessControl.auth = function(path, username, pwd, callback){
    if(ParamCheck.checkParam(callback, path)){
        ModelSerAccessModel.getByPath(path, function(err, msa){
            if(err){
                return callback(err);
            }
            msa = msa[0];
            if(msa){
                if(username == msa.username){
                    //pwd = CommonMethod.decrypto(pwd);
                    var pwd_md5 = CommonMethod.md5(pwd);
                    if(pwd_md5 == msa.pwd){
                        return callback(null, true);
                    }
                }
            }
            return callback(null, false);
        });
    }
};

//检查是否有此Path权限
ModelSerAccessControl.authPath = function(path, callback){
    if(ParamCheck.checkParam(callback, path)){
        ModelSerAccessModel.getByPath(path, function(err, msa){
            if(err){
                return callback(err);
            }
            msa = msa[0];
            if(msa){
                return callback(null, true);
            }
            return callback(null, false);
        });
    }
}

ModelSerAccessControl