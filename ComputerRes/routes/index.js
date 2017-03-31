var express = require('express');
var router = express.Router();

var sysRoute = require('./sysRoute');
var modelSerRoute = require('./modelSerRoute');
var modelSerRunRoute = require('./modelSerRunRoute');
var geoDataRoute = require('./geoDataRoute');
var modelInsRoute = require('./modelInstanceRoute');
var noticeRoute = require('./noticeRoute');
var childRoute = require('./childRoute');

var sysCtrl = require('../control/sysControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');

module.exports = function(app)
{
    app.route('/ping')
        .get(function(req, res, next){
            res.end('OK');
        });

    // // 未登录只能访问登录和注册页面,已登录不能访问这两个页面
    // app.route('*')
    //     .get(function checkLoginStatus(req, res, next) {
    //         if(setting.debug) {
    //             return next();
    //         }
    //         for(var i = 0; i < setting.parent.length; i++)
    //         {
    //             if(req._remoteAddress.indexOf(setting.parent[i]) != -1)
    //             {
    //                 return next();
    //             }
    //         }
    //         // console.log('all route +++++++++++++++++++++++++++++++++++ req url:'+req.url);
    //         // console.log('------------------session-------------------\n'+JSON.stringify(req.session.user)+'---'+typeof(req.session.user));
    //         if(req.session.user){
    //             if(req.url != '/login' && req.url.split('/')[1] != 'resetpwd'){
    //                 next();
    //             }
    //             else {
    //                 // console.log('----------------------------------------------'+req.url);
    //                 res.redirect('/index');
    //             }
    //         }
    //         else {
    //             if(req.url == '/login'){
    //                 // console.log('----------------------------------------------'+req.url);
    //                 next();
    //             }
    //             else {
    //                 res.redirect('/login');
    //             }
    //         }
    //     });

    //use route for systemsetting
    sysRoute(app);

    //use route for modelservice
    modelSerRoute(app);

    //use route for geo_data
    geoDataRoute(app);

    //use route for notice
    noticeRoute(app);

    //use route for modelserrun
    modelSerRunRoute(app);

    //use route for modelinstance
    modelInsRoute(app);

    //use route for child-node
    childRoute(app);

    //Homepage
    app.route('/index')
        .get(function(req, res, next){
            res.render('index',{
                title:'GeoModeling'
                // user: req.session.user
            });
        });

    // app.route('/login')
    //     .get(function (req, res, next) {
    //         res.render('login');
    //     })
    //     .post(function(req, res, next) {
    //         var l_name = req.body.login_name;
    //         var pwd = req.body.pwd;
    //         sysCtrl.login(l_name, pwd, function (err, result) {
    //             if(err)
    //             {
    //                 return res.end(JSON.stringify(err));
    //             }
    //             if(result.res == 'success')
    //             {
    //
    //             }
    //         });
    //     });

    app.route('/setting')
        .get(function (req, res, next) {
            res.render('setting');
        });

    //Test
    app.route('/test')
        .get(function (req, res, next) {
            res.render('test');
        });
};
