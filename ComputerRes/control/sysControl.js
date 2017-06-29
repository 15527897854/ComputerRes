/**
 * Created by Franklin on 16-3-23.
 * Control for System
 */
var os  = require('os');
var http = require('http');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var fs = require('fs');
var ObjectId = require('mongoose').Types.ObjectId;
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
            return callback(null, false);
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

//设置门户用户名密码
SysControl.setPortalInfo = function(username, pwd, callback){
    if(ParamCheck.checkParam(callback, username)){
        if(ParamCheck.checkParam(callback, pwd)){
            pwd = CommonMethod.decrypto(pwd);
            SysControl.loginPortal(username, pwd, function(err, result){
                if(err){
                    return callhback(err);
                }
                if(result){
                    var ss_uname = {
                        ss_index : 'portal_uname',
                        ss_value : username
                    };
                    systemSettingModel.setValueByIndex(ss_uname, function(err, result){
                        if(err){
                            return callback(err);
                        }
                        var ss_pwd = {
                            ss_index : 'portal_pwd',
                            ss_value : pwd
                        };
                        systemSettingModel.setValueByIndex(ss_pwd, function(err, result){
                            if(err){
                                return callback(err);
                            }
                            return callback(null, {
                                result : 'suc'
                            });
                        });
                    });
                }
                else{
                    return callback(null, {
                        result : 'fail'
                    });
                }
            });
        }
    }
};

//////////////////////////////////分布式网络
//获取父节点
SysControl.getParent = function(callback){
    systemSettingModel.getValueByIndex('parent', this.returnFunction(callback, 'error in get parent'));
};

//设置父节点
SysControl.setParent = function(host, port, callback){
    var newparent = host + ':' + port;
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
            var access_token = CommonMethod.crypto(host);
            RemoteControl.postRequestJSONWithForm('http://' + parent.ss_value + '/child-node', {
                port : setting.port,
                platform : setting.platform,
                access_token : access_token
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

//获取Token
SysControl.getToken = function(ip, callback){
    if(ParamCheck.checkParam(callback, ip)){
        var token = CommonMethod.crypto(ip);
        return callback(null, token);
    }
};

//获取设置信息
SysControl.getSettings = function(callback){
    registerCtrl.getState(function (state) {
        setting.registered = state;
        return callback(null, setting);
    });
};

//获取注册表信息
SysControl.autoDetectSW = function (cb) {
    var softEnPath = __dirname + '/../helper/softwareEnviro.txt';
    var softEnOutPath = __dirname + '/../helper/softwareEnviroOut.txt';
    var getReg = function (type, cb) {
        var regePath;
        if(type == 'x86'){
            regePath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node';
        }
        else if(type == 'x64'){
            regePath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall';
        }
        var parseRegedit = function (stdout) {
            var sweRst = [];
            if(!stdout)
                stdout = '';
            var count = 0;
            var regList = stdout.split("\r\n\r\n");
            for(var i=0;i<regList.length;i++){
                var sweStr = regList[i];
                var groupName = sweStr.match(/DisplayName\s{4}REG_SZ\s{4}(.*)/);
                var groupVer = sweStr.match(/DisplayVersion\s{4}REG_SZ\s{4}(.*)/);
                var groupPub = sweStr.match(/Publisher\s{4}REG_SZ\s{4}(.*)/);
                var name = '';
                var version = '';
                var publisher = '';
                var type = '';
                if(groupName){
                    count ++;
                    name = groupName[1];
                    if(name.indexOf('redistributable') != -1 && name.index.indexOf('c++')){
                        type = 'C++ Runtime';
                    }
                    else if(name.indexOf('.net') != -1 && name.indexOf('framework') != -1 && name.indexOf('microsoft') != -1){
                        type = '.NET Runtime';
                    }
                    else if(name.indexOf('java') != -1 && (name.indexOf('se') || name.indexOf('ee')!=-1|| name.index('me')!= -1)){
                        type = 'Java Runtime';
                    }
                    else if(name.indexOf('crt') != -1 && name.indexOf('visual')!= -1 && name.indexOf('c++')!=-1){
                        type = 'C Runtime';
                    }
                }
                else
                    continue;
                if(groupVer){
                    version = groupVer[1];
                }
                if(groupPub){
                    publisher = groupPub[1];
                }
                sweRst.push({
                    _id:CommonMethod.createGUID(),
                    name:name,
                    version:version,
                    publisher:publisher,
                    // platform:name.indexOf('x64')!=-1?'x64':(name.indexOf('x86')!=-1?'x86':''),
                    type:type
                })
            }
            return  cb(null,sweRst);
        };
        var child = exec('REG QUERY ' + regePath + ' /s',{
            encoding: 'GBK',
            maxBuffer: 1024*1024*100  /*stdout和stderr的最大长度*/
        });
        if(fs.existsSync(softEnOutPath))
            fs.unlinkSync(softEnOutPath);
        child.stdout.on('data',function (data) {
            data = iconv.decode(data,'gbk');
            fs.appendFileSync(softEnOutPath,data,'utf8');
        });
        child.stderr.on('data',function (data) {
            cb(data);
        });
        child.on('close',function (code) {
            fs.readFile(softEnOutPath,function (err, data) {
                if(err){
                    return cb(err);
                }
                else {
                    parseRegedit(data.toString())
                }
            })
        });

    };
    var sweStrList = [];
    getReg('x64',function (err,sweStrList2) {
        if(err){
            return cb(err);
        }
        else{
            sweStrList = sweStrList.concat(sweStrList2);
            // getReg('x86',function (err, sweStrList2) {
            //     if(err){
            //         return cb(err);
            //     }
            //     else{
            //         sweStrList = sweStrList.concat(sweStrList2);

                    // fs.writeFile(softEnPath,sweStrList.join('[\\t\\t\\t]'),function (err) {
                    //     if(err){
                    //         console.log(err);
                    //     }
                    //
                    // })
                    // var swlist = [];
                    // for(var i=0;i<strswlist.length;i++){
                    //     var swItemKV = strswlist[i].split('[\t\t]');
                    //     var platform = '';
                    //     if(swItemKV[1])
                    //         platform = swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':'');
                    //     swlist.push({
                    //         _id:swItemKV[0],
                    //         name:swItemKV[1],
                    //         version:swItemKV[2],
                    //         publisher:swItemKV[3],
                    //         platform:platform,
                    //         type:swItemKV[4]
                    //     });
                    // }

                    sweStrList.push({
                        _id:CommonMethod.createGUID(),
                        name:os.type(),
                        version:os.release(),
                        publisher:'',
                        type:'OS'
                    });
                    var sweStrRst = '';
                    for(var i=0;i<sweStrList.length;i++){
                        sweStrRst += sweStrList[i]._id + '[\t\t]' +
                            sweStrList[i].name + '[\t\t]' +
                            sweStrList[i].version + '[\t\t]' +
                            sweStrList[i].publisher + '[\t\t]' +
                            // sweStrList[i].platform + '[\t\t]' +
                            sweStrList[i].type;
                        if(i<sweStrList.length-1){
                            sweStrRst += '[\t\t\t]';
                        }
                    }
                    fs.writeFile(softEnPath,sweStrRst,'utf8',function (err) {
                        if(err){
                            return cb(err);
                        }
                        else{
                            return cb(null,sweStrList);
                        }
                    });
            //     }
            // })
        }
    })
};

// SysControl.autoDetectSW = function (callback) {
//     var exePath = __dirname + '/../helper/getSoftwareInfo.exe';
//     if(setting.platform == 1) {
//         exec(exePath,function (err, stdout, stderr) {
//             if(err){
//                 console.log(err);
//                 return callback(err);
//             }
//             else if(stderr){
//                 console.log(stderr);
//                 return callback(stderr);
//             }
//             else if(stdout){
//                 console.log(stdout);
//                 if(stdout.indexOf('Error!')!=-1){
//                     return callback(stdout);
//                 }
//                 else if(stdout.indexOf('Success!')!=-1){
//                     var softEnPath = __dirname + '/../helper/softwareEnviro.txt';
//                     fs.readFile(softEnPath,function (err, data) {
//                         if(err){
//                             return callback('read file err!');
//                         }
//                         //将文件组织为json
//                         data = iconv.decode(data,'gbk');
//                         if(data=='')
//                             return callback(null,[]);
//                         var strswlist = data.split('[\t\t\t]');
//                         var swlist = [];
//                         for(var i=0;i<strswlist.length;i++){
//                             var swItemKV = strswlist[i].split('[\t\t]');
//                             var platform = '';
//                             if(swItemKV[1])
//                                 platform = swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':'');
//                             swlist.push({
//                                 _id:swItemKV[0],
//                                 name:swItemKV[1],
//                                 version:swItemKV[2],
//                                 publisher:swItemKV[3],
//                                 platform:platform,
//                                 type:swItemKV[4]
//                             });
//                         }
//                         return callback(null,swlist);
//                     })
//                 }
//             }
//         })
//     }
//     else if(setting.platform == 2){
//
//     }
// };

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
        data = data.toString();
        // data = iconv.decode(data,'gbk');
        var strswlist = data.split('[\t\t\t]');
        var swlist = [];
        for(var i=0;i<strswlist.length;i++){
            var swItemKV = strswlist[i].split('[\t\t]');
            swlist.push({
                _id:swItemKV[0],
                name:swItemKV[1],
                version:swItemKV[2],
                publisher:swItemKV[3],
                // platform:swItemKV[1].indexOf('x64')!=-1?'x64':(swItemKV[1].indexOf('x86')!=-1?'x86':''),
                type:swItemKV[4]
            });
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
                    var pwd_md5 = CommonMethod.md5(pwd)
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

//region 注册到门户
SysControl.register = function (cb) {
    registerCtrl.register(SysControl.getRegisterInfo,cb);
};

SysControl.deregister = function (cb) {
    registerCtrl.deregister(cb);
};
//endregion