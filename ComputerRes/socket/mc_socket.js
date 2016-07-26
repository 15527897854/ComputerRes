/**
 * Created by Franklin on 16-5-30.
 * Socket for Model Container
 */
var net = require('net');
var setting = require('../setting');
var ModelInstance = require('../model/modelInstance');

function SocketTrans(app)
{
    var server = net.createServer(function(socket) {

        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        //将当前Socket压入数组
        app.modelIns.push(socket);

        // 为这个socket实例添加一个"data"事件处理函数
        socket.on('data', function(data) {
            console.log('DATA ' + socket.remoteAddress + ': ' + data);
        });

        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            //移除该实例
            for(var i = 0; i < app.modelIns.length; i++)
            {
                if(socket == app.modelIns[i])
                {
                    app.modelIns.splice(i, 1);
                }
            }
            console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
        });

        socket.on('error', function (msg) {
            console.log('ERROR: ' + msg);
        });

        socket.on('end', function () {
            console.log('SOCKET END !!! ');
        });
    }).listen(setting.socket.port, setting.socket.host);

    console.log('Socket listening on ' + setting.socket.host +':'+ setting.socket.port);
}

module.exports = SocketTrans;

SocketTrans.prototype.sendMsg = function (socket, msg) {
    socket.write(msg);
}