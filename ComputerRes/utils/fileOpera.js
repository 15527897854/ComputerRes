/**
 * Created by Franklin on 2017/3/15.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
const exec = require('child_process').exec;

var FileOpera = function() {
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
        path += '/';
        var files = fs.readdirSync(path);
        for(var i = 0; i < files.length; i++)
        {
            FileOpera.rmdir(path + files[i]);
        }
        fs.rmdirSync(path);
    }
};

//得到path根目录下的所有后缀名为ext的文件，没有递归处理    ext 带不带 . 都行
FileOpera.getAllFiles = function (fpath, ext, callback) {
    var rst = [];
    try {
        var files = fs.readdirSync(fpath);
        for(var i=0;i<files.length;i++){
            var filename = files[i];
            var fullname = path.join(fpath, filename);
            var stat = fs.statSync(fullname);
            if (stat.isFile()) {
                if (filename.indexOf(ext) != -1) {
                    rst.push(filename);
                }
            }
        }
        callback(rst);
    }
    catch(e){
        callback([]);
    }
};

//Linux赋权限
FileOpera.chmod = function (fpath, limit) {
    if (limit == 'exec') {
        exec('chmod a+x ' + fpath, function (error, stdout, stderr) {
            if (error) {
                console.log(JSON.stringify(error));
            }
            if (stdout) {
                console.log(JSON.stringify(stdout));
            }
            if (stderr) {
                console.log(JSON.stringify(stderr));
            }
        });
    }
};

//获取文件MD5码
FileOpera.getMD5 = function(fpath, callback){
    if(!fs.existsSync(fpath)){
        return callback(new Error('can not find file!'));
    }
    var md5sum = crypto.createHash('md5');
    var stream = fs.createReadStream(fpath);
    stream.on('data', function(chunk) {
        md5sum.update(chunk);
    });
    stream.on('end', function() {
        str = md5sum.digest('hex');
        return callback(null, str);
    });
};
    
FileOpera.copyFile = function (src,dst) {
    var readable = fs.createReadStream( src );
    var writable = fs.createWriteStream( dst );
    readable.pipe( writable );
};