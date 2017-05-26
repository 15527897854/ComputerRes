/**
 * Created by Franklin on 2017/4/5.
 */
const exec = require('child_process').exec;
const fs = require('fs');
var zipper = require("zip-local");
var crypto = require('crypto');
var unzip = require('unzip');

var settings = require('../setting');

function CommonMethod(){}

//得到当前时间
CommonMethod.getDateTimeNow = function()
{
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
        return '';
    }
};

//获取MD5值
CommonMethod.md5 = function(buffer){
    return crypto.createHash('md5').update(buffer).digest('hex');
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

//获取IP
CommonMethod.getIP = function(request){
    host = request.connection.remoteAddress;
    host = host.substr(host.lastIndexOf(':') + 1);
    return host;
};

module.exports = CommonMethod;