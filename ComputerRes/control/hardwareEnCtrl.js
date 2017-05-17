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
            hweModel.items2TableTree(data,function (err, data) {
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

hardwareEnCtrl.updateItem = function (item,callback) {
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
                    callback(JSON.stringify({status:0}));
                }
                else{
                    callback(JSON.stringify({status:1,_id:hwe._id}));
                }
            })
        }
    })
};

hardwareEnCtrl.addItem = function (item,callback) {
    var name = item.name.trim();
    item.name = name.replace(/\s+/g,' ');
    hardwareEnCtrl.hasInserted(item,function (err, rst) {
        if(err){
            console.log(err);
            return callback(JSON.stringify({status:0}));
        }
        else{
            if(rst.hasInserted){
                return callback(JSON.stringify({status:2,_id:rst._id}));
            }
            else{
                hardwareEnCtrl.save(item,function (err, data) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        return callback(JSON.stringify({status:1,_id:data._doc._id}));
                    }
                })
            }
        }
    })
};

hardwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.readAllHW(function (err, items) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            var items2add = [];
            for(var i=0;i<itemsID.length;i++){
                for(var j=0;j<items.length;j++){
                    if(items[j]._id == itemsID[i]){
                        var item = items[j];
                        var name = item.name.trim();
                        item.name = name.replace(/\s+/g,' ');
                        items2add.push(items[j]);
                        break;
                    }
                }
            }
            var addByRecursion = function (index) {
                hardwareEnCtrl.hasInserted(items2add[index],function (err, rst) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        if(!rst.hasInserted){
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
                            });
                        }
                        else{
                            if(index<items2add.length-1){
                                addByRecursion(index+1);
                            }
                            else{
                                return callback(JSON.stringify({status:1}));
                            }
                        }
                    }
                })
            };
            if(items2add.length!=0)
                addByRecursion(0);
            else
                return callback(JSON.stringify({status:1}));
        }
    })
};

hardwareEnCtrl.addBySelect = function (itemsID, callback) {

};

hardwareEnCtrl.hasInserted = function (item, callback) {
    hardwareEnCtrl.getByWhere({},function (err, hwes) {
        if(err){
            return callback(err);
        }
        else{
            for(var i=0;i<hwes.length;i++){
                if(hwes[i].name.toLowerCase() == item.name.toLowerCase()){
                    return callback(null,{hasInserted:true,_id:hwes[i]._id});
                }
            }
            return callback(null,{hasInserted:false});
        }
    })
};