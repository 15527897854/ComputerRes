/**
 * Created by Franklin on 2017/3/15.
 */
var fs = require('fs');

var FileOpera = function()
{
};

module.exports = FileOpera;

//build a direction when it do not exist
FileOpera.BuildDir = function (path, callback) {
    fs.access(path, function (err) {
        if (err) {
            fs.mkdir(path, function () {
                return callback();
            });
        }
        else
        {
            callback();
        }
    });
};

FileOpera.rmdir = function (path) {
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
            FileOpera.rmdir(path + files[i]);
        }
        fs.rmdirSync(path);
    }
};