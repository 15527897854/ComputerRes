/**
 * Created by Franklin on 16-3-23.
 * Control for System
 */
var os  = require('os');
var http = require('http');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;
var exec = require('child_process').exec;
var iconv = require('iconv-lite');

var setting = require('../setting');
var systemSettingModel = require('../model/systemSetting');
var ControlBase = require('./controlBase');
var RemoteControl = require('./remoteReqControl');

var ParamCheck = require('../utils/paramCheck');
var CommonMethod = require('../utils/commonMethod');
var registerCtrl = require('./registerCtrl');
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

SysControl.getIP = function (callback) {
    var exec = require('child_process').exec;
    //windows disk
    if(setting.platform == 1)
    {
        var interfaces = os.networkInterfaces();
        var IPv4 = '127.0.0.1';
        for (var key in interfaces) {
            var alias = 0;
            interfaces[key].forEach(function(details){
                if (details.family == 'IPv4') {
                    if(details.address != '127.0.0.1')
                        IPv4 = details.address;
                }
            });
        }
        callback(null,IPv4);
    }
    else if(setting.platform == 2)
    {
        //TODO get ip of linux
    }
};

SysControl.getRegisterInfo = function (callback) {
    SysControl.getState(function (err, sysInfo) {
        if(err){
            console.log('err in get sys info!');
            return callback(err);
        }
        else{
            SysControl.getIP(function (err, ip) {
                if(err){
                    console.log('err in get ip!');
                    return callback(err);
                }
                //初始化注册信息，其他信息由用户自己来填
                var registerInfo = {
                    _id:new ObjectId(),
                    hostname: sysInfo.hostname,
                    des: '',
                    host : ip,
                    port : setting.port,
                    platform : setting.platform,
                    registered:false
                };
                return callback(null,registerInfo);
            });
        }
    });
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

SysControl.getValueByIndex = function (ss_index, callback) {
    systemSettingModel.getValueByIndex(ss_index,function (err, data) {
        if(err){
            return callback(err);
        }
        return callback(null,data);
    })
};

///////////////////////////////////门户
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

//获取门户账号名
SysControl.getPortalUName = function(callback){
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', this.returnFunction(callback, 'Error in getting portal user name'));
};

//////////////////////////////////分布式网络
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
    registerCtrl.getState(function (state) {
        setting.registered = state;
        return callback(null, setting);
    });
};

SysControl.autoDetectSW = function (callback) {
    var exePath = __dirname + '/../helper/getSoftwareInfo.exe';
    if(setting.platform == 1) {
        exec(exePath,function (err, stdout, stderr) {
            if(err){
                console.log(err);
                return callback(err);
            }
            else if(stderr){
                console.log(stderr);
                return callback(stderr);
            }
            else if(stdout){
                console.log(stdout);
                if(stdout.indexOf('Error!')!=-1){
                    return callback(stdout);
                }
                else if(stdout.indexOf('Success!')!=-1){
                    var softEnPath = __dirname + '/../helper/softwareEnviro.txt';
                    fs.readFile(softEnPath,function (err, data) {
                        if(err){
                            return callback('read file err!');
                        }
                        //将文件组织为json
                        data = iconv.decode(data,'gbk');
                        if(data=='')
                            return callback(null,[]);
                        var strswlist = data.split('[\t\t\t]');
                        var swlist = [];
                        for(var i=0;i<strswlist.length;i++){
                            var swItemKV = strswlist[i].split('[\t\t]');
                            var platform = '';
                            if(swItemKV[1])
                                platform = swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':'');
                            swlist.push({
                                _id:swItemKV[0],
                                name:swItemKV[1],
                                version:swItemKV[2],
                                publisher:swItemKV[3],
                                platform:platform,
                                type:swItemKV[4]
                            });
                        }
                        return callback(null,swlist);
                    })
                }
            }
        })
    }
    else if(setting.platform == 2){
        
    }
};

SysControl.autoDetectHW = function (callback) {
    var hweList = [];
    hweList.push({
        _id:new ObjectId(),
        name:'memory size',
        value:Math.floor(os.totalmem()/1024/1024)+' MB'
    });
    var cpuInfo = os.cpus();
    hweList.push({
        _id:new ObjectId(),
        name:'cpu core numble',
        value:cpuInfo.length
    });
    hweList.push({
        _id:new ObjectId(),
        name:'cpu frequency',
        value:cpuInfo[0].speed/1000 + ' GHz'
    });
    hweList.push({
        _id:new ObjectId(),
        name:'cpu model',
        value:cpuInfo[0].model
    });
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
            var i,j,totle = 0,avail = 0;
            for(i=0;i<array.length;i++){
                var space = array[i].split(" ");
                var ele = [];
                for(j=0;j<space.length;j++){
                    if (+space[j]){
                        ele.push(+space[j]);
                    }
                }
                if(ele[1])
                    totle += ele[1];
                if(ele[0])
                    avail += ele[0];
            }
            hweList.push({
                _id:new ObjectId(),
                name:'disk total size',
                value:Math.floor(totle/1024/1024/1024) + ' GB'
            });
            hweList.push({
                _id:new ObjectId(),
                name:'disk avail size',
                value:Math.floor(avail/1024/1024/1024) + ' GB'
            });
            fs.writeFile(__dirname + '/../helper/hardwareEnviro.txt',JSON.stringify(hweList),function (err) {
                if(err){
                    console.log(err);
                    return callback(err);
                }
                else{
                    callback(null,hweList);
                }
            })
        });
    }
    else if(setting.platform == 2)
    {
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

SysControl.readAllHW = function (callback) {
    var hardEnPath = __dirname + '/../helper/hardwareEnviro.txt';
    fs.readFile(hardEnPath,function (err, data) {
        if(err){
            return callback('read file err!');
        }
        //将文件组织为json
        data = iconv.decode(data,'gbk');
        callback(null,JSON.parse(data));
    })
};

SysControl.readAllSW = function (callback) {
    var softEnPath = __dirname + '/../helper/softwareEnviro.txt';
    fs.readFile(softEnPath,function (err, data) {
        if(err){
            return callback('read file err!');
        }
        //将文件组织为json
        data = iconv.decode(data,'gbk');
        var strswlist = data.split('[\t\t\t]');
        var swlist = [];
        for(var i=0;i<strswlist.length;i++){
            var swItemKV = strswlist[i].split('[\t\t]');
            var strheader = 'OPERATE SYSTEM:';
            var index = swItemKV[1].indexOf(strheader);
            if(index!=-1){
                swlist.push({
                    _id:swItemKV[0],
                    name:swItemKV[1].substr(strheader.length),
                    version:os.release(),
                    publisher:'',
                    type:'OS'
                });
            }
            else{
                swlist.push({
                    _id:swItemKV[0],
                    name:swItemKV[1],
                    version:swItemKV[2],
                    publisher:swItemKV[3],
                    type:swItemKV[4]
                });
            }
        }
        callback(null,swlist);
    })
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

/////////////////////////////////管理员
//得到管理员信息
SysControl.getAdminInfo = function(callback){
    systemSettingModel.getValueByIndex('adminName', this.returnFunction(callback, 'error in getting administrator info'));
};

//用户登录
SysControl.adminLogin = function(adminName, pwd, callback){
    if(ParamCheck.checkParam(callback, adminName)){
        if(ParamCheck.checkParam(callback, pwd)){
            systemSettingModel.getValueByIndex('adminName', function(err, ss){
                if(err){
                    return callback(err);
                }
                if(ss.ss_value != adminName){
                    return callback(null, false);
                }
                systemSettingModel.getValueByIndex('adminPwd', function(err, ss){
                    if(err){
                        return callback(err);
                    }
                    pwd = CommonMethod.decrypto(pwd);
                    var pwd_md5 = crypto.createHash('md5').update(pwd).digest('hex');
                    if(pwd_md5 == ss.ss_value){
                        return callback(null, true)
                    }
                    return callback(null, false);
                });
            });
        }
    }
};

//更改用户名密码 有验证
SysControl.alterNameAndPwdWithAuth = function(adminName, pwd, newAdminName, newPwd, callback){
    if(ParamCheck.checkParam(callback, newPwd)){
        if(ParamCheck.checkParam(callback, newAdminName)){
            SysControl.adminLogin(adminName, pwd, function(err, result){
                if(err){
                    return callback(err);
                }
                if(result){
                    systemSettingModel.getValueByIndex('adminPwd', function(err, ss){
                        if(err){
                            return callback(err);
                        }
                        newPwd = CommonMethod.decrypto(newPwd);
                        ss.ss_value = crypto.createHash('md5').update(newPwd).digest('hex');
                        systemSettingModel.update(ss, function(err, pwdAlterResult){
                            if(err){
                                return callback(err);
                            }
                            if(pwdAlterResult.n == 1){
                                systemSettingModel.getValueByIndex('adminName', function(err, ss){
                                    if(err){
                                        return callback(err);
                                    }
                                    ss.ss_value = newAdminName;
                                    systemSettingModel.update(ss, function(err, nameAlterResult){
                                        if(err){
                                            return callback(err);
                                        }
                                        if(nameAlterResult.n == 1){
                                            return callback(null, {
                                                result : 1
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }.bind(this));
                }
                else{
                    return callback(null, {
                        result : -1,
                        message : 'Auth fails'
                    })
                }
            });
        }
    }
};