var fs = require('fs');

var ModelSerCtrl = require('./control/modelSerControl');
var FileOpera = require('./utils/fileOpera');

var path = __dirname + '/upload/';
var fields = {};
fields.u_name = '[Batch]';
fields.u_email = '[Unknown]';
fields.ms_permission = 0;
fs.readdir(path, function(err, dirs){
    if(err){
        return;
    }
    var count = 0;
    var errList = [];
    var pending = (function(index){
        count ++;
        return (function(err, result){
            count --;
            if(err){
                errList.push(dirs[index]);
                console.log('Warning : Model Service Package [' + dirs[index] + '] has error in deploying!');
            }
            else{
                console.log('Model Service Package [' + dirs[index] + '] has deployed!');
            }
            if(count == 0){
                console.log('All Finished');
                fs.writeFile(path + 'errlist.json', JSON.stringify(errList), function(err, result){});
            }
        })
    });
    for(var i = 0; i < dirs.length; i++){
        ModelSerCtrl.addNewModelSer(fields, {file_model : {path : path + dirs[i]}}, pending(i));
    }
});