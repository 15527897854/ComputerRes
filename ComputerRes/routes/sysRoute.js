/**
 * Created by Franklin on 16-3-23.
 * Route for Sys
 */
var SysControl = require('../control/sysControl');
var RouteBase = require('./routeBase');
var registerCtrl = require('../control/registerCtrl');
var sweCtrl = require('../control/softwareEnCtrl');
var hweCtrl = require('../control/hardwareEnCtrl');
var fs = require('fs');

module.exports = function(app)
{
    //得到当前状态页面
    app.route('/status')
        .get(function(req, res, next)
        {
            res.render('status');
        });

    //得到当前状态JSON数据
    app.route('/json/status')
        .get(function(req, res, next)
        {
            SysControl.getState(function(err,sysinfo)
            {
                res.end(JSON.stringify(sysinfo));
            });
        });

    app.route('/info')
        .get(function(req,res,next)
        {
            SysControl.getInfo(req.headers, function(err,data)
            {
                if(err)
                {
                    return res.end('Error!');
                }
                return res.end(JSON.stringify(data));
            })
        });

    app.route('/settings')
        .get(function(req, res, next){
            SysControl.getSettings(RouteBase.returnFunction(res, 'error in getting setting'));
        });

    app.route('/parent')
        .get(function(req, res, next){
            SysControl.getParent(RouteBase.returnFunction(res, 'error in getting parent'));
        })
        .put(function(req, res, next){
            var ac = req.query.ac;
            var host = req.query.host;
            var port = req.query.port;
            if(ac == 'reset'){
                host = req.connection.remoteAddress;
                host = host.substr(host.lastIndexOf(':') + 1);
                SysControl.resetParent(host, RouteBase.returnFunction(res, 'Error in resetting parent!'));
            }
            else{
                SysControl.setParent(host, port, RouteBase.returnFunction(res, 'Error in updating parent!'));
            }
        });

    app.route('/checkserver/:server')
        .get(function(req, res, next){
            var server = req.params.server;
            SysControl.checkServer(server, function(reslut){
                return res.end(JSON.stringify(reslut));
            });
        });
    
    app.route('/system/registration')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'register'){
                SysControl.register(function (rst) {
                    return res.end(rst)
                })
            }
            else if(ac == 'deregister'){
                SysControl.deregister(function (rst) {
                    return res.end(rst)
                });
            }
        });
	app.route('/setting/enviroment')
        .get(function (req, res, next) {
            res.render('enviro');
        });

    app.route('/setting')
        .get(function (req, res, next) {
            res.render('setting');
        });


    //region 环境字典
    //type : hardware software
    //method : auto get select
    //ac : update new del
    app.route('/setting/enviro')
        .get(function (req, res, next) {
            var type = req.query.type;
            //分为三种：get、auto、select
            var method = req.query.method;
            var enviroCtrl = null;
            if(type == 'hardware' || type == 'hwe'){
                enviroCtrl = hweCtrl;
            }
            else if(type == 'software' || type == 'swe'){
                enviroCtrl = sweCtrl;
            }
            var ab = req.query.AB;
            var getAll = null;
            if(ab && ab !='A'){
                getAll = enviroCtrl.getAllA;
            }
            else{
                getAll = enviroCtrl.getAllB;
            }

            if(method == 'auto'){
                enviroCtrl.autoDetect(function (data) {
                    return res.end(data);
                })
            }
            else if(method == 'get'){
                getAll(function (data) {
                    return res.end(data);
                })
            }
            else if(method == 'select'){
                
            }
        })
        .post(function (req, res, next) {
            var type = req.query.type;
            var ac = req.query.ac;
            var method = req.query.method;
            var newEnviro = req.body;
            var resCallback = function (data) {
                return res.end(data);
            };
            var enviroCtrl = null;
            if(type == 'hardware'){
                enviroCtrl = hweCtrl;
            }
            else if(type == 'software'){
                enviroCtrl = sweCtrl;
            }

            if(method){
                if(method == 'auto'){
                    enviroCtrl.addByAuto(newEnviro.itemsID,resCallback);
                }
                else if(method == 'select'){
                    enviroCtrl.addBySelect(newEnviro.itemsID,resCallback);
                }
                else{
                    if(ac == 'update'){
                        enviroCtrl.updateItem(newEnviro,resCallback)
                    }
                    else if(ac == 'new'){
                        enviroCtrl.addItem(newEnviro,resCallback)
                    }
                    else if(ac == 'del'){
                        enviroCtrl.deleteItem(newEnviro._id,resCallback)
                    }
                }
            }
        });

    app.route('/setting/enviro/matching')
        .get(function (req, res, next) {
            var type=req.query.type;
            var demands = JSON.parse(req.query.demands);
            var enviro;
            if(type == 'hardware'){
                enviro = hweCtrl;
            }
            else if(type == 'software'){
                enviro = sweCtrl;
            }
            enviro.ensMatched(demands,function (data) {
                return res.end(data);
            })
        });

    app.route('/setting/enviro/matchrst')
        .get(function (req, res) {
            var demand = req.query.demand;
            var type = req.query.type;
            
        });
    //endregion

    //管理员信息
    app.route('/json/admininfo')
        .get(function(req, res, next){
            SysControl.getAdminInfo(RouteBase.returnFunction(res, 'Error in getting admin info!', 'ss_value'));
        })
        .put(function(req, res, next){
            SysControl.alterNameAndPwdWithAuth(req.query.adminName, req.query.pwd, req.query.newAdminName, req.query.newAdminPwd, RouteBase.returnFunction(res, 'Error in alter admin info!'));
        });
    //管理员登录
    app.route('/login')
        .get(function(req, res, next){
            res.render('login')
        })
        .post(function(req, res, next){
            SysControl.adminLogin(req.body.adminname, req.body.adminpwd, function(err, result){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : JSON.stringify(err)
                    }));
                }
                if(result){
                    req.session.admin = req.body.adminname;
                    return res.end(JSON.stringify({
                        result : 'suc',
                        data : true
                    }));
                }
                else{
                    return res.end(JSON.stringify({
                        result : 'suc',
                        data : false
                    }));
                }
            });
        });
    
    //获取、设置门户用户名信息
    app.route('/json/portalinfo')
        .get(function(req, res, next){
            SysControl.getPortalUName(RouteBase.returnFunction(res, 'Error in getting portal name!', 'ss_value'));
        })
        .put(function(req, res, next){
            var portalname = req.query.portalname;
            var portalpwd = req.query.portalpwd;
            SysControl.setPortalInfo(portalname, portalpwd, function(err, result){
                if(err){
                    return res.end(JSON.stringify({
                        result : 'err',
                        message : err
                    }));
                }
                if(result.result == 'suc'){
                    return res.end(JSON.stringify({
                        result : 'suc',
                        data : '1'
                    }));
                }
                else{
                    return res.end(JSON.stringify({
                        result : 'fail',
                        data : '0'
                    }));
                }
            });
        });
    //管理员页面渲染
    app.route('/admininfo')
        .get(function(req, res, next){
            res.render('userInfo');
        });
    //获取IPToken
    app.route('/token')
        .get(function(req, res, next){
            SysControl.getToken(req.query.ip, RouteBase.returnFunction(res, 'Error in getting token!'));
        });
    
};