/**
 * Created by Franklin on 16-5-30.
 * Socket for Model Container
 */
var net = require('net');

var setting = require('../setting');
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var GeoDataCtrl = require('../control/geoDataControl');
var NoticeCtrl = require('../control/noticeCtrl');
var ModelInsCtrl = require('../control/ModelInsCtrl');

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
            if(cmds.length < 2)
            {
                console.log('Can not parse cmd : ' + data);
                return;
            }
            //事件分支
            if(cmds[1] == 'enter')
            {
                ModelInsCtrl.enter(app, cmds, socket);
            }
            else if(cmds[1] == 'request')
            {
                ModelInsCtrl.request(app, cmds, socket);
            }
            else if(cmds[1] == 'checkdata')
            {
                ModelInsCtrl.checkdata(app, cmds, socket);
            }
            else if(cmds[1] == 'calculate')
            {
                ModelInsCtrl.calculate(app, cmds, socket);
            }
            else if(cmds[1] == 'checkres')
            {
                ModelInsCtrl.checkres(app, cmds, socket);
            }
            else if(cmds[1] == 'response')
            {
                ModelInsCtrl.response(app, cmds, socket);
            }
            else if(cmds[1] == 'exit')
            {
                ModelInsCtrl.exit(app, cmds, socket);
            }
        });

        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            if(!setting.debug)
            {
                mi = app.modelInsColl.getBySocekt(socket);
                ModelSerRunCtrl.getByGUID(mi.guid, function (err,msr) {
                    var mis = app.modelInsColl.getBySocekt(socket);
                    var finished = false;
                    if(mis.state == 'MC_EXIT' || mis.state == 'MC_RESPONSE')
                    {
                        finished = true;
                    }

                    //移除该实例
                    app.modelInsColl.removeBySocekt(socket);
                    if(err)
                    {
                        return console.log('Error in removing modelIns and finding MSR');
                    }
                    if(msr == null)
                    {
                        return ;
                    }
                    var date_now = new Date();
                    //通知消息数据
                    var noticeData = {
                        time:new Date(),
                        ms_name:msr.msr_ms.m_name,
                        notice:'模型服务停止运行！',
                        type:'stopRun',
                        hasRead:0
                    };
                    //console.log("++++++++++++++++++++++++++++++run stopped++++++++++++++++++++++++++++++++++");
                    NoticeCtrl.addNotice(noticeData,function (err, data) {
                        if(err){
                            return console.log('Error in addNotice');
                        }
                        if(msr != null)
                        {
                            var data_begin = new Date(msr.msr_date);
                            var time_span = date_now.getTime() - data_begin.getTime();
                            time_span = time_span / 1000;
                            msr.msr_time = time_span;
                            if(finished)
                            {
                                msr.msr_status = 1;
                            }
                            else
                            {
                                msr.msr_status = -1;
                            }
                            ModelSerRunCtrl.update(msr, function (err2, data) {
                                if(err2)
                                {
                                    return console.log('Error in removing modelIns and updating MSR');
                                }
                            });
                        }
                    });
                });
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
