/**
 * Created by Administrator on 4.21.
 */
var hweModel = require('../model/hardwareEnviro');
var ControlBase = require('./controlBase');
var sysCtrl = require('../control/sysControl');

var hardwareEnCtrl = function () {

};
hardwareEnCtrl.__proto__ = ControlBase;
module.exports = hardwareEnCtrl;
hardwareEnCtrl.model = hweModel;

hardwareEnCtrl.autoDetect = function (callback) {
    sysCtrl.autoDetectHW(function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0})) ;
        }
        else{
            data.name = 'hardware';
            hweModel.items2TableTree([data],function (err, data) {
                if(err){
                    return callback(JSON.stringify({status:0})) ;
                }
                else{
                    return callback(JSON.stringify({status:1,enviro:data}));
                }
            });
        }
    })
};

hardwareEnCtrl.getAll = function (callback) {
    hweModel.all2TableTree(function (err, data) {
        if(err){
            callback(JSON.stringify({status:0})) ;
        }
        else{
            callback(JSON.stringify({status:1,enviro:data}));
        }
    });
};

hardwareEnCtrl.updateField = function (item,callback) {
    hweModel.getByOID(item._id,function (err, hwe) {
        if(err){
            callback(JSON.stringify({status:0}));
        }
        else{
            if(item.type == 'field'){
                var tmp = hwe;
                for(var i=0;i<item.keys.length-1;i++){
                    tmp = tmp[item.keys[i]];
                }
                tmp[item.keys[item.keys.length-1]] = item.value;
            }
            else if(item.type == 'array'){
                var index = item.aliasId;
                hwe.alias.splice(index,1);
            }
            hweModel.update(hwe,function (err, data) {
                if(err){
                    callback(err);
                }
                else{
                    callback(null,data);
                }
            })
        }
    })
};

hardwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.autoDetectHW(function (err, items) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            var items2add = [];
            for(var i=0;i<itemsID.length;i++){
                for(var j=0;j<items.length;j++){
                    if(items[j]._id == itemsID){
                        items2add.push(items[j]);
                        break;
                    }
                }
            }
            var addByRecursion = function (index) {
                hweModel.save(items2add[index],function (err, data) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        if(index<items2add.length-1){
                            addByRecursion(index+1);
                        }
                        else{
                            return callback(JSON.stringify({status:1}));
                        }
                    }
                })
            };
            addByRecursion(0);
        }
    })
};

hardwareEnCtrl.addBySelect = function (itemsID, callback) {

};