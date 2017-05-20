var fs = require('fs');

var ModelSerCtrl = require('./control/modelSerControl');
var FileOpera = require('./utils/fileOpera');

fs.readFile(__dirname + '/upload/dps.json', 'utf-8', function(err, data){
    if(err){
        return console.log(JSON.stringify(err));
    }
    data = JSON.parse(data).dps;

    var penging = (function(){
        return function(err, item){
            if(err){
                console.log('ERROR : ' + JSON.stringify(err));
            }
            else{
                console.log('Success ! ');
            }
        }
    });

    for(var i = 0; i < data.length; i++){
        var modelName = data[i].fileName.substr(data[i].fileName.indexOf('/') + 1);
        modelName = modelName.substr(0, modelName.indexOf('.'));
        console.log(modelName);
        ModelSerCtrl.addNewModelSer({
            remain : true,
            m_name : modelName,
            m_type : '',
            m_url : '',
            ms_limited : 0,
            mv_num : '', 
            ms_des : '',
            ms_xml : '',
            u_name : 'Admin',
            u_email : ''
        },{
            file_model : {
                path : __dirname + '/upload/' + data[i].fileName,
                ms_img : null
            },
        }, penging()
        );
    }
});