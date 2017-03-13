/**
 * Created by Franklin on 2016/8/19.
 */
var fs = require('fs');
var exec = require('child_process').exec;

function File() {
}

module.exports = File;

//彻底删除某个目录下所有文件以及文件夹
File.deleteDir = function (path, callback) {
    exec('rd /s /q ' + path, function(err, stdout, stderr)
    {
        if(err)
        {
            return callback(err);
        }
        return callback(null, true);
    });
};

File.rmdir = function (path) {
    if(!fs.existsSync(path))
    {
        return;
    }
    var stat = fs.statSync(path);
    if(stat.isFile())
    {
        fs.unlinkSync(path);
        return true;
    }
    else if(stat.isDirectory())
    {
        path += '\\';
        var files = fs.readdirSync(path);
        for(var i = 0; i < files.length; i++)
        {
            File.rmdir(path + files[i]);
        }
        fs.rmdirSync(path);
    }
};