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

softwareEnCtrl.deleteItem = function (id,callback) {
    softwareEnCtrl.delete(id,function (err, data) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            return callback(JSON.stringify({status:1}))
        }
    })
};

//更新前也做 查重 检测？
softwareEnCtrl.updateItem = function (item,callback) {
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
                    callback(JSON.stringify({status:0}));
                }
                else{
                    callback(JSON.stringify({status:1,_id:swe._id}));
                }
            })
        }
    })
};

softwareEnCtrl.addItem = function (item, callback) {
    var name = item.name.trim();
    item.name = name.replace(/\s+/g,' ');
    //添加时别名只能为空，添加完item才能编辑别名
    item.alias = [];
    softwareEnCtrl.hasInserted(item,function (err, rst) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else{
            if(rst.hasInserted){
                return callback(JSON.stringify({status:2,_id:rst._id}));
            }
            else{
                softwareEnCtrl.save(item,function (err, data) {
                    if(err){
                        return callback(JSON.stringify({status:0}));
                    }
                    else{
                        return callback(JSON.stringify({status:1,_id:data._doc._id}));
                    }
                })
            }
        }
    });
    
};

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

//返回添加成功和已经存在的id
softwareEnCtrl.addByAuto = function (itemsID,callback) {
    sysCtrl.readAllSW(function (err, items) {
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
                        item.alias = [];
                        items2add.push(item);
                        break;
                    }
                }
            }
            var ids = [];
            
            var addByRecursion = function (index) {
                delete items2add[index]._id;
                softwareEnCtrl.hasInserted(items2add[index],function (err,rst) {
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
                                    ids.push(data._doc._id);
                                    if(index<items2add.length-1){
                                        addByRecursion(index+1);
                                    }
                                    else{
                                        return callback(JSON.stringify({status:1,ids:ids}));
                                    }
                                }
                            })
                        }
                        else{
                            if(index<items2add.length-1){
                                addByRecursion(index+1);
                            }
                            else{
                                ids.push(rst._id);
                                return callback(JSON.stringify({status:1,ids:ids}));
                            }
                        }
                    }
                });
            };
            if(items2add.length!=0)
                addByRecursion(0);
            else
                return callback(JSON.stringify({status:1,ids:[]}));
        }
    })
};

//根据name和version匹配
//回调函数第二个参数：{ hasInserted:Bool;_id:String}
softwareEnCtrl.hasInserted = function (item, callback) {
    sweModel.getByWhere({},function (err,swes) {
        if (err) {
            return callback(err);
        }
        else {
            var index = -1;
            var insertName = item.name;
            for (var i = 0; i < swes.length; i++) {
                index = -1;
                if (insertName.toLowerCase() == swes[i].name.toLowerCase()) {
                    index = i;
                }
                else{
                    for (var j = 0; j < swes[i].alias.length; j++) {
                        if (insertName.toLowerCase() == swes[i].alias[j].toLowerCase()) {
                            index = i;
                            break;
                        }
                    }
                }
                if (index!=-1){
                    var versionEQ = versionCtrl.match(item.version,'eq',swes[index].version);
                    if(versionEQ == true){
                        return callback(null,{hasInserted:true,_id:swes[index]._id});
                    }
                }
            }
            return callback(null,{hasInserted:false});
        }
    })
};

//判断环境是否匹配
//返回 status unSatisfiedList
softwareEnCtrl.isSatisfied = function (ranges,callback) {
    sweModel.getByWhere({},function (err, swes) {
        if(err){
            return callback(JSON.stringify({status:0}));
        }
        else {
            var unSatisfiedList = [];
            for(var i=0;i<ranges.length;i++){
                var name = ranges[i].name.trim();
                name = name.replace(/\s+/g,' ');
                var isSatisfied = false;
                for(var j=0;j<swes.length;j++){
                    var index = -1;
                    if(swes[j].name.toLowerCase() == name){
                        index = j;
                    }
                    else{
                        for(var k=0;k<swes[j].alias.length;k++){
                            if(swes[j].alias[k].toLowerCase() == name){
                                index = j;
                                break;
                            }
                        }
                    }
                    if(index != -1){
                        //判断版本
                        if(versionCtrl.satisfied(swes[j].version, ranges[i].version)){
                            isSatisfied = true;
                            break;
                        }
                    }
                }
                if(!isSatisfied){
                    unSatisfiedList.push(ranges);
                }
            }
            return callback(JSON.stringify({status:1,unSatisfiedList:unSatisfiedList}));
        }
    })
};

softwareEnCtrl.addBySelect = function (itemsID, callback) {

};

// softwareEnCtrl.updateItem = function (srcItem, newItem, callback) {
//     // var hasAlias = false;
//     // for(var i=0;i<newItem.alias.length;i++){
//     //     for(var j=0;j<srcItem.alias.length;i++){
//     //         if(srcItem.alias[j] == newItem.alias[i]){
//     //             hasAlias = true;
//     //             break;
//     //         }
//     //     }
//     //     if(srcItem.name == newItem.alias[i])
//     //         hasAlias = true;
//     //     if(!hasAlias)
//     //         srcItem.alias.push(newItem.alias[i]);
//     // }
//     // hasAlias = false;
//     // for(var k=0;k<srcItem.alias.length;k++){
//     //     if(newItem.name == srcItem.alias[k]){
//     //         hasAlias = true;
//     //         break;
//     //     }
//     // }
//     // if(newItem.name == srcItem.name)
//     //     hasAlias = true;
//     // if(!hasAlias)
//     //     srcItem.alias.push(newItem.name);
//     sweModel.update(srcItem,function (err, data) {
//         if(err){
//             callback(err);
//         }
//         else{
//             callback(null,data);
//         }
//     })
// };