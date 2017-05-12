/**
 * Created by Franklin on 16-3-23.
 * Control for System
 */
var os  = require('os');
var http = require('http');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var fs = require('fs');

var setting = require('../setting');
var systemSettingModel = require('../model/systemSetting');
var ControlBase = require('./controlBase');
var RemoteControl = require('./remoteReqControl');

var SysControl = function() {};
SysControl.__proto__ = ControlBase;

module.exports = SysControl;

SysControl.getState = function(callback) {
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
    if(setting.platform == 1)
    {
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
    }
    else if(setting.platform == 2)
    {
        // exec('df -h', function(err, stdout, stderr)
        // {
        //     if(err)
        //     {
        //         console.log(err);
        //         return callback(err);
        //     }
        //     var array = stdout.split("\r\r\n");
        //     array.pop();
        //     array.pop();
        //     array.shift();
        //     var i,j;
        //     for(i=0;i<array.length;i++){
        //         if(__dirname[0].toLocaleLowerCase() == array[i][0].toLocaleLowerCase()){
        //             var space = array[i].split(" ");
        //             var ele = [];
        //             for(j=0;j<space.length;j++){
        //                 if (+space[j]){
        //                     ele.push(+space[j]);
        //                 }
        //             }
        //             sysinfo.disk = [Math.round((+ele[1]-ele[0])/(+ele[1])*100),__dirname[0].toLocaleUpperCase()];
        //             // console.log(ele);
        //             break;
        //         }
        //     }
        //     // sysinfo.disk = array;
        //     return callback(null, sysinfo);
        // });
        var spawn = require('child_process').spawn,
            free  = spawn('df');

        // 捕获标准输出并将其打印到控制台
        free.stdout.on('data', function (data) {
            // console.log('标准输出：\n' + data);
            // console.log(data.toString());
            var diskInfo = data.toString().split('\n');
            var i;
            for (i=0;i<diskInfo.length;i++){
                if(diskInfo[i][diskInfo[i].length-1] == '/'){
                    var percent = diskInfo[i].split(/\s+/);
                    percent = percent[percent.length-2];
                    percent = percent.split('%')[0];
                    sysinfo.disk = [+percent,'磁'];
                    // console.log(sysinfo.disk);
                    break;
                }
            }
            return callback(null, sysinfo);
        });
    }
};

SysControl.getInfo = function(headers,callback) {
    systemSettingModel.getValueByIndex('sysinfo',function(err, data)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, data);
    });
};

//登陆
SysControl.login = function (l_uname, l_pwd, callback) {
    systemSettingModel.getValueByIndex('username', function (err, uname) {
        if(err)
        {
            return callback(err);
        }
        if(l_uname == uname.ss_value)
        {
            systemSettingModel.getValueByIndex('pwd', function (err, pwd) {
                if(err)
                {
                    return callback(err);
                }
                // var pwd_md5 = md5.update(l_pwd).digest('hex');
                if(l_pwd == pwd.ss_value)
                {
                    return callback(null, {
                        status:1
                    });
                }
                else
                {
                    return callback(null, {
                        status:2
                    });
                }
            });
        }
        else
        {
            return callback(null, {
                status:3
            });
        }
    });
};

SysControl.getValueByIndex = function (ss_index, callback) {
    systemSettingModel.getValueByIndex(ss_index,function (err, data) {
        if(err){
            return callback(err);
        }
        return callback(null,data);
    })
};

//登陆门户
SysControl.loginPortal = function(uname, pwd, callback){
    RemoteControl.postRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/LoginServlet?username=' + uname + '&password=' + pwd, function(err, data){
        if(err){
            return callback(err);
        }
        if(data == '1'){
            return callback(null, true);
        }
        else{
            return callback(null, true);
        }
    });
};

//获取门户账号密码
SysControl.getPortalToken = function(callback){
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', function(err, value){
        if(err){
            return callback(err);
        }
        portalToken['portal_uname'] = value.ss_value;
        systemSettingModel.getValueByIndex('portal_pwd', function(err, value){
            if(err){
                return callback(err);
            }
            portalToken['portal_pwd'] = value.ss_value;
            return callback(null, portalToken);
        });
    });
};

//获取父节点
SysControl.getParent = function(callback){
    systemSettingModel.getValueByIndex('parent', this.returnFunction(callback, 'error in get parent'));
};

//设置父节点
SysControl.setParent = function(newparent, callback){
    systemSettingModel.getValueByIndex('parent', function(err, parent){
        if(err)
        {
            return callback(err);
        }
        parent.ss_value = newparent;
        systemSettingModel.setValueByIndex(parent, function(err, result){
            if(err)
            {
                return callback(err);
            }
            RemoteControl.postRequestJSONWithForm('http://' + parent.ss_value + '/child-node', {
                port : setting.port,
                platform : setting.platform
            }, this.returnFunction(callback, 'error in post child'));
        }.bind(this));
    }.bind(this));
};

//重置父节点
SysControl.resetParent = function (host, callback) {
    systemSettingModel.getValueByIndex('parent', function (err, ss) {
        if(err){
            return callback(err);
        }
        var parent = ss.ss_value;
        if(parent.substr(0, parent.indexOf(':')) == host){
            systemSettingModel.getValueByIndex('parent', function(err, parent){
                if(err)
                {
                    return callback(err);
                }
                parent.ss_value = '127.0.0.1:8060';
                systemSettingModel.setValueByIndex(parent, this.returnFunction(callback, 'error in post child'));
            }.bind(this));
        }
    }.bind(this));
};

//检查服务器是否可用
SysControl.checkServer = function(server, callback){
    RemoteControl.ping(server + '/ping', function(result)
    {
        return callback(result);
    });
};

//获取设置信息
SysControl.getSettings = function(callback){
    return callback(null, setting);
};

//向门户注册
SysControl.register = function (callback) {
    var registerFile = '../register.json';
    var registerData,registerJSON = {};
    fs.stat(registerFile,function (stat) {
        if(err){
            if(err.code = 'ENOENT'){
                registerJSON.registered = true;
            }
            else{
                rst = {status:-1};
                return callback(JSON.stringify(rst));
            }
        }
        else if(stat) {
            registerData = fs.readFileSync(registerFile).toString();
            if(registerData == ''){
                registerData = '{"registered":false}';
            }
            registerJSON = JSON.parse(registerData);
            if(registerJSON.registered == true){
                //已经注册过了
                rst = {status:2};
                return callback(JSON.stringify(rst));
            }
            else{
                //向门户post信息...
                var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/computer';
                remoteReqCtrl.postRequest(req, url,function (err, data) {
                    if (err) {
                        console.log(err);
                        rst = {status: -1};
                        return callback(JSON.stringify(rst));
                    }
                    else {
                        if(data){
                            //如果post成功
                            rst = {status:1};
                            registerJSON.registered = true;
                            fs.writeFileSync(registerFile,JSON.stringify(registerJSON));
                            callback(JSON.stringify(rst));
                        }
                    }
                });
            }
        }
    });
};

//从门户注销
SysControl.deregister = function (callback) {
    var registerFile = '../register.json';
    var registerData,registerJSON = {};
    fs.stat(registerFile,function (stat) {
        if (err) {
            if (err.code = 'ENOENT') {
                registerJSON.registered = false;
            }
            else {
                rst = {status: -1};
                return callback(JSON.stringify(rst));
            }
        }
        else if (stat) {
            registerData = fs.readFileSync(registerFile).toString();
            if(registerData == ''){
                registerData = '{"registered":false}';
            }
            registerJSON = JSON.parse(registerData);
            if(registerJSON.registered == false){
                //已经注销过了
                rst = {status:2};
                return callback(JSON.stringify(rst));
            }
            else{
                //向门户post信息...
                var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/computer';
                remoteReqCtrl.postRequest(req, url,function (err, data) {
                    if (err) {
                        console.log(err);
                        rst = {status: -1};
                        return callback(JSON.stringify(rst));
                    }
                    else {
                        if(data){
                            //如果post成功
                            rst = {status:1};
                            registerJSON.registered = false;
                            fs.writeFileSync(registerFile,JSON.stringify(registerJSON));
                            callback(JSON.stringify(rst));
                        }
                    }
                });
            }
        }
    });
};

//如果字段不存在，自动建立字段
SysControl.buildField = function (field, defaultValue, callback){
    systemSettingModel.getValueByIndex(field, function(err, item){
        if(err){
            return callback(err);
        }
        if(item == null){
            var ss = new systemSettingModel({
                ss_index : field,
                ss_value : defaultValue
            });
            ss.save(function(err, result){
                if(err){
                    return callback(err);
                }
                return callback(null, result);
            });
        }
        else{
            return callback(null, true);
        }
    });
};