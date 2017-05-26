/**
 * Created by Franklin on 2017/5/24.
 */

var ModelSerAccessModel = require('../model/modelSerAccess');
var ModelSerModel = require('../model/modelService');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');
var ParamCheck = require('../utils/paramCheck');

var ModelSerAccessControl = function(){};

ModelSerAccessControl.__proto__ = ControlBase;
ModelSerAccessControl.model = ModelSerAccessModel;

module.exports = ModelSerAccessControl;

//同过Path查询这条记录所关联的模型服务
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
                return callback(null, ms);
            });
        }
        else{
            return callback(null, null);
        }
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
            return callback(null, false)
        });
    }
};

ModelSerAccessControl