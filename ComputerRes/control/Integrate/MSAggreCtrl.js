var setting = require('../../setting');
var Promise = require('bluebird');
var remoteReqCtrl = require('../remoteReqControl');
var modelSerCtrl = require('../modelSerControl');
var modelBase = require('../../model/modelBase');
var SysCtrl = require('../sysControl');
var ObjectID = require('mongodb').ObjectID;
var AggreTaskModel = require('../../model/Integrate/aggreTask');
var AggreSolutionModel = require('../../model/Integrate/aggreSolution');
var ControlBase = require('../controlBase');
var CommonMethod = require('../../utils/commonMethod');
var DataDriver = require('./DataDriver');
var TaskInstanceManager = require('../../model/Integrate/TaskInstanceManager');
var WebSocketCtrl = require('./WebSocketCtrl');

var xmlBuilder = require('xml2js').Builder();

var MSAggreCtrl = (function () {
    //获取所有门户的ms
    var __getCloudMS = function(cb){
        remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetClassServlet', function(err, categories){
            if(err){
                return cb(err);
            }
            var rst = [];
            var getCategoryById = function(id){
                for(var i = 0; i < categories.length; i++){
                    if(categories[i].id == id){
                        return i;
                    }
                }
                return -1;
            };
            var addLeafCate = function (index) {
                if(categories[index].children.length){
                    categories[index].child_node = [];
                    for(var j=0;j<categories[index].children.length;j++){
                        var childIndex = getCategoryById(categories[index].children[j]);
                        addLeafCate(childIndex);
                        categories[index].child_node.push(categories[childIndex])
                    }
                }
                else{

                }
                categories[index].hasAdded = true;
            };
            for(var i = 0; i < categories.length; i++) {
                if (categories[i].hasAdded == undefined) {
                    addLeafCate(i);
                    rst.push(categories[i]);
                }
            }
            return cb(null, rst);
        });
    };
    //获取所有子节点的ms
    var __getChildMS = function (cb) {

    };
    //获取本机所有的ms
    var __getLocalMS = function (cb) {
        new Promise((resolve,reject)=>{
            modelSerCtrl.getByWhere({ms_status:1,ms_limited:0},function (err, mss) {
                if(err) return reject(err);
                return resolve(mss);
            });
        }).then((mss)=>{
             SysCtrl.getIP(function (err, ip) {
                if(err) cb(err);
                for(var i=0;i<mss.length;i++){
                    mss[i].host = ip;
                    mss[i].port = setting.port;
                }
                cb(null,mss);
            });
        }).catch((err)=>{
            return cb(err);
        })
    };

    //将数据库中存储的ms转换为集成时需要的service结构,包括MDL、host、port
    var __getSADLService = function (ms, cb) {
        var url = 'http://'+ms.host+':'+ms.port+'/aggregation/SADL/getMSDetail';
        var form = {
            _id : ms._id
        };
        remoteReqCtrl.getByServer(url,form,function (err, res) {
            // res:{
            //     MS:Object,
            //     MDL:Object
            // }
            if(err) return cb(err);
            res = JSON.parse(res);
            if(res.error) return cb(res.error);
            var MDL = res.MSDetail.MDL;
            var strMDL = JSON.stringify(MDL);
            strMDL = strMDL.replace(/\"\$\"/g,'"_$"');
            MDL = JSON.parse(strMDL);

            res.MSDetail.MDL = MDL;
            res.MSDetail.host = ms.host;
            res.MSDetail.port = ms.port;
            // res.MSDetail._id = res.MSDetail.MS._id;
            return cb(null,res.MSDetail);
        })
    };

    return {
        //获取所有可用的ms，并在ms中增加两个字段：host，port
        getAllMS : function (cb) {
            __getLocalMS(function (err,mss) {
                if(err){
                    return cb(err);
                }
                else{
                    return cb(null,mss);
                }
            })
        },

        //获取门户上所有可用的ms，带有两个字段：host，port
        getPortalMS:function () {

        },

        //获取参与聚合任务的所有ms详细信息，包括states信息
        getSADLServices:function (mss,cb) {
            var SADLServices = [];
            var count = 0;
            var pending = function () {
                count++;
                return function (err, SADLService) {
                    count--;
                    if(err){
                        SADLServices.push({error:err});
                    }
                    else{
                        SADLServices.push({error:null,SADLService:SADLService});
                    }
                    if(count == 0){
                        return cb(JSON.stringify(SADLServices));
                    }
                }
            };
            for(var i=0;i<mss.length;i++){
                __getSADLService(mss[i],pending());
            }
        },

        // region solution ctrl
        saveSolution: function (solution, isSaveAs, cb) {
            solution.time = new Date().getTime();
            var solutionID = solution._id;
            var tag = null;
            if(isSaveAs == 'true'){
                if(solutionID && solutionID != undefined){
                    delete solution._id;
                }
                tag = 'save';
            }
            else if(solutionID && solutionID != undefined){
                tag = 'update';
            }
            else{
                tag = 'save';
            }
            if(tag == 'update'){
                AggreSolutionModel.update(solution,function (err,rst) {
                    if(err){
                        return cb(err);
                    }
                    else{
                        return cb(null,solutionID);
                    }
                })
            }
            else{
                AggreSolutionModel.save(solution,function (err, rst) {
                    if(err){
                        return cb(err);
                    }
                    else {
                        return cb(null,rst._doc._id);
                    }
                })
            }
        },

        getSolutionsSegmentByID: function (cb) {
            var where = {};
            AggreSolutionModel.getByWhere(where,function (err,solutions) {
                if(err){
                    return cb(err);
                }
                else {
                    var solutionsSegment = [];
                    for(var i=0;i<solutions.length;i++){
                        var timeStr = CommonMethod.timestamp2String(solutions[i].time);
                        solutionsSegment.push({
                            _id: solutions[i]._id,
                            time: timeStr,
                            name: solutions[i].solutionInfo.solutionName,
                            desc: solutions[i].solutionInfo.solutionDesc,
                            author: solutions[i].solutionInfo.solutionAuthor
                        });
                    }
                    return cb(null,solutionsSegment);
                }
            })
        },

        delSolutionByID: function (_id, cb) {
            AggreSolutionModel.delete(_id,function (err, rst) {
                if(err){
                    return cb(err);
                }
                else{
                    // TODO 后续操作，比如kill掉各个模型

                    return cb(null,rst);
                }
            })
        },

        // endregion

        // region task ctrl

        // save or update task
        saveTask: function (task, isSaveAs, cb) {
            new Promise(function (resolve, reject) {
                SysCtrl.getIP(function (err, ip) {
                    if(err){
                        return reject(err);
                    }
                    else {
                        return resolve(ip);
                    }
                })
            })
                .then(function (ip) {
                    // TODO data service
                    for(let i=0;i<task.taskCfg.dataList.length;i++){
                        if(task.taskCfg.dataList[i].host == undefined || !task.taskCfg.dataList[i].host){
                            task.taskCfg.dataList[i].host = ip;
                            task.taskCfg.dataList[i].port = setting.port;
                        }
                    }
                    task.time = new Date().getTime();
                    var taskID = task._id;
                    var tag = null;
                    if(isSaveAs == 'true'){
                        if(taskID && taskID != undefined){
                            delete task._id;
                        }
                        tag = 'save';
                    }
                    else if(taskID && taskID != undefined){
                        tag = 'update';
                    }
                    else{
                        tag = 'save';
                    }

                    if(tag == 'update'){
                        AggreTaskModel.getByOID(taskID,function (err, oldTask) {
                            if(err){
                                return cb(err);
                            }
                            else{
                                // 更新datalist和state
                                // datalist只更新 __isInput的
                                // state 只更新 unready, pause
                                // 其他的由后台来维护
                                oldTask.taskInfo = task.taskInfo;
                                oldTask.time = task.time;
                                var oldDataList = oldTask.taskCfg.dataList;
                                var newDataList = task.taskCfg.dataList;
                                for(let j=0;j<newDataList.length;j++){
                                    var hasInserted = false;
                                    for(let i=0;i<oldDataList.length;i++){
                                        if(newDataList[j].gdid == oldDataList[i].gdid){
                                            hasInserted = true;
                                            break;
                                        }
                                    }
                                    if(!hasInserted){
                                        oldDataList.push(newDataList[j])
                                    }
                                }

                                var stateFailedList = [];
                                var oldMSState = oldTask.MSState;
                                var newMSState = task.MSState;
                                for(let i=0;i<newMSState.length;i++){
                                    if(newMSState[i].state == 'PAUSE' || newMSState[i].state == 'UNREADY'){
                                        for(let j=0;j<oldMSState.length;j++){
                                            if(newMSState[i].MSID == oldMSState[j].MSID){
                                                if(oldMSState[j].state == 'PAUSE' || oldMSState[j].state == 'UNREADY'){
                                                    oldMSState[j].state = newMSState[i].state;
                                                    break;
                                                }
                                                else{
                                                    stateFailedList.push({
                                                        MSID: oldMSState[j].MSID,
                                                        state: oldMSState[j].state
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }

                                AggreTaskModel.update(oldTask,function (err, rst) {
                                    if(err){
                                        return cb(err);
                                    }
                                    else{
                                        return cb(null,taskID,stateFailedList);
                                    }
                                })
                            }
                        });
                    }
                    else{
                        AggreTaskModel.save(task,function (err, rst) {
                            if(err){
                                return cb(err);
                            }
                            else {
                                return cb(null,rst._doc._id);
                            }
                        })
                    }
                });

        },

        getTasksSegmentByID: function (cb) {
            var where = {};
            AggreTaskModel.getByWhere(where,function (err,tasks) {
                if(err){
                    return cb(err);
                }
                else {
                    var tasksSegment = new Array(tasks.length,null);
                    var count = 0;
                    var pending = function (i) {
                        count++;
                        return function (err,solution) {
                            if(err){
                                // TODO 这种情况最好不要因为一个出错导致所有查询结果都不返回，有空再改吧
                                return cb(err);
                            }
                            else {
                                count--;
                                var taskInfo = tasks[i].taskInfo;
                                taskInfo.time = CommonMethod.timestamp2String(tasks[i].time);
                                if(solution){
                                    var solutionInfo = solution.solutionInfo;
                                    solutionInfo.time = CommonMethod.timestamp2String(solution.time);
                                    // 这样写排序不会出错
                                    tasksSegment[i] = {
                                        _id: tasks[i]._id,
                                        taskInfo: taskInfo,
                                        solutionInfo: solutionInfo
                                    };
                                }
                                else{
                                    tasksSegment[i] = {
                                        _id:tasks[i]._id,
                                        taskInfo:taskInfo
                                    };
                                }
                                if(count == 0){
                                    return cb(null,tasksSegment);
                                }
                            }
                        }
                    };
                    for(let i=0;i<tasks.length;i++){
                        AggreSolutionModel.getByOID(tasks[i].taskCfg.solutionID,pending(i))
                    }
                }
            })
        },

        delTaskByID: function (_id, cb) {
            AggreTaskModel.delete(_id,function (err, rst) {
                if(err){
                    return cb(err);
                }
                else{
                    return cb(null,rst);
                }
            })
        },

        // return task and solution
        getTaskDetailByID: function (_id, cb) {
            AggreTaskModel.getByOID(_id,function (err, task) {
                if(err){
                    return cb(err);
                }
                else if(task) {
                    AggreSolutionModel.getByOID(task.taskCfg.solutionID,function (err, solution) {
                        if(err){
                            return cb(err);
                        }
                        else{
                            task.solutionDetail = solution;
                            return cb(null,task);
                        }
                    })
                }
                else {
                    return cb(null,null);
                }
            })
        },

        // TODO 运行前的检查
        runTask: function (task, cb) {
            var self = this;
            new Promise(function (resolve, reject) {
                self.saveTask(task, false, function (err, taskID) {
                    if(err){
                        return reject(err);
                    }
                    else {
                        AggreTaskModel.getByOID(taskID,function (err, task) {
                            if(err){
                                return reject(err);
                            }
                            else {
                                return resolve(task);
                            }
                        });
                    }
                })
            })
                .then(function (task) {
                    AggreSolutionModel.getByOID(task.taskCfg.solutionID, function (err, solution) {
                        if(err){
                            return cb(err);
                        }
                        else{
                            // 添加task instance
                            delete solution.layoutCfg;
                            task.solution = solution;
                            TaskInstanceManager.add(task);
                            // 更新task state，更新失败时将错误给前台
                            TaskInstanceManager.updateTaskState(task._id, 'RUNNING', function (err, rst) {
                                if(err){
                                    cb(err);
                                    return WebSocketCtrl.emit(_id, 'error', JSON.stringify({error:err}));
                                }
                                else{
                                    return cb(null,task._id);
                                }
                            });
                            // 遍历模型，分发数据，驱动运算
                            DataDriver.init(task);
                        }
                    });

                })
                .catch(function (err) {
                    console.log(err);
                    return cb(err);
                });
        },

        // 更改数据库和内存中的state
        breakpointAC: function (taskID, MSID, ac, cb) {
            var self = this;
            var oldState = null;
            var newState = null;
            if(ac == 'add'){
                oldState = 'UNREADY';
                newState = 'PAUSE';
            }
            else if(ac == 'remove'){
                oldState = 'PAUSE';
                newState = 'UNREADY';
            }
            AggreTaskModel.getByOID(taskID,function (err, task) {
                if(err){
                    return cb(err);
                }
                else{
                    var MSState = task.MSState;
                    var hasFound = false;
                    for(let i=0;i<MSState.length;i++){
                        if(MSState[i].MSID == MSID){
                            hasFound = true;
                            if(MSState[i].state == oldState){
                                MSState[i].state = newState;
                                AggreTaskModel.update(task,function (err, rst) {
                                    if(err){
                                        return cb(err);
                                    }
                                    else{
                                        var taskInstance = TaskInstanceManager.get(task._id);
                                        if(taskInstance != null){
                                            var msState = null;
                                            for(let i=0;i<taskInstance.MSState.length;i++){
                                                if(taskInstance.MSState[i].MSID == MSID){
                                                    msState = taskInstance.MSState[i].state;
                                                    if(msState == oldState){
                                                        msState.state = newState;
                                                        return cb(null,'success');
                                                    }
                                                    else{
                                                        return cb(null,'failed');
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        else{
                                            return cb(null, 'success');
                                        }
                                    }
                                });
                            }
                            else{
                                return cb(null, 'failed');
                            }
                            break;
                        }
                    }
                    if(hasFound == false){
                        return cb(null,'failed');
                    }
                }
            });
        },

        // endregion

        // region data ctrl
        getData: function (query, cb) {
            var taskID = query.taskID;
            var gdid = query.gdid;
            var msid = query.msid;
            var stateID = query.stateID;
            var eventName = query.eventName;
            AggreTaskModel.getByOID(taskID,function (err, task) {
                if (err) {
                    return cb(err);
                }
                else if (task) {
                    var data = null;
                    let dataList = task.taskCfg.dataList;
                    for(let i=0;i<dataList.length;i++){
                        if(dataList[i].MSID == msid && dataList[i].gdid == gdid && dataList[i].stateID == stateID && dataList[i].eventName == eventName){
                            data = dataList[i];
                            break;
                        }
                    }
                    if(data){
                        var rmtURL = 'http://' + data.host + ':' + data.port + '/geodata/' + data.gdid;
                        remoteReqCtrl.getByServer(rmtURL,null,function (err, res) {
                            if(err){
                                return cb(err);
                            }
                            else{
                                return cb(null,res);
                            }
                        })
                    }
                }
                else {
                    return cb(new Error('Can\'t find this task!'));
                }
            });
        }
        // endregion
    };
})();

module.exports = MSAggreCtrl;
