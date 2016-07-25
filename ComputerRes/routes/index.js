var express = require('express');
var router = express.Router();

var sysRoute = require('./sysRoute');

var modelSerRoute = require('./modelSerRoute');

module.exports = function(app)
{
    //use route for systemsetting
    sysRoute(app);

    //use route for modelservice
    modelSerRoute(app);

    //Homepage
    app.route('/index')
        .get(function(req, res, next)
        {
            res.render('index',{
                title:'GeoModeling'
            });
        });
}
