/**
 * Created by Administrator on 4.21.
 */
var sweModel = require('../model/softwareEnviro');
var ControlBase = require('./controlBase');
var sysCtrl = require('./sysControl');
var versionCtrl = require('./versionCtrl');

var softwareEnCtrl = function () {
    
};
softwareEnCtrl.__proto__ = ControlBase;
module.exports = softwareEnCtrl;
softwareEnCtrl.model = sweModel;

softwareEnCtrl.autoDetect = function (callback) {
    sysCtrl.autoDetectSW(function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0})) ;
        }
        else{
            sweModel.items2TableTree(data,function (err, data) {
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

softwareEnCtrl.getAll = function (callback) {
    sweModel.all2TableTree(function (err, data) {
        if(err){
            callback(JSON.stringify({status:0})) ;
        }
        else{
            callback(JSON.stringify({status:1,enviro:data}));
        }
    });
};

softwareEnCtrl.updateField = function (item,callback) {
    sweModel.getByOID(item._id,function (err, swe) {
        if(err){
            callback(JSON.stringify({status:0}));
        }
        else{
            if(item.type == 'field'){
                var tmp = swe;
                for(var i=0;i<item.keys.length-1;i++){
                    tmp = tmp[item.keys[i]];
                }
                tmp[item.keys[item.keys.length-1]] = item.value;
            }
            else if(item.type == 'array'){
                var index = item.aliasId;
                swe.alias.splice(index,1);
            }
            sweModel.update(swe,function (err, data) {
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

softwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.autoDetectSW(function (err, items) {
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
                        for(var i=0;i<item.alias.length;i++){
                            var name = item.alias[i].trim();
                            item.alias[i] = name.replace(/\s+/g,' ');
                        }
                        items2add.push(item);
                        break;
                    }
                }
            }
            var addByRecursion = function (index) {
                delete items2add[index]._id;
                softwareEnCtrl.hasInserted(function (err,rst) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        if(!rst.hasInserted){
                            sweModel.save(items2add[index],function (err, data) {
                                if(err){
                                    callback(JSON.stringify({status:0}));
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
                        }
                        else{
                            // softwareEnCtrl.updateItem(rst.swe,items2add[index],function (err, data) {
                            //     if(err){
                            //         callback(JSON.stringify({status:0}));
                            //     }
                            //     else{
                            //         if(index<items2add.length-1){
                            //             addByRecursion(index+1);
                            //         }
                            //         else{
                            //             return callback(JSON.stringify({status:1}));
                            //         }
                            //     }
                            // })
                            if(index<items2add.length-1){
                                addByRecursion(index+1);
                            }
                            else{
                                return callback(JSON.stringify({status:1}));
                            }
                        }
                    }
                });
            };
            if(items2add.length!=0)
                addByRecursion(0);
            else
                return callback(JSON.stringify({status:1}));
        }
    })
};

softwareEnCtrl.addItem = function (item, callback) {
    var name = item.name.trim();
    item.name = name.replace(/\s+/g,' ');
    for(var i=0;i<item.alias.length;i++){
        var name = item.alias[i].trim();
        item.alias[i] = name.replace(/\s+/g,' ');
    }
    softwareEnCtrl.hasInserted(item,function (err, rst) {
        if(err){
            return callback(err);
        }
        else{
            if(rst.hasInserted){
                return callback(null,rst);
            }
            else{
                softwareEnCtrl.save(item,function (err, data) {
                    if(err){
                        return callback(err);
                    }
                    else{
                        return callback(null,data._doc);
                    }
                })
            }
        }
    });
};

//根据name和version匹配
softwareEnCtrl.hasInserted = function (item, callback) {
    sweModel.getByWhere({},function (err,swes) {
        if (err) {
            return callback(err);
        }
        else {
            var index = -1;
            var insertName = item.name;
            for (var i = 0; i < swes.length; i++) {
                if (insertName.toLowerCase() == swes[i].name.toLowerCase()) {
                    index = i;
                    break;
                }
                for (var j = 0; j < swes[i].alias.length; j++) {
                    if (insertName.toLowerCase() == swes[i].alias[j].toLowerCase()) {
                        index = i;
                        break;
                    }
                }
                if (index!=-1)
                    break;
            }

            if(index!=-1){
                var versionEQ = versionCtrl.cmp(item.version,'eq',swes[index].version);
                if(versionEQ == true){
                    return callback(null,{hasInserted:true,_id:swes[index]._id});
                }
                else if(versionEQ == false){
                    return callback(null,{hasInserted:false});
                }
            }
            else{
                return callback(null,{hasInserted:false});
            }
        }
    })
};

softwareEnCtrl.updateItem = function (srcItem, newItem, callback) {
    // var hasAlias = false;
    // for(var i=0;i<newItem.alias.length;i++){
    //     for(var j=0;j<srcItem.alias.length;i++){
    //         if(srcItem.alias[j] == newItem.alias[i]){
    //             hasAlias = true;
    //             break;
    //         }
    //     }
    //     if(srcItem.name == newItem.alias[i])
    //         hasAlias = true;
    //     if(!hasAlias)
    //         srcItem.alias.push(newItem.alias[i]);
    // }
    // hasAlias = false;
    // for(var k=0;k<srcItem.alias.length;k++){
    //     if(newItem.name == srcItem.alias[k]){
    //         hasAlias = true;
    //         break;
    //     }
    // }
    // if(newItem.name == srcItem.name)
    //     hasAlias = true;
    // if(!hasAlias)
    //     srcItem.alias.push(newItem.name);
    sweModel.update(srcItem,function (err, data) {
        if(err){
            callback(err);
        }
        else{
            callback(null,data);
        }
    })
};

softwareEnCtrl.addBySelect = function (itemsID, callback) {

};

//判断环境是否匹配
softwareEnCtrl.isSatisfied = function (ranges,callback) {
    sweModel.getByWhere({},function (err, swes) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else {
            var rst = [];
            for(var i=0;i<ranges.length;i++){
                for(var j=0;j<swes.length;j++){
                    //判断名称
                    // var nameSentence = swes[j].alias.join('[//t]');
                    // nameSentence += '//t' + swes[j].name;
                    // nameSentence = nameSentence.toLowerCase();
                    var nameMatched = false;
                    for(var k=0;k<swes[j].alias.length;k++){
                        var name = ranges[i].name.trim();
                        name = name.replace(/\s+/g,' ');
                        if(swes[j].alias[k].toLowerCase() == name){
                            nameMatched = true;
                            break;
                        }
                    }
                    if(nameMatched){
                        rst[i].name = true;
                        //判断版本
                        rst[i].version = versionCtrl.satisfies(swes[j].version, ranges[i].version);
                        break;
                    }
                    else{
                        rst[i].name = false;
                    }
                }
            }
            return callback(JSON.stringify({status:1,detail:rst}));
        }
    })
};