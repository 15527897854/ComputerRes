var express = require('express');
var router = express.Router();

var sysRoute = require('./sysRoute');
var modelSerRoute = require('./modelSerRoute');
var modelSerRunRoute = require('./modelSerRunRoute');
var geoDataRoute = require('./geoDataRoute');
var modelInsRoute = require('./modelInstanceRoute');
var noticeRoute = require('./noticeRoute');

var sysCtrl = require('../control/sysControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');

module.exports = function(app)
{
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

    //user route for modelinstance
    modelInsRoute(app);

    //Homepage
    app.route('/index')
        .get(function(req, res, next){
            res.render('index',{
                title:'GeoModeling',
            });
        });

    app.route('/login')
        .get(function (req, res, next) {
            res.render('login');
        })
        .post(function(req, res, next) {
            var l_name = req.body.login_name;
            var pwd = req.body.pwd;
            sysCtrl.login(l_name, pwd, function (err, result) {
                if(err)
                {
                    return res.end(JSON.stringify(err));
                }
                if(result.res == 'success')
                {

                }
            });
        });

    app.route('/setting')
        .get(function (req, res, next) {
            res.render('setting');
        });

    //Test
    app.route('/test')
        .get(function (req, res, next) {
            ModelSerCtrl.getChildModelSer(req.headers, function (err, data) {
                if(err)
                {

                }
                res.end(JSON.stringify(data));
            });
        });
}
