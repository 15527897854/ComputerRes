/**
 * Created by Franklin on 16-4-12.
 */

var remoteSerCtrl = require('./remoteReqControl');
var setting = require('../setting');

var ModelControl = function()
{};

module.exports = ModelControl;

ModelControl.getByOID = function(mid, callback)
{
    //请求参数
    var options = {
        host: setting.gate.host,
        port: setting.gate.port,
        path: '/model/json/' + mid,
        method: 'GET',
        headers: {
            host:setting.gate.host+':'+setting.gate.port
        }
    };

    remoteSerCtrl.Request(
        options,
        null,
        function(err, data)
        {
            if(err)
            {
                return callback(err);
            }
            return callback(null, data);
        }
    );
};