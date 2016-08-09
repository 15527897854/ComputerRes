/**
 * Created by Franklin on 16-3-23.
 * Control for System
 */
var os  = require('os');
var http = require('http');

//var remoteReq = require('./remoteReqControl');
var setting = require('../setting');
var systemSettingModel = require('../model/systemSetting');

var SysControl = function()
{}

module.exports = SysControl;

SysControl.getState = function(callback)
{
    var sysinfo =
    {
        'hostname':os.hostname(),
        'systemtype':os.type(),
        'platform' : os.platform(),
        'release': os.release(),
        'uptime':os.uptime(),
        'loadavg':os.loadavg(),
        'totalmem':os.totalmem(),
        'freemem':os.freemem(),
        'cpus':os.cpus(),
        'disk': ''
    };
    var exec = require('child_process').exec;
    //windows disk
    exec('wmic logicaldisk get caption,size,freespace', function(err, stdout, stderr)
    {
        if(err)
        {
            console.log(err);
            return callback(err);
        }
        var array = stdout.split("\r\r\n");
        array.pop();
        array.pop();
        array.shift();
        var i,j;
        for(i=0;i<array.length;i++){
            if(__dirname[0].toLocaleLowerCase() == array[i][0].toLocaleLowerCase()){
                var space = array[i].split(" ");
                var ele = [];
                for(j=0;j<space.length;j++){
                    if (+space[j]){
                        ele.push(+space[j]);
                    }
                }
                sysinfo.disk = [Math.round((+ele[1]-ele[0])/(+ele[1])*100),__dirname[0].toLocaleUpperCase()];
                // console.log(ele);
                break;
            }
        }
        // sysinfo.disk = array;
        return callback(null, sysinfo);
    });
};

SysControl.getInfo = function(headers,callback)
{
    systemSettingModel.getValueByIndex('sysinfo',function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
}