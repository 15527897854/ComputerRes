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

CommonMethod.compress = function(file, path){
    zipper.sync.zip(path).compress().save(file);
};

//加密
CommonMethod.crypto = function(buffer){
    var encrypted = "";
    var cip = crypto.createCipher(settings.crypto.algorithm, settings.crypto.key);
    encrypted += cip.update(buffer, 'binary', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
};

//解密
CommonMethod.decrypto = function(buffer){
    var decrypted = "";
    var decipher = crypto.createDecipher(settings.crypto.algorithm, settings.crypto.key);
    decrypted += decipher.update(buffer, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted;
};

module.exports = CommonMethod;