/**
 * Created by SCR on 2017/7/19.
 */
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

var Path = require('path');
var fs = require('fs');

// 导出的是一个构造函数
module.exports = function (task) {
    return (function () {
        // private
        var __task = null;
        var __solution = null;

        if(task){
            __task = task;
        }

        var __centerHost = null;

        const DataState = {
            ready: 'READY',
            pending: 'PENDING',
            received: 'RECEIVED',
            failed: 'FAILED'
        };

        const TaskState = {
            configured: 'CONFIGURED',
            collapsed: 'COLLAPSED',
            end: 'END',
            finished: 'FINISHED',
            running: 'RUNNING',
            distributing: 'DISTRIBUTING'
        };

        const MSState = {
            ready: 'READY',
            running: 'RUNNING',
            collapsed: 'COLLAPSED',
            finished: 'FINISHED'
        };

        var __updateTask = function (cb) {
            AggreTaskModel.update(__task,function (err, rst) {
                if(err){
                    return cb(err);
                }
                else {
                    return cb(null,rst)
                }
            })
        };

        var __updateTaskState = function (state,cb) {
            __task.taskState = state;
            __updateTask(function (err, rst) {
                if(err){
                    return cb(err);
                }
                else {
                    return cb(null,rst);
                }
            });
        };

        var __updateDataState = function (gdid, state, cb) {
            var dataList = __task.taskCfg.dataList;
            for(let i=0;i<dataList.length;i++){
                let data = dataList[i];
                if(data.gdid == gdid){
                    data.state = state;
                    break;
                }
            }
            __updateTask(function (err, rst) {
                if(err){
                    return cb(err);
                }
                else {
                    return cb(null,rst);
                }
            });
        };

        var __updateMSState = function (MSID, state, cb) {
            let MSStateList = __task.MSState;
            var hasFound = false;
            for(let i=0;i<MSStateList.length;i++){
                var msState = MSStateList[i];
                if(msState.MSID == MSID){
                    hasFound = true;
                    msState.state = state;
                    break;
                }
            }
            if(!hasFound){
                MSStateList.push({
                    MSID: MSID,
                    state: MSState.running
                });
            }
            if(state == MSState.running){
                __task.taskState = TaskState.running;
            }
            __updateTask(function (err, rst) {
                if(err){
                    return cb(err);
                }
                else {
                    return cb(null,rst);
                }
            });
        };

        var __getSolutionServiceByID = function (MSID, cb) {
            if(__solution){
                for(let i=0;i<__solution.solutionCfg.serviceList.length;i++){
                    var service = __solution.solutionCfg.serviceList[i];
                    if(service._id == MSID){
                        return cb(null,service);
                        break;
                    }
                }
            }
            return cb(null,null);
        };

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

        return {
            // 初始化 __task,__solution,__centerHost
            init: function (taskID, cb) {
                var self = this;
                if(taskID){
                    AggreTaskModel.getByOID(taskID,function (err, task) {
                        if(err){
                            return cb(err);
                        }
                        else {
                            __task = task;
                            var solutionID = task.taskCfg.solutionID;
                            AggreSolutionModel.getByOID(solutionID,function (err, solution) {
                                if(err){
                                    return cb(err);
                                }
                                else{
                                    __solution = solution;
                                    SysCtrl.getIP(function (err, ip) {
                                        if(err){
                                            return cb(err);
                                        }
                                        else {
                                            __centerHost = ip;
                                            return cb(null);
                                        }
                                    });
                                }
                            });
                        }
                    })
                }
            },

            // 测试私有变量
            console: function () {
                console.log(__task._id);
            },

            // 分发数据坐标，实际数据要计算节点根据这个坐标去请求
            // 返回一个数组，[{error:Object}]
            distributeDataListPosition: function (cb) {
                var self = this;
                var distributeRst = [];
                var dataList = __task.taskCfg.dataList;
                var count = 0;
                var taskID = __task._id;
                __updateTaskState(TaskState.distributing,function (err, rst) {
                    if(err){
                        //
                    }
                    else{
                        for(let i=0;i<dataList.length;i++){
                            if(dataList[i].state == DataState.ready){
                                distributeRst.push({error:null});
                                self.emitDataPosition(taskID, dataList[i],function (i) {
                                    count++;
                                    return function (err) {
                                        if(err){
                                            distributeRst[i].error = err;
                                        }
                                        else{
                                            distributeRst[i].error = null;
                                        }
                                        if(count == 0){
                                            return cb(distributeRst);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            },

            // 分发数据坐标，更新数据状态
            emitDataPosition: function (taskID, taskData, cb) {
                if(taskData.state == DataState.ready){
                    var url = 'http://' + taskData.host + ':' + taskData.port + '/aggregation/onReceivedDataLocation';
                    var form = {
                        taskID: taskID,
                        gdid: taskData.gdid,
                        host: taskData.host,
                        port: taskData.port,
                        centerHost: __centerHost,
                        centerPort: setting.port
                    };
                    RmtReqCtrl.postByServer(url,form,function (err, res) {
                        if(err){
                            return cb(err);
                        }
                        else{
                            __updateDataState(taskData.gdid,DataState.pending,function (err, rst) {
                                if(err){
                                    return cb(err);
                                }
                                else{
                                    taskData.state = DataState.pending;
                                    __updateTask(function (err, rst) {
                                        if(err){
                                            taskData.state = DataState.ready;
                                            return cb(err);
                                        }
                                        else{
                                            return cb(null);
                                        }
                                    })
                                }
                            });
                        }
                    })
                }
            },

            // 拿到数据坐标，下载数据并添加到数据库中
            onReceivedDataLocation: function (dataLocation) {
                var self = this;
                var url = 'http://' + dataLocation.host + ':' + dataLocation.port + '/geodata/detail/' + dataLocation.gdid;
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
                    .then(function (gd) {
                        return new Promise(function (resolve, reject) {
                            if(gd.gd_type == 'FILE'){
                                var path = Path.join(__dirname,'../../geo_data/' + dataLocation.gdid);
                                fs.writeFile(path,gd.gd_value,function (err) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    else{
                                        gd.gd_value = dataLocation.gdid + '.xml';
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
                    .then(function () {
                        // 添加过数据后的处理
                        let replyData = {
                            taskID: dataLocation.taskID,
                            gdid: dataLocation.gdid,
                            err: null
                        };
                        self.emitDataDownloaded(replyData, dataLocation.centerHost, dataLocation.centerPort);
                    })
                    .catch(function (err) {
                        console.log(err);
                        let replyData = {
                            taskID: dataLocation.taskID,
                            gdid: dataLocation.gdid,
                            err: err
                        };
                        self.emitDataDownloaded(replyData, dataLocation.centerHost, dataLocation.centerPort);
                    })
            },

            // 下载完数据后回复消息
            emitDataDownloaded: function (replyData, centerHost, centerPort) {
                var url = 'http://' + centerHost + ':' + centerPort + '/aggregation/onReceivedDataDownloaded';
                RmtReqCtrl.postByServer(url,replyData,function (err, res) {
                    if(err){
                        // TODO 重新发送请求，当请求超过三次后放弃
                    }
                    else {

                    }
                })
            },

            // update data state
            onReceivedDataDownloaded: function (replyData, cb) {
                var self = this;
                var state = null;
                if(!replyData.err){
                    state = DataState.received;
                }
                else{
                    state = DataState.failed;
                }
                __updateDataState(replyData.gdid, state,function (err,rst) {
                    if(err){
                        return cb(err);
                    }
                    else {
                        self.checkMSState(replyData.taskID,replyData.gdid);
                        return cb(null,rst);
                    }
                });
            },

            // 先暂时不管多state的情况，只有所有state的数据准备好了才能运行
            checkMSState: function (taskID,gdid) {
                var self = this;
                var MSinsID = null;     // 一个ms可能会有多个实例
                var dataList = __task.taskCfg.dataList;
                for(let i=0;i<dataList.length;i++){
                    if(dataList[i].gdid == gdid){
                        MSinsID = dataList[i].MSID;
                        break;
                    }
                }
                if(MSinsID){
                    let msEvents = [];
                    for(let i=0;i<dataList.length;i++){
                        if(dataList[i].MSID == MSinsID){
                            msEvents.push(dataList[i]);
                        }
                    }
                    __getSolutionServiceByID(MSinsID,function (err, service) {
                        if(err){
                            // TODO 多段时间重新尝试
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
                                            inputData[i].DataId = msEvents[j].gdid;
                                            isDataReady = true;
                                            break;
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
                                self.emitMSReady(taskID,MSinsID,inputData,outputData);
                            }
                        }
                    });
                }
                else{

                }
            },

            emitMSReady: function (taskID,MSinsID,inputData,outputData) {
                __getSolutionServiceByID(MSinsID,function (err, service) {
                    if(err){
                        // TODO 与前台通信
                    }
                    else{
                        var host = service.host;
                        var port = service.port;
                        var url = 'http://' + host + ':' + port + '/aggregation/onReceivedMSReady';
                        var form = {
                            msid: service.MS._id,
                            inputData: inputData,
                            outputData: outputData,
                            centerHost: __centerHost,
                            centerPort: setting.port,
                            taskID: taskID,
                            MSinsID: MSinsID
                        };
                        RmtReqCtrl.postByServer(url,form,function (err, res) {
                            if(err){
                                //
                            }
                            else{
                                if(!res.error){
                                    __updateMSState(MSinsID,MSState.running,function (err,rst) {
                                        if(err){
                                            //
                                        }
                                        else{

                                        }
                                    })
                                }
                                else{
                                    __updateTaskState(TaskState.collapsed,function (err, rst) {
                                        if(err){

                                        }
                                        else{

                                        }
                                    })
                                }
                            }
                        })
                    }
                });
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
                        return cb(err);
                    }
                    else{
                        return cb(null,rst);
                    }
                })
            },

            // 更新MSState TaskState 并重新检查数据准备状态
            onReceivedMSFinished: function (finishedInfo,cb) {
                var task = __task;
                var self = this;
                // __updateMSState(finishedInfo.MSinsID,finishedInfo.MSState,function (err, rst) {
                //     if(err){
                //         return cb(err);
                //     }
                //     else {
                for(let i =0;i<finishedInfo.outputData.length;i++){
                    var output = finishedInfo.outputData[i];
                    __task.taskCfg.dataList.push({
                        host: finishedInfo.host,
                        port: finishedInfo.port,
                        state: DataState.ready,
                        eventName: output.Event,
                        stateID: output.StateId,
                        MSID: finishedInfo.MSinsID,
                        gdid: output.DataId
                    });
                }
                self.distributeDataListPosition(function (err, rst) {
                    if(err){
                        return cb(err);
                    }
                    else {
                        return cb(null,rst);
                    }
                });
                //     }
                // });
            },

            // TODO data service task state 更新时通知前台
            socket2Front: function () {

            }

        };
    })();

};