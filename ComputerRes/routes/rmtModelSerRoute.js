/**
 * Created by Franklin on 2016/9/12.
 */
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');

module.exports = function(app)
{
    app.route('/modelser/rmt/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                ModelSerCtrl.getChildModelSer(req.heads, function (err, childms) {
                    res.render('modelSers_r',{
                        childms : childms,
                        blmodelser_r : true
                    });
                });
            }
            else
            {
                
            }
        })
        .put(function (req, res) {
            console.log('------------'+req.url);
            var msid = req.params.msid;
            if(msid == 'all')
            {
                
            }
            else
            {
                var host = req.query.host;
                //停止服务
                if(req.query.ac == "stop")
                {
                    var options = {
                        host: host,
                        port: setting.port,
                        path: '/modelser/' + msid + '?ac=stop',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
                //开启服务
                else if(req.query.ac == "start")
                {
                    var options = {
                        host: host,
                        port: setting.port,
                        path: '/modelser/' + msid + '?ac=start',
                        method: 'PUT'
                    };
                    remoteReqCtrl.Request(options, null, function (err, data) {
                        if(err){
                            return res.end(JSON.stringify({
                                "res":"Error",
                                "mess":"Error in remote request"
                            }));
                        }
                        return res.end(data);
                    });
                }
            }
        })
        .delete(function (req, res) {
            var msid = req.params.msid;
            if(msid == 'all')
            {
                
            }
            else
            {
                var host = req.query.host;
                var options = {
                    host: host,
                    port: setting.port,
                    path: '/modelser/' + msid,
                    method: 'DELETE'
                };
                remoteReqCtrl.Request(options, null, function (err, data) {
                    if(err){
                        return res.end(JSON.stringify({
                            "res":"Error",
                            "mess":"Error in remote request"
                        }));
                    }
                    return res.end(data);
                });
            }
        });
}