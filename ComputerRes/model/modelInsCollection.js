/**
 * Created by Franklin on 2016/7/25.
 * model for ModelInstance
 */
var ModelInstance = require('./modelInstance');
var setting = require('../setting');
var GeoDataCtrl = require('../control/geoDataControl');
var ModelSerModel = require('./modelService');
var fs = require('fs');

function ModelInsCollection() {
    this.ModelInsArr = [];
}

module.exports = ModelInsCollection;

//! 添加新模型运行实例
ModelInsCollection.prototype.addIns = function (mis)
{
    this.ModelInsArr.push(mis);
    return this.ModelInsArr.length - 1;
}

//! 根据GUID删除模型运行实例
ModelInsCollection.prototype.removeByGUID = function (guid)
{
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr.splice(i, 1);
            return 1;
        }
    }
    return -1;
}

//! 得到所有模型
ModelInsCollection.prototype.getAllIns = function () {
    var miss = [];
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        var mis = {
            ms : this.ModelInsArr[i].ms,
            guid : this.ModelInsArr[i].guid,
            start : this.ModelInsArr[i].start,
            state : this.ModelInsArr[i].state
        }
        miss.push(mis);
    }
    return miss;
}

//! 根据Socket删除模型运行实例
ModelInsCollection.prototype.removeBySocekt = function (socket)
{
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            this.ModelInsArr.splice(i, 1);
            return 1;
        }
    }
    return -1;
}

//! 根据GUID查询运行实例
ModelInsCollection.prototype.getByGUID = function (guid) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            return this.ModelInsArr[i];
        }
    }
    return -1;
}

//! 根据GUID查询运行实例拷贝信息
ModelInsCollection.prototype.getByGUIDCopy = function (guid) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            var mis = {
                guid : guid,
                ms : this.ModelInsArr[i].ms,
                start : this.ModelInsArr[i].start,
                state : this.ModelInsArr[i].state
            };
            return mis;
        }
    }
    return -1;
}

//! 根据Socket查询运行实例
ModelInsCollection.prototype.getBySocekt = function (socket) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            return this.ModelInsArr[i];
        }
    }
    return -1;
}

//! 根据序列查询运行实例
ModelInsCollection.prototype.getByIndex = function (index) {
    if(index > this.ModelInsArr.length - 1)
    {
        return -1;
    }
    return this.ModelInsArr[index];
}

//! 判断一个Socket通信是否存在
ModelInsCollection.prototype.exsit = function (socket) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            return i;
        }
    }
    return -1;
}

//! 绑定ms属性
ModelInsCollection.prototype.bindMs = function (guid, ms) {
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].ms = ms;
            return 1;
        }
    }
    return -1;
}

//! 绑定socket属性
ModelInsCollection.prototype.bindSocket = function (guid, socket) {
    for(var i = 0; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].socket = socket;
            return 1;
        }
    }
    return -1;
}

//! 根据Socket更改状态
ModelInsCollection.prototype.changeStateBySocket = function (socket, state) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].socket == socket)
        {
            this.ModelInsArr[i].state = state;
            return 1;
        }
    }
    return -1;
}

//! 根据GUID更改状态
ModelInsCollection.prototype.changeStateByGUID = function (guid, state) {
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].state = state;
            return 1;
        }
    }
    return -1;
};

//! 杀死某个模型程序
ModelInsCollection.prototype.kill = function(guid){
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].socket.write('{kill}');
            return 1;
        }
    }
    return -1;
}



//! 初始化
ModelInsCollection.prototype.initialize = function(guid ,socket){
    var flag = this.bindSocket(guid, socket);
    if(flag == -1){
        socket.write('kill');
    }
    else{
        var mis = this.getByGUID(guid);
        mis.state = 'Initialized';
        socket.write('{Initialized}' + guid + '[' + __dirname + '/../geo_dataMapping/CommonShell/x64' +  ']' + '[' + setting.modelpath + mis.ms.ms_path + '/instance/' + guid + ']');
        this.getByGUID(guid).log.push('Initalized');
    }
}

//! 进入状态
ModelInsCollection.prototype.enterState = function(guid, state){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Enter State : ' + state);
        mis.socket.write('{Enter State Notified}');
    }
}

//! 激发事件
ModelInsCollection.prototype.fireEvent = function(guid, state, event){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Fire Event : state - ' + state + ' event - ' + event);
        mis.socket.write('{Fire Event Notified}');
    }
}

//! 索取数据
ModelInsCollection.prototype.requestData = function(guid, state, event){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Request Data : state - ' + state + ' event - ' + event);

        var hasFound = false;
        for(var i = 0; i < mis.input.length; i++){
            if(mis.input[i].StateName == state && mis.input[i].Event == event){
                hasFound = true;
                var op = mis.input[i].Optional;
                if(mis.input[i].DataId == ''){
                    if (op ==0)
                        mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
                    else
                        mis.socket.write('{Request Data Notified}[OK][XML|FILE]');
                    return;
                }
                GeoDataCtrl.getByKey(mis.input[i].DataId, function(err, dat){
                    if(err){
                        if (op==0)
                            mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
                        else
                            mis.socket.write('{Request Data Notified}[OK][XML|FILE]');
                    }
                    if(dat.gd_type == 'FILE'){
                        mis.socket.write('{Request Data Notified}[OK][XML|FILE]' + __dirname + '/../geo_data/' + dat.gd_value);
                    }
                    else if(dat.gd_type == 'ZIP'){
                        mis.socket.write('{Request Data Notified}[OK][ZIP|FILE]' + __dirname + '/../geo_data/' + dat.gd_value);
                    }
                });
                break;
            }
        }
        if(!hasFound)
            mis.socket.write('{Request Data Notified}[ERROR][XML|FILE]');
    }
}

//! 得到数据
ModelInsCollection.prototype.responseDataPrepare = function(guid, state, event, dataSignal, dataType, dataFormat){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.socket.write('{Response Data Notified}');
    }
}

//! 得到数据
ModelInsCollection.prototype.responseData = function(guid, state, event, data, dataSignal, dataType, dataFormat){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        if(dataSignal == 'OK'){
            for(var i = 0; i < mis.output.length; i++){
                if(mis.output[i].StateName == state && mis.output[i].Event == event){
                    if(dataFormat == 'FIL' || dataFormat == 'FILE'){
                        var ext = data.substr(data.lastIndexOf('.'));
                        var filename = mis.output[i].DataId + ext;
                        var stat = fs.statSync(data);
                        var gd = {
                            gd_id : mis.output[i].DataId,
                            gd_tag : mis.output[i].Tag,
                            gd_size: stat.size,
                            gd_type: dataType,
                            gd_value: filename
                        };
                        fs.rename(data, __dirname + '/../geo_data/' + filename, function(err, result){
                            if(err){}
                            GeoDataCtrl.addData(gd, function(err, result){
                                if(err){
                                    console.log('OMG!')
                                }
                            });
                        });
                    }
                }
            }
        }
        mis.socket.write('{Response Data Received}' + mis.guid);
    }
}

//! 获取异常错误信息
ModelInsCollection.prototype.postErrorInfo = function(guid, errorinfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Error info : ' + errorinfo);
        return mis.socket.write('{Post Error Info Notified}' + mis.guid);
    }
}

//! 获取警告信息
ModelInsCollection.prototype.postWarningInfo = function(guid, warninginfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Warning info : ' + warninginfo);
        return mis.socket.write('{Post Warning Info Notified}' + mis.guid);
    }
}

//! 获取提示信息
ModelInsCollection.prototype.postMessageInfo = function(guid, messageinfo){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Message info : ' + messageinfo);
        return mis.socket.write('{Post Message Info Notified}' + mis.guid);
    }
}

//! 获取模型依赖组件目录
ModelInsCollection.prototype.getModelAssembly = function(guid, assemblyName, callback){
    var mis = this.getByGUID(guid);
    ModelSerModel.readMDL(mis.ms, function(err, mdl){
        if(err){
            return mis.socket.write('{GetModelAssembly Notified}' + mis.guid);
        }
        var assemblies = mdl.ModelClass.Runtime.Assemblies.Assembly;
        if(assemblies instanceof Array){
            for(var i = 0; i < assemblies.length; i++){
                if(assemblies[i].$.name == assemblyName){
                    var path = assemblies[i].$.path;
                    var idx1 = -1;
                    if (path.indexOf('$(DataMappingPath)')!=-1){
                        idx1 = path.indexOf('$(DataMappingPath)');
                        path = path.substr(idx1+18);
                        path = '/../geo_dataMapping/' + path
                    }
                    else if (path.indexOf('$(ModelServicePath)')!=-1){
                        idx1 = path.indexOf('$(ModelServicePath)');
                        path = path.substr(idx1+19);
                        path = '/../geo_model/' + path;
                    }
                    return mis.socket.write('{GetModelAssembly Notified}' + __dirname + path);
                }
            }
        }
        else{
            if(assemblies.$.name == assemblyName){
                var path = assemblies[i].$.path;
                var idx1 = -1;
                if (path.indexOf('$(DataMappingPath)')!=-1){
                    idx1 = path.indexOf('$(DataMappingPath)');
                    path = path.substr(idx1+1);
                    path = '/../geo_dataMapping/' + path
                }
                else if (path.index('$(ModelServicePath)')!=-1){
                    idx1 = path.index('$(ModelServicePath)');
                    path = path.substr(idx1+19);
                    path = '/../geo_model/' + path;
                }
                return mis.socket.write('{GetModelAssembly Notified}' + mis.guid + '&' + __dirname + path);
            }
        }
        return mis.socket.write('{GetModelAssembly Notified}' + mis.guid);
    });
}

//! 离开状态
ModelInsCollection.prototype.leaveState = function(guid, state){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Leave State : state - ' + state);
        mis.socket.write('{Leave State Notified}');
    }
}

//! 结束
ModelInsCollection.prototype.finalize = function(guid){
    var mis = this.getByGUID(guid);
    if(mis != -1){
        mis.log.push('Finalize');
        mis.state = 'Finalized';
        mis.socket.write('{Finalize Notified}');
    }
}