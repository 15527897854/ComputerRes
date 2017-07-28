/**
 * Created by SCR on 2017/7/19.
 */
// 数据驱动的模型集成

// 这里所有的MSID都是MSInstanceID，只有运行时传过去的那个才是真正的MSID

var SysCtrl = require('../sysControl');
var RmtReqCtrl = require('../remoteReqControl');
var AggreSolutionModel = require('../../model/Integrate/aggreSolution');
var AggreTaskModel = require('../../model/Integrate/aggreTask');
var setting = require('../../setting');
var GeoDataCtrl = require('../geoDataControl');
var ModelSerControl = require('../modelSerControl');
var ModelIns = require('../../model/modelInstance');
var ModelSerModel = require('../../model/modelService');
var ModelSerRunCtrl = require('../modelSerRunControl');
var ModelSerRunModel = require('../../model/modelSerRun');
var NoticeCtrl = require('../noticeCtrl');
var uuid = require('node-uuid');
var WebSocketCtrl = require('./WebSocketCtrl');
var TaskInstanceManager = require('../../model/Integrate/TaskInstanceManager');

var Path = require('path');
var fs = require('fs');

// 状态和角色分开存
const DataState = {
    // unready: 'UNREADY',      // DataState表示的是已经上传过的数据的状态，没有 unready这一种
    ready: 'READY',             // 准备好，表示初始状态，将要分发的状态，before dispatch
    pending: 'PENDING',         // 正在传输 dispatching
    received: 'RECEIVED',       // 计算节点接受成功 after dispatch
    failed: 'FAILED'            // 计算节点接受失败 failed
    // mid: 'MID',                 // 计算中间产物
    // result: 'RESULT'            // 输出数据的状态，是最终计算结果数据（没有流向下个模型） is result
    // used: 'USED'                // 模型已经跑完，使用过该数据 is used

};

const TaskState = {
    configured: 'CONFIGURED',
    collapsed: 'COLLAPSED',
    end: 'END',
    finished: 'FINISHED',
    running: 'RUNNING',
    pause: 'PAUSE'
};

const MSState = {
    unready: 'UNREADY',         // 初始状态，前台创建task时默认是这种
    pending: 'PENDING',         // 正在发送运行指令
    pause: 'PAUSE',             // 允许用户给准备好的模型打断点
    collapsed: 'COLLAPSED',     // 运行失败，两种情况：调用出错；运行失败
    running: 'RUNNING',         // 现在默认准备好数据就开始运行
    finished: 'FINISHED'        // 运行成功且结束
};

global.DataState = DataState;
global.TaskState = TaskState;
global.MSState = MSState;

module.exports = (function () {

    var __getServiceStates = function (service) {
        return service.MDL.ModelClass.Behavior.StateGroup.States.State;
    };

    var __getServiceEvents = function (service) {
        var states = __getServiceStates(service);
        var eventList = [];
        if(states instanceof Array){
            for(let i=0;i<states.length;i++){
                let state = states[i];
                let stateID = state._$.id;
                let events = state.Event;
                if(events instanceof Array){
                    for(let j=0;j<events.length;j++){
                        events[j].stateID = stateID;
                        eventList.push(events[j]);
                    }
                }
                else{
                    events.stateID = stateID;
                    eventList.push(events);
                }
            }
        }
        else{
            let state = states;
            let stateID = state._$.id;
            let events = state.Event;
            if(events instanceof Array){
                for(let j=0;j<events.length;j++){
                    events[j].stateID = stateID;
                    eventList.push(events[j]);
                }
            }
            else{
                events.stateID = stateID;
                eventList.push(events);
            }
        }
        return eventList;
    };

    var __aggreRun = function (runCfg, user, cb) {
        var msid = runCfg.msid;
        var inputData = runCfg.inputData;
        var outputData = runCfg.outputData;

        var run_next = function (){
            //生成唯一字符串GUID
            var guid = uuid.v4();

            //向内存中添加模型运行记录条目
            var date = new Date();
            var mis = {
                guid : guid,
                socket : null,
                ms : null,
                start : date.toLocaleString(),
                state : 'MC_READY',

                isIntegrate: true,
                centerHost: runCfg.centerHost,
                centerPort: runCfg.centerPort,
                taskID: runCfg.taskID,
                MSinsID: runCfg.MSinsID
            };
            var modelIns = new ModelIns(mis);
            app.modelInsColl.addIns(modelIns);

            ModelSerModel.getByOID(msid, function(err, ms){
                //添加纪录
                var msr = {
                    ms_id : ms._id,
                    msr_ms : ms,
                    msr_date : date.toLocaleString(),
                    msr_time : 0,
                    msr_user : user,
                    msr_guid : guid,
                    msr_input : inputData,
                    msr_output : outputData,
                    msr_status : 0,
                    msr_des : ''
                };
                ModelSerRunCtrl.save(msr ,function (err, msr) {
                    if(err) {
                        return cb(err);
                    }
                    if(ms.ms_status != 1) {
                        return cb({
                            Error : -1,
                            Message : 'Service is not available'
                        });
                    }
                    ModelSerModel.run(msid, guid, function (err, stdout, stderr) {
                        ModelSerRunModel.getByGUID(guid, function (err2, item) {
                            if(err2) {
                                return console.log(JSON.stringify(err2));
                            }
                            if(item == null) {
                                return console.log( 'Can not find MSR when it is ended !');
                            }
                            if(err){
                                item.msr_des += 'Error Message : ' + JSON.stringify(err) + '\r\n';
                            }
                            if(stdout){
                                item.msr_des += 'Stand Output Message : ' + JSON.stringify(stdout) + '\r\n';
                            }
                            if(stderr){
                                item.msr_des += 'Stand Error Message : ' + JSON.stringify(stderr) + '\r\n';
                            }
                            var mis = global.app.modelInsColl.getByGUID(guid);
                            //没有配置环境，进程无法启动
                            if(mis.state == "MC_READY" && mis.socket == null){
                                global.app.modelInsColl.removeByGUID(guid);
                                item.msr_status = -1;
                                ModelSerRunModel.update(item, function (err, res) {
                                    if(err) {
                                        return console.log(JSON.stringify(err2));
                                    }
                                })
                            }
                            else {
                                ModelSerRunModel.updateDes(item._id, item.msr_des, function (err, res) {
                                    if(err) {
                                        return console.log(JSON.stringify(err2));
                                    }
                                });
                            }
                        });
                    }, function (err, ms) {
                        if(err) {
                            return cb(err);
                        }
                        //绑定内存实例的ms属性
                        global.app.modelInsColl.bindMs(guid, ms);

                        //存储通知消息
                        var notice = {
                            time : new Date(),
                            title : ms.ms_model.m_name + '开始运行！',
                            detail : '',
                            type : 'start-run',
                            hasRead : false
                        };
                        NoticeCtrl.save(notice, function (err, data) {
                            if(err) {
                                console.log(JSON.stringify(err));
                            }
                        });
                        return cb(null, msr);
                    });
                });
            });
        };

        if(outputData == undefined || outputData == null) {
            ModelSerControl.getInputData(msid, function(err, data){
                if(err) {
                    return cb(err);
                }
                //指定输出文件参数
                outputData = [];
                for(var k = 0; k < data.length; k++) {
                    for(var i = 0; i < data[k].Event.length; i++) {
                        if(data[k].Event[i].$.type == 'noresponse') {
                            var dataid = 'gd_' + uuid.v1();
                            var item = {
                                StateId : data[k].$.id,
                                Tag : 'OUTPUT',
                                Event : data[k].Event[i].$.name,
                                DataId : dataid,
                                Ready : false
                            };
                            outputData.push(item);
                        }
                    }
                }
                run_next();
            });
        }
        else {
            outputData = outputData;
            //指定输出文件参数
            for(var k = 0; k < outputData.length; k++) {
                var dataid = 'gd_' + uuid.v1();
                outputData[k]['DataId'] = dataid;
                outputData[k]['Ready'] = false;
            }

            run_next();
        }
    };

    // 分发数据坐标，更新数据状态
    var __emitDataPosition = function (taskID, taskData, cb) {
        var url = 'http://' + taskData.host + ':' + taskData.port + '/aggregation/onReceivedDataPosition';
        var form = {
            taskID: taskID,
            gdid: taskData.gdid,
            host: taskData.host,
            port: taskData.port,
            MSID: taskData.MSID,
            stateID: taskData.stateID,
            eventName: taskData.eventName
        };
        if(app.centerHost){
            form.centerHost = app.centerHost;
            form.centerPort = app.centerPort;
        }
        RmtReqCtrl.postByServer(url,form,function (err, res) {
            if(err){
                // TODO 重新尝试
                return cb(err);
            }
            else{
                return cb(null);
            }
        })
    };

    // 判断一个模型的输出数据是否是作为另一个模型的输入
    var __get2NodeEvent = function (solution, MSID, stateID, eventName) {
        var relationList = solution.solutionCfg.relationList;
        var has2Node = false;
        var toNode = null;
        for(let i=0;i<relationList.length;i++){
            var fromNode = relationList[i].from;
            if(fromNode.MSID == MSID && fromNode.stateID == stateID && fromNode.eventName == eventName){
                has2Node = true;
                toNode = relationList[i].to;
                break;
            }
        }
        if(has2Node){
            return toNode;
        }
        else{
            return null;
        }
    };

    var __getTaskState = function (task) {
        var MSStateList = task.MSState;
        var hasRunning = false;
        var hasCollapsed = false;
        var hasPause = false;
        var hasUnready = false;
        var hasFinished = false;
        var hasPending = false;
        var pauseStates = [];
        for(let i=0;i<MSStateList.length;i++){
            var state = MSStateList[i].state;
            var MSID = MSStateList[i].MSID;
            if(state == MSState.collapsed){
                hasCollapsed = true;
            }
            else if(state == MSState.running){
                hasRunning = true;
                break;
            }
            else if(state == MSState.finished){
                hasFinished = true;
            }
            else if(state == MSState.pause){
                hasPause = true;
                pauseStates.push(MSID);
            }
            else if(state == MSState.unready){
                hasUnready = true;
            }
            else if(state == MSState.pending){
                hasPending = true;
                break;
            }
        }

        if(hasRunning || hasPending){
            return TaskState.running;
        }
        else if(hasCollapsed){
            return TaskState.collapsed;
        }
        else if(hasUnready && !hasPause){
            return TaskState.end;
        }
        else if(hasUnready && hasPause){
            // 状态可能是end pause，看unready的state在pause之前还是之后
            // 如果所有pause的service的状态都是准备好的，task的状态就是pause，否则是end
            let isAllMSReady = true;
            for(let i=0;i<pauseStates.length;i++){
                if(!checkMSState(task._id,null,pauseStates[i],true)){
                    isAllMSReady = false;
                    break;
                }
            }
            if(isAllMSReady){
                return TaskState.pause;
            }
            else {
                return TaskState.end;
            }
        }
        else{
            if(hasPause){
                return TaskState.pause;
            }
            else if(hasCollapsed){
                return TaskState.collapsed;
            }
            else{
                return TaskState.finished;
            }
        }
    };

    // region deprecated
    // 恢复任务
    // 场景
    // 运算结果数据可能没加入进来，这样就没有数据驱动task继续运行下去
    var __restoreTaskScene = function (task) {
        var msStateList = task.MSState;
        AggreSolutionModel.getByOID(task.taskCfg.solutionID,function (err, solution) {
            if(err){
                WebSocketCtrl.emit(taskID,'error',JSON.stringify({error:err}));
            }
            else{
                for(let i=0;i<msStateList.length;i++){
                    if(msStateList[i].state == MSState.finished){
                        __restoreServiceScene(task, solution, msStateList[i].MSID);
                    }
                }

            }
        });
    };

    var __restoreServiceScene = function (task, solution, MSID) {
        var service = null;
        var serviceList = solution.solutionCfg.serviceList;
        var dataList = task.taskCfg.dataList;
        for(let i=0;i<serviceList.length;i++){
            if(serviceList[i]._id == MSID){
                service = serviceList[i];
            }
        }
        if(service){
            var events = __getServiceEvents(service);
            for(let i=0;i<events.length;i++){
                var event = events[i];
                var hasInserted = false;
                for(let j=0;j<dataList.length;j++){
                    if(dataList[j].MSID == MSID && dataList[j].stateID == event.stateID && event._$.name){
                        hasInserted = true;
                    }
                }
            }
        }
    };
    // endregion

    return {
        // 以模型为入口，查找模型依赖的输入数据，驱动数据分发和模型运算
        init: function (task) {
            var MSStateList = task.MSState;
            var taskState = TaskState.configured;
            for(let i=0;i<MSStateList.length;i++){
                if(MSStateList[i].state == MSState.unready){
                    var MSID = MSStateList[i].MSID;
                    var serviceDataList = [];
                    var taskDataList = task.taskCfg.dataList;
                    for(let j=0;j<taskDataList.length;j++){
                        if(taskDataList[j].MSID == MSID){
                            serviceDataList.push(taskDataList[j]);
                        }
                    }
                    this.dispatchDataListPosition(task._id,MSID,serviceDataList);
                }
            }

        },

        // 分发数据坐标，更新数据状态为pending
        // 返回一个数组，[{error:Object}]，通过websocket传给前台
        dispatchDataListPosition: function (taskID,MSID,dataList) {
            var dispatchRst = [];
            var count = 0;
            // __restoreTaskScene(task);

            // 不需要输入数据的模型
            if(dataList.length == 0){
                this.checkMSState(taskID,null,MSID);
                return;
            }
            for(let i=0;i<dataList.length;i++){
                // 只分发ready状态的数据
                if(dataList[i].state == DataState.ready){
                    dispatchRst.push({
                        gdid: dataList[i].gdid,
                        MSID: dataList[i].MSID,
                        stateID: dataList[i].stateID,
                        eventName: dataList[i].eventName,
                        host: dataList[i].host,
                        port: dataList[i].port,
                        error:null
                    });
                    __emitDataPosition(taskID, dataList[i],(function (i) {
                        count++;
                        return function (err){
                            count--;
                            if(err){
                                dispatchRst[i].error = err;
                                err.place = '__emitDataPosition';
                            }
                            if(count == 0){
                                // 更新数据状态
                                TaskInstanceManager.updateDataListState(taskID, dispatchRst, function (err, rst) {
                                    if(err){
                                        err.place = 'updateDataListState';
                                    }
                                    WebSocketCtrl.emit(taskID,'data dispatched', JSON.stringify({error:err,dispatchRst:dispatchRst}))
                                });
                            }
                        }
                    })());
                }
            }
        },

        // 拿到数据坐标，下载数据并添加到数据库中
        onReceivedDataPosition: function (dataPosition) {
            var self = this;
            var url = 'http://' + dataPosition.host + ':' + dataPosition.port + '/geodata/detail/' + dataPosition.gdid;
            // 请求数据
            new Promise(function (resolve, reject) {
                RmtReqCtrl.getByServer(url,null,function (err, res) {
                    if(err){
                        return reject(err);
                    }
                    else {
                        return resolve(JSON.parse(res));
                    }
                })
            })
                // 保存数据
                .then(function (gd) {
                    return new Promise(function (resolve, reject) {
                        if(gd.error){
                            reject(new Error(gd.error));
                        }
                        if(gd.gd_type == 'FILE'){
                            var path = Path.join(__dirname,'../../geo_data/' + dataPosition.gdid);
                            fs.writeFile(path,gd.gd_value,function (err) {
                                if (err) {
                                    return reject(err);
                                }
                                else{
                                    gd.gd_value = dataPosition.gdid + '.xml';
                                    GeoDataCtrl.addData(gd,function (err, rst) {
                                        if(err){
                                            return reject(err);
                                        }
                                        else{
                                            return resolve();
                                        }
                                    })
                                }
                            });
                        }
                        else if(gd.gd_type == 'STREAM'){
                            GeoDataCtrl.addData(gd,function (err, rst) {
                                if(err){
                                    return reject(err);
                                }
                                else{
                                    return resolve();
                                }
                            })
                        }
                    })
                })
                // 回复消息
                .then(function () {
                    // 添加过数据后的处理
                    let replyData = {
                        taskID: dataPosition.taskID,
                        gdid: dataPosition.gdid,
                        MSID: dataPosition.MSID,
                        stateID: dataPosition.stateID,
                        eventName: dataPosition.eventName,
                        err: null
                    };
                    self.emitDataDownloaded(replyData, dataPosition.centerHost, dataPosition.centerPort);
                })
                .catch(function (err) {
                    err.place = 'onReceivedDataPosition';
                    console.log(err);
                    let replyData = {
                        taskID: dataPosition.taskID,
                        gdid: dataPosition.gdid,
                        MSID: dataPosition.MSID,
                        stateID: dataPosition.stateID,
                        eventName: dataPosition.eventName,
                        err: err
                    };
                    self.emitDataDownloaded(replyData, dataPosition.centerHost, dataPosition.centerPort);
                })
        },

        // 下载完数据后回复消息（是否下载成功）
        emitDataDownloaded: function (replyData, centerHost, centerPort) {
            var url = 'http://' + centerHost + ':' + centerPort + '/aggregation/onReceivedDataDownloaded';
            RmtReqCtrl.postByServer(url,replyData,function (err, res) {
                if(err){
                    // TODO 重新发送请求，当请求超过三次后放弃
                }
            })
        },

        // update data state
        onReceivedDataDownloaded: function (replyData) {
            var self = this;
            var state = null;
            if(!replyData.err){
                state = DataState.received;
            }
            else{
                state = DataState.failed;
            }
            TaskInstanceManager.updateDataState(replyData.taskID, replyData.gdid, state,function (err,rst) {
                if(err){
                    err.place = 'updateDataState';
                }
                WebSocketCtrl.emit(replyData.taskID, 'data downloaded', JSON.stringify({error:err,downloadRst:replyData}));
                if(!err && !replyData.err) {
                    self.checkMSState(replyData.taskID,replyData.gdid);
                }
            });
        },

        // 先暂时不管多state的情况，只有所有state的数据准备好了才能运行
        checkMSState: function (taskID,gdid, MSinsID, getRstflag) {
            var self = this;
            // var MSinsID = null;     // 一个ms可能会有多个实例
            var task = TaskInstanceManager.get(taskID);
            if(task){
                var dataList = [];
                if(!MSinsID){
                    dataList = task.taskCfg.dataList;
                    for(let i=0;i<dataList.length;i++){
                        if(dataList[i].gdid == gdid){
                            if(dataList[i].isMid == null || dataList[i].isMid == false){
                                MSinsID = dataList[i].MSID;
                                break;
                            }
                        }
                    }
                }
                if(MSinsID){
                    let msEvents = [];
                    for(let i=0;i<dataList.length;i++){
                        if(dataList[i].MSID == MSinsID){
                            msEvents.push(dataList[i]);
                        }
                    }
                    TaskInstanceManager.getServiceByID(taskID, MSinsID,function (err, service) {
                        if(err){
                            err.place = 'getServiceByID checkMSState';
                            if(getRstflag){
                                return false;
                            }
                            else{
                                return WebSocketCtrl.emit(taskID,'error',JSON.stringify({error:err}));
                            }
                        }
                        else{
                            var inputData = [];
                            var outputData = [];
                            var isMSReady = true;
                            var eventList = __getServiceEvents(service);
                            // 判断模型数据是否准备好，并组织输入输出
                            for(let i=0;i<eventList.length;i++){
                                var isDataReady = false;
                                if(eventList[i]._$.type == 'response'){
                                    inputData.push({
                                        DataId: '',
                                        Event: eventList[i]._$.name,
                                        Optional: eventList[i]._$.optional,
                                        StateId: eventList[i].stateID
                                    });
                                    for(let j=0;j<msEvents.length;j++){
                                        if(eventList[i].stateID == msEvents[j].stateID && eventList[i]._$.name == msEvents[j].eventName){
                                            if(msEvents[j].state == DataState.received){
                                                inputData[i].DataId = msEvents[j].gdid;
                                                isDataReady = true;
                                                break;
                                            }
                                            else{
                                                isDataReady = false;
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if(eventList[i]._$.type == 'noresponse'){
                                    outputData.push({
                                        // DataId: eventList[i].gdid,
                                        // Optional: eventList[i]._$.optional,
                                        StateId: eventList[i].stateID,
                                        Event: eventList[i]._$.name,
                                        Tag:''
                                    });
                                    isDataReady = true;
                                }
                                if(eventList[i]._$.optional == '1' || eventList[i]._$.optional == 'true'){
                                    isDataReady = true;
                                }
                                if(!isDataReady){
                                    isMSReady = false;
                                    break;
                                }
                            }
                            if(isMSReady){
                                if(getRstflag){
                                    return true;
                                }
                                else{
                                    self.emitMSReady(taskID,MSinsID,inputData,outputData);
                                }
                            }
                        }
                    });
                }
                else{
                    if(getRstflag){
                        return false;
                    }
                    else{
                        return WebSocketCtrl.emit(taskID,'error',JSON.stringify({
                            error: {
                                message:'Can\'t find the related model service!',
                                place: 'checkMSState'
                            }
                        }));
                    }
                }
            }
            else{
                if(getRstflag){
                    return false;
                }
                else{
                    return WebSocketCtrl.emit(taskID,'error',JSON.stringify({
                        error: {
                            message:'Can\'t find the related task!',
                            place: 'checkMSState'
                        }
                    }));
                }
            }
        },

        // update MS state, emit ms ready
        emitMSReady: function (taskID,MSinsID,inputData,outputData) {
            TaskInstanceManager.updateMSState(taskID,MSinsID,MSState.pending,function (err, rst) {
                if(err){
                    err.place = 'emitMSReady';
                    return WebSocketCtrl.emit(taskID,'error',JSON.stringify({error:err}));
                }
                else{
                    WebSocketCtrl.emit(taskID,'service starting',JSON.stringify({
                        error:null,
                        MSinsID: MSinsID
                    }));
                    TaskInstanceManager.getServiceByID(taskID, MSinsID, function (err, service) {
                        if(err){
                            return WebSocketCtrl.emit(taskID,'error',JSON.stringify({error: err}));
                        }
                        else{
                            var host = service.host;
                            var port = service.port;
                            var url = 'http://' + host + ':' + port + '/aggregation/onReceivedMSReady';
                            var form = {
                                msid: service.MS._id,
                                inputData: inputData,
                                outputData: outputData,
                                centerHost: app.centerHost,
                                centerPort: setting.port,
                                taskID: taskID,
                                MSinsID: MSinsID
                            };
                            RmtReqCtrl.postByServer(url,form,function (err, res) {
                                if(err){
                                    // TODO 重试
                                }
                                else{
                                    var state = null;
                                    if(!res.error){
                                        state = MSState.running;
                                    }
                                    else{
                                        res.error.place = 'starting service';
                                        state = MSState.collapsed;
                                    }
                                    WebSocketCtrl.emit(taskID,'service started',JSON.stringify({
                                        error:res.error,
                                        MSinsID: MSinsID
                                    }));
                                    TaskInstanceManager.updateMSState(taskID, MSinsID, state, function (err,rst) {
                                        if(err){
                                            err.place = 'updateMSState emitMSReady';
                                            return WebSocketCtrl.emit(taskID,'error',JSON.stringify({error:err}));
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            })
        },

        // 已经写过了，在modelSerAccessRoute的 /modelser/:msid路由中，在此重写一遍，增加了回复功能
        onReceivedMSReady: function (runCfg,user,cb) {
            __aggreRun(runCfg, user, function(err, msr){
                if(err){
                    return cb(err);
                }
                else{
                    return cb(null,msr);
                }
            });
        },

        // 模型运行结束时触发，
        // TODO 这里崩了怎么办？？？
        // TODO center node 向computer node 请求心跳状态。。。
        emitMSFinished: function (finishedInfo,cb) {
            var url = 'http://' + finishedInfo.centerHost + ':' + finishedInfo.centerPort + '/aggregation/onReceivedMSFinished';
            var form = {
                taskID: finishedInfo.taskID,
                MSinsID: finishedInfo.MSinsID,
                MSState: finishedInfo.MSState,
                outputData: finishedInfo.outputData,
                host: finishedInfo.host,
                port: finishedInfo.port
            };
            RmtReqCtrl.postByServer(url,form,function (err, rst) {
                if(err){
                    // TODO 重试
                }
            })
        },

        // update MSState TaskState, dispatch data
        onReceivedMSFinished: function (finishedInfo) {
            var task = TaskInstanceManager.get(finishedInfo.taskID);
            var self = this;
            TaskInstanceManager.updateMSState(finishedInfo.taskID, finishedInfo.MSinsID, finishedInfo.MSState, function (err, rst) {
                if(err){
                    err.place = 'updateMSState onReceivedMSFinished';
                    return WebSocketCtrl.emit(task._id, 'error', JSON.stringify({error: err}));
                }
                else {
                    if(finishedInfo.MSState == MSState.collapsed){
                        var taskState = __getTaskState(task);
                        task.taskState = taskState;
                        TaskInstanceManager.update(task,function (err, rst) {
                            if (err) {
                                err.place = 'update onReceivedMSFinished';
                                return WebSocketCtrl.emit(task._id, 'error', JSON.stringify({error: err}));
                            }
                            else{
                                WebSocketCtrl.emit(task._id,'service stoped',JSON.stringify({
                                    error:null,
                                    MSinsID: finishedInfo.MSinsID,
                                    MSState: finishedInfo.MSState,
                                    newDataList: []
                                }));
                                WebSocketCtrl.emit(task._id,'update task state',JSON.stringify({
                                    error: null,
                                    taskState: taskState
                                }));
                                return ;
                            }
                        });
                    }
                    AggreSolutionModel.getByOID(task.taskCfg.solutionID,function (err, solution) {
                        if(err){
                            return WebSocketCtrl.emit(taskID,'error',JSON.stringify({error:err}));
                        }
                        else{
                            var newDataList = [];
                            for(let i =0;i<finishedInfo.outputData.length;i++){
                                var output = finishedInfo.outputData[i];
                                var toNode = __get2NodeEvent(solution,finishedInfo.MSinsID,output.StateId,output.Event);
                                let newData = {
                                    host: finishedInfo.host,
                                    port: finishedInfo.port,
                                    state: DataState.received,
                                    eventName: output.Event,
                                    stateID: output.StateId,
                                    MSID: finishedInfo.MSinsID,
                                    gdid: output.DataId,
                                    isInput: false
                                };
                                task.taskCfg.dataList.push(newData);
                                newDataList.push(newData);
                                // 有两个实体
                                if(toNode){
                                    newData.isMid = true;
                                    newData = {
                                        host: finishedInfo.host,
                                        port: finishedInfo.port,
                                        state: DataState.ready,
                                        eventName: toNode.eventName,
                                        stateID: toNode.stateID,
                                        MSID: toNode.MSID,
                                        gdid: output.DataId,
                                        isMid: false,
                                        isInput: false
                                    };
                                    task.taskCfg.dataList.push(newData);
                                    newDataList.push(newData);
                                }
                                else{
                                    newData.isMid = false;
                                }
                            }
                            // 程序如果在这里崩了怎么办？数据没更新，重新运行task时没有数据驱动
                            TaskInstanceManager.update(task,function (err, rst) {
                                if(err){
                                    err.place = 'update onReceivedMSFinished';
                                    return WebSocketCtrl.emit(task._id,'error',JSON.stringify({error:err}));
                                }
                                else{
                                    var taskState = __getTaskState(task);
                                    task.taskState = taskState;
                                    TaskInstanceManager.update(task,function (err, rst) {
                                        if (err) {
                                            err.place = 'update onReceivedMSFinished';
                                            return WebSocketCtrl.emit(task._id, 'error', JSON.stringify({error: err}));
                                        }
                                        else{
                                            WebSocketCtrl.emit(task._id,'service stoped',JSON.stringify({
                                                error:null,
                                                MSinsID: finishedInfo.MSinsID,
                                                MSState: finishedInfo.MSState,
                                                newDataList: newDataList
                                            }));
                                            WebSocketCtrl.emit(task._id,'update task state',JSON.stringify({
                                                error: null,
                                                taskState: taskState
                                            }));
                                            self.init(task);
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            });
        }
    };
})();