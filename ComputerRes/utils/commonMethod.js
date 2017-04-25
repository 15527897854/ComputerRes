/**
 * Created by Franklin on 2017/4/5.
 */
const exec = require('child_process').exec;

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

CommonMethod.Uncompress = function(file, path, callback){
    exec('unzip ' + file + ' -d ' + path, function(err, stdout, stdout){
        return callback();
    });
};

module .exports = CommonMethod;