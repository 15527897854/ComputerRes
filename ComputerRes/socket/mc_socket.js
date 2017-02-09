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
            //console.log('-------------Data--------------\n' + data );
            var cmds = data.toString();
            cmds = cmds.split('[\t\t\t]');
            //事件分支
            if(cmds[1] == 'enter')
            {
                if(app.modelInsColl.bindSocket(cmds[0], socket) > 0)
                {
                    socket.write('entered');
                    console.log(cmds[0] + ' -- enter\n');
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
                        console.log(cmds[0] + ' -- request\n');
                        var msg = "dataReady";

                        var count = 0;
                        var gdcb = (function (index) {
                            count ++;
                            return function (err, item) {
                                count --;
                                if(!err)
                                {
                                    if(item.gd_type == "FILE")
                                    {
                                        msg += '[\t\t\t]' + msr.msr_input[index].StateId;
                                        msg += '[\t\t]' + msr.msr_input[index].Event;
                                        msg += '[\t\t]FILE[\t\t]' + __dirname + '/../geo_data/' +item.gd_value;
                                    }
                                    else if(item.gd_type == "STREAM")
                                    {
                                        msg += '[\t\t\t]' + msr.msr_input[index].StateId;
                                        msg += '[\t\t]' + msr.msr_input[index].Event;
                                        msg += '[\t\t]STREAM[\t\t]' + item.gd_value;
                                    }
                                }

                                if(count == 0)
                                {
                                    socket.write(msg);
                                }
                            }
                        });

                        for(var i = 0; i < msr.msr_input.length; i++)
                        {
                            GeoDataCtrl.getByKey(msr.msr_input[i].DataId, gdcb(i));
                        }
                    }
                });
            }
            else if(cmds[1] == 'checkdata')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKDATA');
                console.log(cmds[0] + ' -- checkdata\n');
                socket.write('oncheckdata');
            }
            else if(cmds[1] == 'calculate')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CALCULATE');
                console.log(cmds[0] + ' -- calculate\n');
                socket.write('oncalculate');
            }
            else if(cmds[1] == 'checkres')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKRES');
                console.log(cmds[0] + ' -- checkres\n');
                if(cmds.length < 3)
                {
                    console.log('CMD Error ! ');
                }
                else
                {
                    ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
                        if(err)
                        {
                            console.log('Error!');
                        }

                        var msg = 'oncheckres';
                        //判断长度
                        for(var i = 2; i < cmds.length; i++)
                        {
                            var detail = cmds[i].split('[\t\t]');
                            if(detail.length < 3)
                            {
                                return socket.write('kill');
                            }

                            var filegdcb = (function (index) {
                                return function (err, res) {
                                    count --;
                                    if (err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        msg += '[\t\t\t]' + msr.msr_output[index].StateId ;
                                        msg += '[\t\t]' + msr.msr_output[index].Event ;
                                        msg += '[\t\t]FILE[\t\t]' + __dirname + '/../geo_data/' + msr.msr_output[index].DataId + '.xml';

                                        if(count == 0)
                                        {
                                            socket.write(msg);
                                        }
                                    }
                                }
                            });

                            var streamgdcb = (function (index) {
                                return function (err, res) {
                                    count --;
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        msg += '[\t\t\t]' + msr.msr_output[index].StateId ;
                                        msg += '[\t\t]' + msr.msr_output[index].Event ;
                                        msg += '[\t\t]STREAM';

                                        if(count == 0)
                                        {
                                            socket.write(msg);
                                        }
                                    }
                                }
                            });

                            var count = 0;
                            for(var j = 0; j < msr.msr_output.length; j++)
                            {
                                count ++;
                                if(msr.msr_output[j].StateId == detail[0] && msr.msr_output[j].Event == detail[1])
                                {
                                    if(parseInt(detail[2]) < setting.data_size)
                                    {
                                        var gd = {
                                            gd_id : msr.msr_output[j].DataId,
                                            gd_rstate : msr.msr_output[j].StateId,
                                            gd_io : 'OUTPUT',
                                            gd_type : 'STREAM',
                                            gd_value : ''
                                        };
                                        GeoDataCtrl.addData(gd, streamgdcb(j));
                                    }
                                    else
                                    {
                                        var gd = {
                                            gd_id: msr.msr_output[j].DataId,
                                            gd_rstate: 'RUNSTATE',
                                            gd_io: 'OUTPUT',
                                            gd_type: 'FILE',
                                            gd_value: msr.msr_output[j].DataId + '.xml'
                                        };
                                        GeoDataCtrl.addData(gd, filegdcb(j));
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
                console.log(cmds[0] + ' -- response\n');

                if(cmds.length > 2)
                {
                    ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr)
                    {
                        if(err)
                        {
                            console.log(JSON.stringify(err));
                        }
                        else
                        {
                            var count = 0;
                            for(var k = 2; k < cmds.length; k++)
                            {
                                count ++;
                                var gdcb = (function (index) {
                                    return function (err, gd) {
                                        var gddtl = cmds[index].split('[\t\t]');
                                        gd.gd_value = gddtl[3];
                                        GeoDataCtrl.update(gd, function (err, res)
                                        {
                                            count --;
                                            if(count == 0)
                                            {
                                                socket.write('dataRecv');
                                            }

                                        });
                                    }
                                });
                                var detail = cmds[k].split('[\t\t]');
                                if(detail[2] == 'STREAM')
                                {
                                    for(var i = 0; i < msr.msr_output.length; i++)
                                    {
                                        if(detail[0] == msr.msr_output[i].StateId && detail[1] == msr.msr_output[i].Event)
                                        {
                                            GeoDataCtrl.getByKey(msr.msr_output[i].DataId, gdcb(k));
                                        }
                                    }
                                }
                                else if(detail[2] == 'FILE')
                                {
                                    count --;
                                    //检测文件是否存在


                                    if(count == 0)
                                    {
                                        socket.write('dataRecv');
                                    }
                                }
                            }
                        }
                    });
                }
                else
                {
                    socket.write('dataRecv');
                }
            }
            else if(cmds[1] == 'exit')
            {
                app.modelInsColl.changeStateBySocket(socket, 'MC_EXIT');
                console.log(cmds[0] + ' -- exit\n');
                socket.write('bye');
            }
        });

        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            if(!setting.debug)
            {
                mi = app.modelInsColl.getBySocekt(socket);
                ModelSerRunCtrl.getByGUID(mi.guid, function (err,msr) {
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
                    console.log("++++++++++++++++++++++++++++++run stopped++++++++++++++++++++++++++++++++++");
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

SocketTrans.prototype.sendMsg = function (socket, msg) {
    socket.write(msg);
}