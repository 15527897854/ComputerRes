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
    for(var i = 0; i < dirs.length; i++){
        ModelSerCtrl.addNewModelSer(fields, {file_model : {path : path + dirs[i]}}, function(err, result){
            if(err){

            }
            else{
                console.log('Model has deployed!');
            }
        });
    }
});

// 老版
// fs.readFile(__dirname + '/upload/dps.json', 'utf-8', function(err, data){
//     if(err){
//         return console.log(JSON.stringify(err));
//     }
//     data = JSON.parse(data).dps;

//     var count = 0;
//     var penging = (function(index){
//         count ++;
//         return function(err, item){
//             count --;
//             if(err){
//                 console.log('ERROR : ' + JSON.stringify(err));
//             }
//             else{
//                 console.log('Model : ' + data[index]['modelName'] + ' upload succeeded ! ');
//             }
//             if(count == 0){
//                 console.log('Model-packages batch upload have finished!');
//             }
//         }
//     });

//     for(var i = 0; i < data.length; i++){
//         var modelName = data[i].fileName.substr(data[i].fileName.indexOf('/') + 1);
//         modelName = modelName.substr(0, modelName.indexOf('.'));
//         data[i]['modelName'] = modelName;
//         ModelSerCtrl.addNewModelSer({
//             m_name : modelName,
//             m_type : '',
//             m_url : '',
//             ms_limited : 0,
//             mv_num : 1, 
//             ms_des : '',
//             ms_xml : '',
//             u_name : 'Admin',
//             u_email : ''
//         },{
//             file_model : {
//                 path : __dirname + '/upload/' + data[i].fileName,
//                 ms_img : null
//             }
//         }, penging(i)
//         );
//     }
// });