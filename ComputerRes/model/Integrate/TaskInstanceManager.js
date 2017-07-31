// 用于管理内存中的task instance
// 同时将更新保存到数据库中
// 要维持实例和db中的内容相同，更改后要保存到数据库中

var ObjectId = require('mongodb').ObjectID;
var AggreTaskModal = require('./aggreTask');
var AggreSolutionModal = require('./aggreSolution');

var TaskInstanceManager = function () {

};

// TaskInstance 的构造函数，与model/aggreTask 相同
// 此处把solution也放进来了，为了调用端异步流程的方便管理
TaskInstanceManager.TaskInstance = function (taskInstance) {
    if(taskInstance){
        for(var key in taskInstance){
            this[key] = taskInstance[key];
        }
        if(!taskInstance._id){
            this._id = new ObjectId();
        }
    }
    else{
        this._id = new ObjectId();
        this.taskCfg = {};
        this.taskInfo = {};
        this.taskState = {};
        this.MSState = [];
        this.time = (new Date()).getTime();
        this.solution = {};
    }
};

TaskInstanceManager.get = function (_id) {
    for(let i=0;i<app.taskInstanceColl.length;i++){
        if(app.taskInstanceColl[i]._id == _id){
            return app.taskInstanceColl[i];
        }
    }
    return null;
};

TaskInstanceManager.delete = function (_id) {
    for(let i=0;i<app.taskInstanceColl.length;i++){
        if(app.taskInstanceColl[i]._id == _id){
            app.taskInstanceColl.splice(i,1);
            return true;
        }
    }
    return false;
};

// 浅拷贝，共享内存
TaskInstanceManager.add = function (taskInstance) {
    app.taskInstanceColl.push(taskInstance);
};

// 同时更新 instance 和 db
TaskInstanceManager.update = function (taskInstance, cb) {
    var hasFinded = false;
    for(let i=0;i<app.taskInstanceColl.length;i++){
        if(app.taskInstanceColl[i]._id == taskInstance._id){
            hasFinded = true;
            app.taskInstanceColl[i] = taskInstance;
            break;
        }
    }
    if(hasFinded){
        AggreTaskModal.update(taskInstance,function (err, rst) {
            if(err){
                return cb(err);
            }
            else{
                return cb(null,rst);
            }
        });
    }
};

TaskInstanceManager.save = function (_id, cb) {
    var taskInstance = TaskInstanceManager.get(_id);
    AggreTaskModal.save(taskInstance,function (err, rst) {
        if(err){
            return cb(err);
        }
        else {
            return cb(rst);
        }
    })
};

// 调用情景：点击开始运行、某一个MS崩溃掉、运行结束
TaskInstanceManager.updateTaskState = function (_id, state, cb) {
    var task = TaskInstanceManager.get(_id);
    if(task){
        task.taskState = state;
        AggreTaskModal.update(task,function (err, rst) {
            if(err){
                return cb(err);
            }
            else{
                return cb(null,rst);
            }
        });
    }
    else{
        return cb('Can\'t find this task by id');
    }
};

// 调用情景：开始分发、分发成功、分发失败
TaskInstanceManager.updateDataListState = function (_id, dispatchRst, cb) {
    var task = TaskInstanceManager.get(_id);
    if(task){
        for(let i=0;i<dispatchRst.length;i++){
            for(let j=0;j<task.taskCfg.dataList.length;j++){
                var data = task.taskCfg.dataList[j];
                if(data.gdid == dispatchRst[i].gdid){
                    if(dispatchRst[i].error){
                        data.state = DataState.failed;
                    }
                    else{
                        if(data.state == DataState.ready)
                            data.state = DataState.pending;
                    }
                    break;
                }
            }
        }
        AggreTaskModal.update(task,function (err, rst) {
            if(err){
                return cb(err);
            }
            else{
                return cb(null,rst);
            }
        });
    }
    else{
        return cb('Can\'t find this task by id');
    }
};

// 调用情景：开始分发、分发成功、分发失败
TaskInstanceManager.updateDataState = function (_id, gdid, state, cb) {
    var task = TaskInstanceManager.get(_id);
    if(task){
        for(let j=0;j<task.taskCfg.dataList.length;j++){
            var data = task.taskCfg.dataList[j];
            if(data.gdid == gdid && (data.isMid != null && data.isMid != true)){
                data.state = state;
                break;
            }
        }
        AggreTaskModal.update(task,function (err, rst) {
            if(err){
                return cb(err);
            }
            else{
                return cb(null,rst);
            }
        });
    }
    else{
        return cb('Can\'t find this task by id');
    }
};

// 调用情景：数据分发完成、取消断点、运行崩溃、运行结束
TaskInstanceManager.updateMSState = function (_id, MSID, state, cb) {
    var task = TaskInstanceManager.get(_id);
    let MSStateList = task.MSState;
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
            state: state
        });
    }
    if(state == MSState.running){
        task.taskState = TaskState.running;
    }
    AggreTaskModal.update(task,function (err, rst) {
        if(err){
            return cb(err);
        }
        else{
            return cb(null,rst);
        }
    });
};

TaskInstanceManager.getServiceByID = function (_id, MSID, cb) {
    var task = TaskInstanceManager.get(_id);
    var solutionID = task.taskCfg.solutionID;
    AggreSolutionModal.getByOID(solutionID,function (err, solution) {
        if(err){
            return cb(err);
        }
        else{
            for(let i=0;i<solution.solutionCfg.serviceList.length;i++){
                var service = solution.solutionCfg.serviceList[i];
                if(service._id == MSID){
                    return cb(null,service);
                }
            }
            return cb(null,null);
        }
    })
};

TaskInstanceManager.getSolution = function (_id, cb) {
    var task = TaskInstanceManager.get(_id);
    var solutionID = task.taskCfg.solutionID;
    AggreSolutionModal.getByOID(solutionID,function (err, solution) {
        if(err){
            return cb(err);
        }
        else{
            return cb(null,solution);
        }
    })
};

module.exports = TaskInstanceManager;