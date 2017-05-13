/**
 * Created by Franklin on 2017/5/8.
 */
var SysCtrl = require('./control/sysControl');

var Init = function(){
    SysCtrl.buildField('portal_uname','username', function(err, result){
        if(err){

        }
        else{
            SysCtrl.buildField('portal_pwd','123456', function(err, result){
                if(err){

                }
                else{
                    SysCtrl.buildField('parent', '127.0.0.1:8060', function(err, result){
                        if(err){

                        }
                    });
                }
            });
        }
    });
};

module.exports = Init;