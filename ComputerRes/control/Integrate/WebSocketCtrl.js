var io = require('socket.io');

var webSocketCtrl = function (server) {
    io = io(server);
    var taskServer = io.of('/integrate/task');
    app.websocket = {
        io: io,
        taskServer: taskServer
    };
    taskServer.on('connection',function (socket) {
        console.log('------------------------------a new client connected------------------------------');

        socket.on('dispatch room',function (taskID) {
            socket.join(taskID);
        });

        socket.on('message',function (msg) {
            console.log(msg);
        });

        socket.on('disconnect',function () {
            console.log('------------------------------a client disconnected------------------------------');
        });
    });
};

webSocketCtrl.emit = function (room, eventName, emitMsg, cb) {
    app.websocket.taskServer.in(room).emit(eventName,emitMsg);
};

module.exports = webSocketCtrl;