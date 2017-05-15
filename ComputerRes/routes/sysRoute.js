/**
 * Created by Franklin on 16-3-23.
 * Route for Sys
 */
var SysControl = require('../control/sysControl');
var RouteBase = require('./routeBase');

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
                SysControl.setParent(host + ':' + port, RouteBase.returnFunction(res, 'Error in updating parent!'));
            }
        });


    app.route('/checkserver/:server')
        .get(function(req, res, next){
            var server = req.params.server;
            SysControl.checkServer(server, function(reslut){
                return res.end(JSON.stringify(reslut));
            });
        });
    
    app.route('/system/register')
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
                })
            }
        });

    //管理员信息
    app.route('/admininfo')
        .get(function(req, res, next){
            SysControl.getAdminInfo(RouteBase.returnFunction(res, 'Error in getting admin info!', 'ss_value'));
        })
        .put(function(req, res, next){
            SysControl.alterNameAndPwdWithAuth(req.query.adminName, req.query.pwd, req.query.newAdminName, req.query.newAdminPwd, RouteBase.returnFunction(res, 'Error in alter admin info!'));
        });

    //管理员登录
    app.route('/login')
        .post(function(req, res, next){
            SysControl.adminLogin(req.body.adminnam, req.body.adminpwd, RouteBase.returnFunction(res, 'Error in admin login!'));
        });

    //获取门户用户名信息
    app.route('/portalinfo')
        .get(function(req, res, next){
            SysControl.getPortalUName(RouteBase.returnFunction(res, 'Error in getting portal name!', 'ss_value'));
        });
};