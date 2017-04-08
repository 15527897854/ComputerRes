/**
 * Created by Franklin on 16-3-23.
 * Route for Sys
 */
var sysControl = require('../control/sysControl');
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
};