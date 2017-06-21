/**
 * Created by SCR on 2017/6/10.
 */
var fs = require('fs');
var setting = require('../setting');
var FileOpera = require('../utils/fileOpera');
var GeoDataCtrl = require('./geoDataControl');
var ModelSerRunModel = require('../model/modelSerRun');

var testifyCtrl = function () {
};

module.exports = testifyCtrl;

testifyCtrl.addDefaultTestify = function (msid,getInputData,callback) {
    if(!callback){
        callback = function () {};
    }
    var testifyRoot = setting.modelpath + msid + '/testify';
    var configPath = setting.modelpath + msid + '/testify/config.json';
    var configData;
    fs.stat(configPath,function (err, stat) {
        if(err){
            if(err.code = 'ENOENT'){
                configData = '[]';
            }
            else{
                return callback()
            }
        }
        else if(stat){
            configData = fs.readFileSync(configPath).toString();
        }
        var configJSON = JSON.parse(configData);
        for(var i=0;i<configJSON.length;i++){
            if(configJSON[i].tag == 'default'){
                //已经生成过默认测试数据
                return callback();
            }
        }
        //得到testify一级目录下的所有xml
        FileOpera.getAllFiles(testifyRoot,'.xml',function (files) {
            getInputData(msid,function (err, states) {
                if(err){
                    return callback();
                }
                var newTestify = {
                    tag:'default',
                    detail:'',
                    path:'',
                    inputs:[]
                };
                var geodataList = [];
                //针对博文的所有测试数据都是input的情况
                if(states.length == 1 && states[0].$.name=='RUNSTATE'){
                    var stateID = states[0].$.id;
                    var events = states[0].Event;
                    for(var i=0;i<events.length;i++){
                        if(events[i].$.name == 'LOADDATASET' && events[i].$.type == 'response'){
                            for(var j=0;j<files.length;j++){
                                if(files[j] == 'input.xml'){
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = __dirname + '/../geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/input.xml').toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId:gdid,
                                        Event:events[i].$.name,
                                        Optional:events[i].$.optional,
                                        StateId:stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if(stat.size - 16>setting.data_size){
                                        geodata = {
                                            gd_id:gdid,
                                            gd_tag:'',
                                            gd_type:'FILE',
                                            gd_value:fname
                                        };
                                    }
                                    else{
                                        geodata = {
                                            gd_id:gdid,
                                            gd_tag:'',
                                            gd_type:'STREAM',
                                            gd_value:gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                else{
                    for(var i=0;i<states.length;i++){
                        var stateID = states[i].$.id;
                        var events = states[i].Event;
                        for(var j=0;j<events.length;j++){
                            for(var k=0;k<files.length;k++){
                                if(events[j].$.name + '.xml' == files[k] && events[j].$.type == 'response'){
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = __dirname + '/../geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/' + files[i]).toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId:gdid,
                                        Event:events[j].$.name,
                                        Optional:events[j].$.optional,
                                        StateId:stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if(stat.size - 16>setting.data_size){
                                        geodata = {
                                            gd_id:gdid,
                                            gd_tag:'',
                                            gd_type:'FILE',
                                            gd_value:fname
                                        };
                                    }
                                    else{
                                        geodata = {
                                            gd_id:gdid,
                                            gd_tag:'',
                                            gd_type:'STREAM',
                                            gd_value:gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                var addFile = function (i) {
                    //向redis中添加记录
                    GeoDataCtrl.addData(geodataList[i],function (err, rst) {
                        if (err) {
                            return callback()
                        }
                        else{
                            if(i < geodataList.length-1){
                                addFile(i+1);
                            }
                            else{
                                if(geodataList.length == 0){
                                    fs.writeFileSync(configPath,'[]');
                                }
                                else{
                                    //没有出错在向config.json中添加记录
                                    configJSON.push(newTestify);
                                    fs.writeFileSync(configPath,JSON.stringify(configJSON));
                                }
                                return callback();
                            }
                        }
                    });
                };
                if(geodataList.length)
                    addFile(0);
                else
                    callback();
            });
        });
    });
};

testifyCtrl.addTestify = function (msrid,testifyData,callback) {
    ModelSerRunModel.getByOID(msrid,function (err, msr) {
        if(err){
            return callback(err);
        }
        var configRoot = setting.modelpath + msr.ms_id + '/testify';
        var configPath = configRoot + '/config.json';
        fs.stat(configPath,function (err, stat) {
            var configJSON;
            if(stat && !err){
                var configData = fs.readFileSync(configPath).toString();
                if(configData == ""){
                    configData = "[]";
                }
                configJSON = JSON.parse(configData);
                //判断是否已添加该测试记录
                for(var i=0;i<configJSON.length;i++){
                    if(configJSON[i].DataId == msrid){
                        return callback(null,{suc:true,status:2});
                    }
                }
            }
            else if(err.code = 'ENOENT'){
                configJSON = [];
            }
            else{
                callback(err);
            }
            var newTestify = configRoot + '/' + msrid;
            try{
                fs.mkdirSync(newTestify);
            }
            catch(e){
                if(e.code!='EEXIST')
                    return callback(err);
            }
            for(var i=0;i<msr.msr_input.length;i++){
                if(msr.msr_input[i].DataId != "") {
                    var srcPath = __dirname + '/../geo_data/' + msr.msr_input[i].DataId + '.xml';
                    var dstPath = newTestify + '/' + msr.msr_input[i].DataId + '.xml';
                    try{
                        if(fs.existsSync(srcPath)){
                            var srcData = fs.readFileSync(srcPath).toString();
                            fs.writeFileSync(dstPath,srcData);
                        }
                    }
                    catch(e){
                        callback(e);
                    }
                }
            }


            //添加记录
            testifyData.inputs = [];
            for(var i=0;i<msr.msr_input.length;i++){
                if(msr.msr_input[i].DataId!=""){
                    var input = {
                        DataId:msr.msr_input[i].DataId,
                        Event:msr.msr_input[i].Event,
                        Optional:msr.msr_input[i].Optional,
                        StateId:msr.msr_input[i].StateId
                    };
                    testifyData.inputs.push(input);
                }
            }
            configJSON.push(testifyData);
            fs.writeFile(configPath,JSON.stringify(configJSON),function (err) {
                if(err){
                    console.log(err);
                    return callback(err);
                }
                callback(null,{suc:true,status:1});
            })
        })
    })
};

testifyCtrl.getTestify = function (msid, callback) {
    var configPath = setting.modelpath + msid + '/testify/config.json';
    fs.stat(configPath,function (err, stat) {
        var rst;
        if(err){
            if(err.code = 'ENOENT'){
                rst = {status:0,testifies:[]};
            }
            else{
                rst = {status:-1};
            }
        }
        else if(stat){
            var testifyData = fs.readFileSync(configPath).toString();
            rst = {status:1,testifies:JSON.parse(testifyData)};
        }
        rst = JSON.stringify(rst);
        callback(rst);
    })
};

testifyCtrl.delTestify = function (msid,testifyPath, callback) {
    var testifyFolder = setting.modelpath + msid + '/testify/' + testifyPath;
    var configPath = setting.modelpath + msid + '/testify/config.json';
    var configData = fs.readFileSync(configPath).toString();
    var configJSON = JSON.parse(configData);
    try{
        //删除记录
        for(var i=0;i<configJSON.length;i++){
            if(testifyPath == configJSON[i].path){
                configJSON.splice(i,1);
                break;
            }
        }
        fs.writeFileSync(configPath,JSON.stringify(configJSON));
        //删除文件
        FileOpera.rmdir(testifyFolder);
        callback(JSON.stringify({suc:true}));
    }
    catch(e){
        return callback(JSON.stringify({suc:false}));
    }
};