/**
 * Created by Franklin on 2016/7/25.
 * model for ModelInstance
 */
var ModelInstance = require('./modelInstance');

function ModelInsCollection() {
    this.ModelInsArr = [];
}

module.exports = ModelInsCollection;

//添加新模型运行实例
ModelInsCollection.prototype.addIns = function (mis)
{
    this.ModelInsArr.push(mis);
    return this.ModelInsArr.length - 1;
}

//根据GUID删除模型运行实例
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

//得到所有模型
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

//根据Socket删除模型运行实例
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

//根据GUID查询运行实例
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

//根据Socket查询运行实例
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

//根据序列查询运行实例
ModelInsCollection.prototype.getByIndex = function (index) {
    if(index > this.ModelInsArr.length - 1)
    {
        return -1;
    }
    return this.ModelInsArr[index];
}

//判断一个Socket通信是否存在
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

//绑定ms属性
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

//绑定socket属性
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

//根据Socket更改状态
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

//根据GUID更改状态
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

//杀死某个模型程序
ModelInsCollection.prototype.kill = function(guid){
    for(var i = 0 ; i < this.ModelInsArr.length; i++)
    {
        if(this.ModelInsArr[i].guid == guid)
        {
            this.ModelInsArr[i].socket.write('kill');
            return 1;
        }
    }
    return -1;
}