/**
 * Created by Administrator on 4.19.
 */
var registerModel = require('../model/register');
var ControlBase = require('./controlBase');
var RemoteControl = require('./remoteReqControl');
var setting = require('../setting');
var sysCtrl = require('./sysControl');

var registerCtrl = function () {};
registerCtrl.__proto__ = ControlBase;
module.exports = registerCtrl;

//向门户注册：取数据、改数据、post数据、存数据
registerCtrl.register = function (callback) {
    registerModel.getByWhere({},function (err, data) {
        var rst;
        if(err){
            console.log('err in getByWhere of register data!');
            rst = {status: -1};
            return callback(JSON.stringify(rst));
        }
        else{
            var post2portal = function (registerInfo,isupdate) {
                var form = {
                    ac:'register',
                    Info:JSON.stringify(registerInfo)
                };
                //向门户请求注册
                // var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeServlet?ac=register&Info=' + JSON.stringify(registerInfo);
                var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeServlet?';
                RemoteControl.postByServer(url,form,function (err, msg){
                    if(err){
                        console.log('err in post by server!');
                        rst = {status: -1};
                        return callback(JSON.stringify(rst));
                    }
                    else{
                        if(msg == '注册节点成功')
                            callback(JSON.stringify({status:-1}));
                        //存
                        if(isupdate){
                            registerModel.update(registerInfo,function (err, data){
                                if(err){
                                    console.log('err in update in mongoDB!');
                                    rst = {status: -1};
                                    return callback(JSON.stringify(rst));
                                }
                                else{
                                    rst = {status: 1};
                                    return callback(JSON.stringify(rst));
                                }
                            });
                        }
                        else{
                            registerModel.save(registerInfo,function (err, data){
                                if(err){
                                    console.log('err in update in mongoDB!');
                                    rst = {status: -1};
                                    return callback(JSON.stringify(rst));
                                }
                                else{
                                    rst = {status: 1};
                                    return callback(JSON.stringify(rst));
                                }
                            });
                        }
                        
                    }
                })
            };
            
            if(data.length){
                registerInfo = data[0];
                if(registerInfo.registered){
                    rst = {status: 2};
                    return callback(JSON.stringify(rst));
                }
                else if(!registerInfo.registered){
                    registerInfo.registered = true;
                    post2portal(registerInfo,true);
                }
            }
            else{
                //数据库没存，要动态生成，存到数据库中
                sysCtrl.getRegisterInfo(function (err, registerInfo){
                    registerInfo.registered = true;
                    post2portal(registerInfo);
                });
            }
        }
    });
};

//从门户注销：取数据、改数据、post数据、存数据
registerCtrl.deregister = function (callback) {
    //取
    registerModel.getByWhere({},function (err, data) {
        var rst;
        if(err){
            console.log('err in getByWhere of register data!');
            rst = {status: -1};
            return callback(JSON.stringify(rst));
        }
        else{
            if(data.length){
                registerInfo = data[0];
                if(!registerInfo.registered){
                    rst = {status: 2};
                    return callback(JSON.stringify(rst));
                }
                else if(registerInfo.registered){
                    //改
                    registerInfo.registered = false;
                    //向门户post信息...
                    // var form = {
                    //     ac: 'cancel',
                    //     _id: registerInfo._id
                    // };
                    var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ComputerNodeServlet?ac=cancel&_id=' + registerInfo._id;
                    RemoteControl.postByServer(url,null,function (err, msg) {
                        if(err){
                            console.log('err in post by server!');
                            rst = {status: -1};
                            return callback(JSON.stringify(rst));
                        }
                        else{
                            if(msg!='注销节点成功')
                                callback(JSON.stringify({status:-1}));
                            //存
                            registerModel.update(registerInfo,function (err, data) {
                                if(err){
                                    console.log('err in update in mongoDB!');
                                    rst = {status: -1};
                                    return callback(JSON.stringify(rst));
                                }
                                else{
                                    rst = {status: 1};
                                    return callback(JSON.stringify(rst));
                                }
                            });
                        }
                    })
                }
            }
            else{
                rst = {status: 2};
                return callback(JSON.stringify(rst));
            }
        }
    });
};

//获取注册状态，0：未注册    1：已注册    -1：查询失败
registerCtrl.getState = function (callback) {
    registerModel.getByWhere({},function (err, data) {
        if(err){
            console.log('err in getByWhere of register data!');
            return callback(-1);
        }
        else{
            if(data.length) {
                registerInfo = data[0];
                if (registerInfo.registered) {
                    return callback(1);
                }
                else if (!registerInfo.registered) {
                    return callback(0);
                }
            }
            else {
                return callback(0);
            }
        }
    })
};