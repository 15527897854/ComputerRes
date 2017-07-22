// 用于管理内存中的task instance
var ObjectId = require('mongodb').ObjectID;

var TaskInstanceManager = function () {

};

// TaskInstance 的构造函数，与model/aggreTask 相同
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

// 不用此函数就行，如果添加时是通过浅拷贝添加的话，是引用复制，共享内存的
TaskInstanceManager.update = function (taskInstance) {
    for(let i=0;i<app.taskInstanceColl.length;i++){
        if(app.taskInstanceColl[i]._id == _id){
            app.taskInstanceColl[i] = taskInstance;
            return true;
        }
    }
    return false;
};

module.exports = TaskInstanceManager;