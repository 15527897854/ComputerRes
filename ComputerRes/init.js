/**
 * Created by Franklin on 2017/5/8.
 */
var SysCtrl = require('./control/sysControl');
var FileOpera = require('./utils/fileOpera');

var Init = function(){
    console.log('Initializing ...');

    //Checking system fields is null
    var fields = [
        {
            name : 'portal_uname',
            value : 'username'
        },
        {
            name : 'portal_pwd',
            value : '123456'
        },
        {
            name : 'parent',
            value : '127.0.0.1:8060'
        },
        {
            name : 'adminName',
            value : 'admin'
        },
        {
            name : 'adminPwd',
            value : 'e10adc3949ba59abbe56e057f20f883e'
        },
    ];

    var count_fields = 0;
    var pending_fields = (function(index){
        count_fields ++;
        return function(err, ss){
            count_fields --;
            if(err){

            }
            if(count_fields == 0){
                console.log('system fields checking finished ! ');
            }
        }
    });

    console.log('checking system fields...');
    for(var i = 0; i < fields.length; i++){
        SysCtrl.buildField(fields[i].name, fields[i].value, pending_fields(i));
    }

    console.log('checking directions...');
    var directions = [
        __dirname + '/geo_data/',
        __dirname + '/geo_model/packages/',
        __dirname + '/geo_model/tmp/',
        __dirname + '/public/tmp/'
    ];

    var count_directions = 0;
    var pending_directions = (function(index){
        count_directions ++;
        return function(err, ss){
            count_directions --;
            if(err){

            }
            if(count_directions == 0){
                console.log('directions checking finished ! ');
            }
        }
    });

    for(var i = 0; i < directions.length; i++){
        FileOpera.BuildDir(directions[i], pending_directions(i));
    }
};

module.exports = Init;