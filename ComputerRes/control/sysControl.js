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
            callback(err);
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
                    software:[],
                    hardware:[],
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

            //TODO 向父节点提交请求


            return callback(null, result);
        });
    });
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
                if(stdout == 'Error!'){
                    return callback(stdout);
                }
                else if(stdout == 'Success!'){
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
                }
            }
        })
    }
    else if(setting.platform == 2){
        
    }
};

SysControl.autoDetectHW = function (callback) {
    // var exePath = __dirname + '/../helper/getHardwareInfo.exe';
    // if(setting.platform == 1) {
    //     exec(exePath,function (err, stdout, stderr) {
    //         if(err){
    //             console.log(err);
    //             return callback(err);
    //         }
    //         else if(stderr){
    //             console.log(stderr);
    //             return callback(stderr);
    //         }
    //         else if(stdout){
    //             console.log(stdout);
    //             if(stdout == 'Error!'){
    //                 return callback(stdout);
    //             }
    //             else if(stdout == 'Success!'){
    //                 var softEnPath = __dirname + '/../helper/hardwareEnviro.txt';
    //                 fs.readFile(softEnPath,function (err, data) {
    //                     if(err){
    //                         return callback('read file err!');
    //                     }
    //                     //将文件组织为json
    //                     data = iconv.decode(data,'gbk');
    //                     data = JSON.parse(data);
    //                     data.memory = os.totalmem()/1024/1024/1024;
    //                     callback(null,data);
    //                 })
    //             }
    //         }
    //     })
    // }
    // else if(setting.platform == 2){
    //
    // }
    // var getDisplayCardInfo = function () {
    //     exec(__dirname + '/../helper/dxdiag.exe ' + __dirname + '/../helper/hardwareEnviro.txt', function(err, stdout, stderr){
    //         if(err){
    //
    //         }
    //         else if(stderr){
    //
    //         }
    //         else{
    //
    //         }
    //     })
    // };

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
            var i,j,totle = 0;
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
            }
            hweList.push({
                _id:new ObjectId(),
                name:'hardware size',
                value:Math.floor(totle/1024/1024/1024) + 'GB'
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