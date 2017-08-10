var express = require('express');
var router = express.Router();

var sysRoute = require('./sysRoute');
var modelSerRoute = require('./modelSerRoute');
var modelSerRunRoute = require('./modelSerRunRoute');
var geoDataRoute = require('./geoDataRoute');
var modelInsRoute = require('./modelInstanceRoute');
var noticeRoute = require('./noticeRoute');
var childRoute = require('./childRoute');
var ModelSerAccessRoute = require('./modelSerAccessRoute');
var AdminAccessRoute = require('./adminAccessRoute');

var sysCtrl = require('../control/sysControl');
var AuthCtrl = require('../control/authControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var CommonMethod = require('../utils/commonMethod');

module.exports = function(app)
{
    app.route('/ping')
        .get(function(req, res, next){
            res.end('OK');
        });

    ModelSerAccessRoute(app);
    
    app.route('*')
        .get(function(req, res, next){
            var code = AuthCtrl.getAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    return res.redirect('/login');
                }
                case -2:{
                    return res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        })
        .post(function(req, res, next){
            var code = AuthCtrl.postAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    res.redirect('login');
                }
                case -2:{
                    res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        })
        .put(function(req, res, next){
            var code = AuthCtrl.postAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    res.redirect('login');
                }
                case -2:{
                    res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        });

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
    //Test
    app.route('/test')
        .get(function (req, res, next) {
            res.render('test');
        });

    app.route('*')
        .get(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        })
        .post(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        })
        .put(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        });

    AdminAccessRoute(app);
};
