/**
 * Created by Franklin on 16-5-30.
 * Socket for Model Container
 */
var net = require('net');

var setting = require('../setting');
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var GeoDataCtrl = require('../control/geoDataControl');
var NoticeCtrl = require('../control/noticeCtrl');

function SocketTrans(app)
{
    var server = net.createServer(function(socket) {

        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        // 为这个socket实例添加一个"data"事件处理函数
        socket.on('data', function(data) {
            console.log('RECEIVED DATA FROM ' + socket.remoteAddress + ': ' + data + '\n');
            var cmds = data.toString();
            cmds = cmds.split('[\t\t\t]');
            //事件分支
            if(cmds[1] == 'enter')
            {
                if(app.modelInsColl.bindSocket(cmds[0], socket) > 0)
                {
                    socket.write('entered');
                    console.log(cmds[0] + ' -- enter');
                    app.modelInsColl.changeStateBySocket(socket, 'MC_ENTER');
                }
            }
            else if(cmds[1] == 'request')
            {
                ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        app.modelInsColl.changeStateBySocket(socket, 'MC_REQUEST');
                        console.log(cmds[0] + ' -- request');
                        for(var i = 0; i < msr.msr_input.length; i++)
                        {
                            if(msr.msr_input[i].Event == 'LOADDATASET')
                            {
                                GeoDataCtrl.getByKey(msr.msr_input[i].DataId, function (err, gd) {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(gd.gd_type == 'FILE')
                                        {
                                            var msg = 'dataReady[\t\t\t]FILE[\t\t\t]' + __dirname + '\\..\\geo_data\\' + gd.gd_value;
                                            console.log('REQUEST SEND MSG : ' + msg);
                                            socket.write(msg);
                                        }
                                        else if(gd.gd_type == 'STREAM')
                                        {
                                            socket.write('dataReady[\t\t\t]STREAM[\t\t\t]' + gd.gd_value);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
            else if(cmds[1] == 'checkdata')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKDATA');
                console.log(cmds[0] + ' -- checkdata');
                socket.write('oncheckdata');
            }
            else if(cmds[1] == 'calculate')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CALCULATE');
                console.log(cmds[0] + ' -- calculate');
                socket.write('oncalculate');
            }
            else if(cmds[1] == 'checkres')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKRES');
                console.log(cmds[0] + ' -- checkres');
                if(cmds.length < 3)
                {
                    console.log('CMD Error ! ');
                }
                else
                {
                    //判断长度
                    var length = parseInt(cmds[2]);

                    ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            for(var i = 0; i < msr.msr_output.length; i++)
                            {
                                if(msr.msr_output[i].Event == 'RETURNDATASET')
                                {
                                    if(length > 1024)
                                    {
                                        var gd = {
                                            gd_id : msr.msr_output[i].DataId,
                                            gd_rstate : 'RUNSTATE',
                                            gd_io : 'OUTPUT',
                                            gd_type : 'FILE',
                                            gd_value : msr.msr_output[i].DataId + '.xml'
                                        };
                                        GeoDataCtrl.addData(gd, function (err, res) {
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                socket.write('oncheckres[\t\t\t]FILE[\t\t\t]' + __dirname + '\\..\\geo_data\\' + gd.gd_id + '.xml');
                                            }
                                        });
                                    }
                                    else
                                    {
                                        var gd = {
                                            gd_id : msr.msr_output[i].DataId,
                                            gd_rstate : 'RUNSTATE',
                                            gd_io : 'OUTPUT',
                                            gd_type : 'STREAM',
                                            gd_value : ''
                                        };
                                        GeoDataCtrl.addData(gd, function (err, res) {
                                            if(err)
                                            {
                                                console.log(err);
                                            }
                                            else
                                            {
                                                socket.write('oncheckres[\t\t\t]STREAM');
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    });
                }
            }
            else if(cmds[1] == 'response')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_RESPONSE');
                console.log(cmds[0] + ' -- response');
                if(cmds[2] == 'STREAM')
                {
                    ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            for(var i = 0; i < msr.msr_output.length; i++)
                            {
                                if(msr.msr_output[i].Event == 'RETURNDATASET')
                                {
                                    GeoDataCtrl.getByKey(msr.msr_output[i].DataId, function (err, item) {
                                        if(err)
                                        {
                                            console.log(err);
                                        }
                                        else
                                        {
                                            item.gd_value = cmds[3];
                                            GeoDataCtrl.update(item, function (err, gd) {
                                               if(err)
                                               {
                                                   console.log(err);
                                               }
                                               else
                                               {
                                                   //发送收到消息
                                                   socket.write('dataRecv');
                                               }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
                else if(cmds[2] == 'FILE')
                {
                    //检测文件是否存在

                    //发送收到消息
                    socket.write('dataRecv');
                }
            }
            else if(cmds[1] == 'exit')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_EXIT');
                console.log(cmds[0] + ' -- exit');
                socket.write('bye');
            }
        });

        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            mi = app.modelInsColl.getBySocekt(socket);
            ModelSerRunCtrl.getByGUID(mi.guid, function (err,msr) {
                //移除该实例
                app.modelInsColl.removeBySocekt(socket);
                if(err)
                {
                    return console.log('Error in removing modelIns and finding MSR');
                }
                var date_now = new Date();
                var data_begin = new Date(msr.msr_date);
                var time_span = date_now.getTime() - data_begin.getTime();
                time_span = time_span/1000;
                msr.msr_time = time_span;
                ModelSerRunCtrl.update(msr, function (err, data) {
                    if(err)
                    {
                        return console.log('Error in removing modelIns and updating MSR');
                    }
                    //通知消息数据
                    var noticeData = {
                        time:new Date(),
                        ms_name:ms.ms_model.m_name,
                        notice:'模型服务已开启！',
                        type:'startServer',
                        hasRead:0
                    };
                    NoticeCtrl.addNotice(noticeData,function (err, data) {

                    });
                });
            });
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