/**
 * Created by Franklin on 16-3-23.
 * Route for Sys
 */
var sysControl = require('../control/sysControl');

module.exports = function(app)
{
    app.route('/status')
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
}