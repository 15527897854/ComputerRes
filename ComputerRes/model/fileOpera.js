/**
 * Created by Franklin on 2016/8/19.
 */
var fs = require('fs');
var exec = require('child_process').exec;

function File() {
}

module.exports = File;

//彻底删除某个目录下所有文件以及文件夹
File.deleteDir = function (path) {
    exec('rd /s /q ' + path);
    return true;
}