/**
 * Created by Franklin on 2017/4/5.
 */
const exec = require('child_process').exec;
const fs = require('fs');
var zipper = require("zip-local");
var crypto = require('crypto');
var unzip = require('unzip');
var net = require('net');
var http = require('http');

var settings = require('../setting');

function CommonMethod(){}

//得到当前时间
CommonMethod.getDateTimeNow = function(){
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
};

//得到延后或者提前的零点数据
CommonMethod.getStartDate = function(offset){
    var date = new Date();
    date = new Date( date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' 00:00:00');
    date.setDate(date.getDate() + offset);
    return date;
};

var Month_en = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
//得到月份的单词
CommonMethod.getMonthWord = function(index){
    return Month_en[index];
};

//解压
CommonMethod.Uncompress = function(zip_file, file_path, callback){
    if(settings.platform == 2){
        exec('unzip ' + zip_file + ' -d ' + file_path, function(err, stdout, stderr){
            return callback();
        });
    }
    else if(settings.platform == 1){
        fs.createReadStream(zip_file).pipe(unzip.Extract({path: file_path}))
            .on('close',function () {
                return callback()
            });
    }
    
};

//压缩
CommonMethod.compress = function(file, path){
    zipper.sync.zip(path).compress().save(file);
};

//加密
CommonMethod.crypto = function(buffer, key){
    if(key == null || key == undefined){
        key = settings.crypto.key;
    }
    var encrypted = "";
    var cip = crypto.createCipher(settings.crypto.algorithm, key);
    encrypted += cip.update(buffer, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
};

//解密
CommonMethod.decrypto = function(buffer, key){
    if(key == null || key == undefined){
        key = settings.crypto.key;
    }
    try{
        var decrypted = "";
        var decipher = crypto.createDecipher(settings.crypto.algorithm, key);
        decrypted += decipher.update(buffer, 'hex', 'binary');
        decrypted += decipher.final('binary');
        return decrypted;
    }
    catch(ex){
        return "";
    }
};

//获取MD5值
CommonMethod.md5 = function(buffer){
    return crypto.createHash('md5').update(buffer).digest('hex');
};

//Encode64加密
CommonMethod.Encode64 = function(a){
    var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";
    var b = "";
    var c, chr2, chr3 = "";
    var d, enc2, enc3, enc4 = "";
    var i = 0;
    do {
        c = a.charCodeAt(i++);
        chr2 = a.charCodeAt(i++);
        chr3 = a.charCodeAt(i++);
        d = c >> 2;
        enc2 = ((c & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        };
        b = b + keyStr.charAt(d) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        c = chr2 = chr3 = "";
        d = enc2 = enc3 = enc4 = ""
    } while (i < a.length);
    return b;
};

//启动一个Nodejs进程去执行JS文件 -- 一般用于高IO处理
CommonMethod.childProcess = function(file, callback){
    exec(__dirname + '/container_node ' + file, (err, stdout, stderr) => {
        if(err){
            return callback(err);
        }
        return callback(null, {
            stdout : stdout,
            stderr : stderr
        })
    });
};

CommonMethod.portIsOccupied = function(port,callback){
    // 创建服务并监听该端口
    var server = net.createServer().listen(port);
    server.on('listening', function () {
        server.close();
        callback(false);
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            callback(true);
        }
    });
};

CommonMethod.getPort = function (cb) {
    var server  = http.createServer();
    server.listen(0);
    server.on('listening', function() {
        var port = server.address().port;
        server.close();
        cb(port);
    });
};

CommonMethod.getIP = function(request){
    var host = request.connection.remoteAddress;
    host = host.substr(host.lastIndexOf(':') + 1);
    if(host == "1"){
        host = "127.0.0.1";
    }
    return host;
};

//数组包含
CommonMethod.array_contain = function(array, obj){
    for(var i = 0; i < array.length; i++){
        if(array[i] == obj){
            return true;
        }
    }
    return false;
};

CommonMethod.createGUID = function () {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
};

// 'yyyy-mm-dd hh:mm'
CommonMethod.timestamp2String = function (timestamp) {
    var date = new Date(timestamp);
    return date.getFullYear() + '-' +
        (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-' +
        date.getDate() + ' ' +
        (date.getHours() <10 ? '0' + date.getHours():date.getHours()) + ':' +
        (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
};

module.exports = CommonMethod;