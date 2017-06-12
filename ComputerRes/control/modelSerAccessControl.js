/**
 * Created by Franklin on 2017/5/24.
 */

var ModelSerAccessModel = require('../model/modelSerAccess');
var ModelSerModel = require('../model/modelService');
var ModelSerRunModel = require('../model/modelSerRun');
var ModelSerCtrl = require('./modelSerControl');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');
var ParamCheck = require('../utils/paramCheck');

var ModelSerAccessControl = function(){};

ModelSerAccessControl.__proto__ = ControlBase;
ModelSerAccessControl.model = ModelSerAccessModel;

module.exports = ModelSerAccessControl;

//模型权限登录
ModelSerAccessControl.auth = function(msid, username, pwd, callback){
    if(ParamCheck.checkParam(callback, msid)){
        ModelSerCtrl.getByOID(msid, function(err, ms){
            if(ms == null){
                return callback(null, false);
            }
            ModelSerAccessModel.getByPID(ms.ms_model.p_id, function(err, msa){
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
        });

    }
};

//判断用户是否有MSRID权限
ModelSerAccessControl.authMsrID = function(msrid, username, pwd, callback){
    if(ParamCheck.checkParam(callback, msrid)){
        ModelSerAccessModel.getByMSRID(msrid, function(err, msa){
            if(err){
                return callback(err);
            }
            if(msa.length == 0){
                return callback(null, false);
            }
            msa = msa[0];
            var pwd_md5 = CommonMethod.md5(pwd);
            if(msa.username == username && msa.pwd == pwd_md5){
                return callback(null, true);
            }
            else{
                return callback(null, false);
            }
        });
    }
};

//带权限运行模型
ModelSerAccessControl.run = function(msid, inputData, outputData, user, callback){
    ModelSerCtrl.getByOID(msid, function(err, ms){
        if(err){
            return callback(err);
        }
        ModelSerAccessModel.getByPID(ms.ms_model.p_id, function(err, msa){
            if(err){
                return callback(err);
            }
            if(msa.length == 0){
                return callback(null, {
                    auth : false,
                    message : '无权限记录！'
                });
            }
            msa = msa[0];
            ModelSerAccessControl.auth(msid, user.username, user.pwd, function(err, result){
                if(result){
                    if(msa.times != -1){
                        if(msa.times < 1){
                            return callback(null, {
                                auth : false,
                                message : '剩余次数不足!'
                            });
                        }
                        else{
                            msa.times = msa.times - 1;
                        }
                    }
                    if(msa.deadline != null && msa.deadline.trim() != ''){
                        var deadline = new Date(msa.deadline);
                        var date_now = new Date();
                        if(deadline < date_now){
                            return callback(null, {
                                auth : false,
                                message : '超过权限时长!'
                            });   
                        }
                    }
                    var msaid = msa._id;
                    ModelSerAccessModel.update(msa, function(err, result){
                        if(err){
                            return callback(err);
                        }
                        ModelSerCtrl.getByPID(msa.pid, function(err, ms){
                            if(err){
                                return callback(err);
                            }
                            ModelSerCtrl.run(msid, inputData, outputData, {
                                u_name : msa.username,
                                u_type : 1
                            }, function(err, msr){
                                if(err){
                                    return callback(err);
                                }
                                ModelSerAccessControl.addMSR(msaid, msr._id, function(err, result){
                                    if(err){
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        auth : true,
                                        msr : msr
                                    });
                                });
                            });
                        });
                    });
                }
                else{
                    return callback(null, {
                        auth : false,
                        message : '无权限记录！'
                    });
                }
            })
        });
    });
}

//添加模型权限的运行记录
ModelSerAccessControl.addMSR = function(msaid, msrid, callback){
    if(ParamCheck.checkParam(callback, msaid)){
        ModelSerAccessModel.getByOID(msaid, function(err, msa){
            if(err){
                return callback(err);
            }
            if(!msa){
                return callback(new Error('Can not find MSA'));
            }
            msa.msrs.push(msrid);
            ModelSerAccessModel.update(msa, function(err, result){
                if(err){
                    return callback(err);
                }
                return callback(null, true);
            });
        });
    }
}