/**
 * Created by Franklin on 16-3-23.
 * Route for Sys
 */
var sysControl = require('../control/sysControl');
var RouteBase = require('./routeBase');
var registerCtrl = require('../control/registerCtrl');
var sweCtrl = require('../control/softwareEnCtrl');
var hweCtrl = require('../control/hardwareEnCtrl');

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
            sysControl.getState(function(err,sysinfo)
            {
                res.end(JSON.stringify(sysinfo));
            });
        });

    app.route('/info')
        .get(function(req,res,next)
        {
            sysControl.getInfo(req.headers, function(err,data)
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
            sysControl.getSettings(RouteBase.returnFunction(res, 'error in getting setting'));
        });

    app.route('/parent')
        .get(function(req, res, next){
            sysControl.getParent(RouteBase.returnFunction(res, 'error in getting parent'));
        })
        .put(function(req, res, next){
            var host = req.query.host;
            var port = req.query.port;
            sysControl.setParent(host + ':' + port, RouteBase.returnFunction(res, 'Error in update parent!'));
        });

    app.route('/checkserver/:server')
        .get(function(req, res, next){
            var server = req.params.server;
            sysControl.checkServer(server, function(reslut){
                return res.end(JSON.stringify(reslut));
            });
        });
    
    app.route('/system/registration')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'register'){
                registerCtrl.register(function (rst) {
                    return res.end(rst)
                })
            }
            else if(ac == 'deregister'){
                registerCtrl.deregister(function (rst) {
                    return res.end(rst)
                })
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
    
    app.route('/setting/enviro')
        .get(function (req, res, next) {
            var type = req.query.type;
            //分为三种：get、auto、select
            var method = req.query.method;
            if(method == 'auto'){
                if(type == 'hardware'){
                    hweCtrl.autoDetect(function (data) {
                        return res.end(data);
                    })
                }
                else if(type == 'software'){
                    sweCtrl.autoDetect(function (data) {
                        return res.end(data);
                    })
                }
            }
            else if(method == 'get'){
                if(type == 'hardware'){
                    hweCtrl.getAll(function (data) {
                        return res.end(data);
                    })
                }
                else if(type == 'software'){
                    sweCtrl.getAll(function (data) {
                        return res.end(data);
                    })
                }
            }
            else if(method == 'select'){
                
            }
        })
        .post(function (req, res, next) {
            var type = req.query.type;
            var ac = req.query.ac;
            var method = req.query.method;
            var newEnviro = req.body;
            var resCallback = function (err, data) {
                if(err){
                    res.end(JSON.stringify({status:0}));
                }
                else{
                    res.end(JSON.stringify({status:1}));
                }
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
                    enviroCtrl.addByAuto(newEnviro.itemsID,function (data) {
                        return res.end(data);
                    });
                }
                else if(method == 'select'){
                    enviroCtrl.addBySelect(newEnviro.itemsID,function (data) {
                        return res.end(data);
                    });
                }
            }
            if(type == 'hardware'){
                if(ac == 'update'){
                    hweCtrl.update(newEnviro,resCallback)
                }
                else if(ac == 'new'){
                    hweCtrl.save(newEnviro,function (err, data) {
                        if(err){
                            res.end(JSON.stringify({status:0}));
                        }
                        else{
                            res.end(JSON.stringify({status:1,_id:data._doc._id}));
                        }
                    })
                }
                else if(ac == 'del'){
                    hweCtrl.delete(newEnviro._id,resCallback)
                }
            }
            else if(type == 'software'){
                if(ac == 'update'){
                    sweCtrl.updateField(newEnviro,resCallback)
                }
                else if(ac == 'new'){
                    sweCtrl.addItem(newEnviro,function (err, data) {
                        if(err){
                            res.end(JSON.stringify({status:0}))
                        }
                        else{
                            if(data.hasInserted == true){
                                return res.end(JSON.stringify({status:2,_id:data._id}));
                            }
                            else{
                                return res.end(JSON.stringify({status:1,_id:data._id}));
                            }
                        }
                    });
                }
                else if(ac == 'del'){
                    sweCtrl.delete(newEnviro._id,resCallback);
                    resCallback(null);
                }
            }
        });

    app.route('/setting/enviro/matching')
        .get(function (req, res, next) {
            var type=req.query.type;
            var enviroments = req.query.enviroments;
            if(type == 'hardware'){
                
            }
            else if(type == 'software'){
                
            }
        })
};