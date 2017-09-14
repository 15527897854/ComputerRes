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
            var recvBuf = data.toString();
            
            var opLeft = recvBuf.indexOf('{');
            var opRight = recvBuf.indexOf('}');
            if(opLeft == -1 || opRight == -1 || opRight < opLeft){
                return console.log('illegal commad! Can not find OP. Original cmd : ' + recvBuf);
            }
            var op = recvBuf.substr(opLeft + 1, opRight - opLeft - 1);
            
            var idRight = recvBuf.indexOf('&');
            var id = '';
            if(idRight == -1){
                id = recvBuf.substr(opRight + 1);
                id = id.replace('\0','');
            }
            else if(opRight > idRight){
                return console.log('illegal commad! Can not find ID. Original cmd : ' + recvBuf);
            }
            else{
                id = recvBuf.substr(opRight + 1, idRight - opRight - 1);
            }
            opLeft = recvBuf.indexOf('}');
            var cmd = recvBuf.substr(opLeft + 1);
            cmd = cmd.replace('\0','');
            switch(op){
                case 'init':{
                    ModelInsCtrl.Initialize(id, socket);
                    break;
                }
                case 'onEnterState':{
                    var queryStr = cmd.split('&');
                    var sid = queryStr[1];

                    ModelInsCtrl.EnterState(id, sid);
                    break;
                }
                case 'onFireEvent':{
                    var queryStr = cmd.split('&');
                    var sid = queryStr[1];
                    var event = queryStr[2];

                    ModelInsCtrl.FireEvent(id, sid, event);
                    break;
                }
                case 'onRequestData':{
                    var queryStr = cmd.split('&');
                    var sid = queryStr[1];
                    var event = queryStr[2];
                    
                    ModelInsCtrl.RequestData(id, sid, event);
                    break;
                }
                case 'onResponseData':{
                    var queryStr = cmd.split('&');

                    var queryStr = cmd.split('&');

                    //! querys
                    var sname = queryStr[1];
                    var event = queryStr[2];
                    var signals = queryStr[3];

                    //! data
                    opLeft = cmd.lastIndexOf(']');
                    var data = cmd.substr(opLeft + 1);
                    data = data.replace('\0', '');
                    var nameLength = signals.substr(0, signals.indexOf('['));
                    var dataSignal = signals.substr(signals.indexOf('[') + 1, signals.indexOf(']') - signals.indexOf('[') - 1);
                    signals = signals.substr(signals.indexOf(']') + 1);
                    var dataType = signals.substr(1, signals.indexOf(']') - 1);
                    var dataFormat = dataType.substr(dataType.indexOf('|') + 1);
                    dataType = dataType.substr(0, dataType.indexOf('|'));

                    if (data == '')
                        ModelInsCtrl.ResponseDataPrepare(id, sname, event, data, dataSignal, dataType, dataFormat);
                    else
                        ModelInsCtrl.ResponseDataReceived(id, sname, event, data, dataSignal, dataType, dataFormat);
                    break;
                }
                case 'onPostErrorInfo':{
                    var errorinfo = '';
                    var queryStr = cmd.split('&');

                    ModelInsCtrl.PostErrorInfo(id, errorinfo);
                    break;
                }
                case 'onPostWarningInfo':{
                    var warninginfo = '';
                    var queryStr = cmd.split('&');

                    ModelInsCtrl.PostWarningInfo(id, warninginfo);
                    break;
                }
                case 'onPostMessageInfo':{
                    var messageinfo = '';
                    var queryStr = cmd.split('&');

                    ModelInsCtrl.PostMessageInfo(id, messageinfo);
                    break;
                }
                case 'onGetModelAssembly':{
                    var queryStr = cmd.split('&');
                    var assemblyName = queryStr[1];
                    ModelInsCtrl.GetModelAssembly(id, assemblyName);
                    break;
                }
                case 'onLeaveState':{
                    var sid = '';
                    ModelInsCtrl.LeaveState(id, sid);
                    break;
                }
                case 'onFinalize':{
                    var sid = '';
                    ModelInsCtrl.Finalize(id);
                    break;
                }
            }
            // // 老版模型交互协议
            // cmds = cmds.split('[\t\t\t]');
            // if(cmds.length < 2)
            // {
            //     console.log('Can not parse cmd : ' + data);
            //     return;
            // }
            // //事件分支
            // if(cmds[1] == 'enter')
            // {
            //     ModelInsCtrl.enter(app, cmds, socket);
            // }
            // else if(cmds[1] == 'request')
            // {
            //     ModelInsCtrl.request(app, cmds, socket);
            // }
            // else if(cmds[1] == 'checkdata')
            // {
            //     ModelInsCtrl.checkdata(app, cmds, socket);
            // }
            // else if(cmds[1] == 'calculate')
            // {
            //     ModelInsCtrl.calculate(app, cmds, socket);
            // }
            // else if(cmds[1] == 'checkres')
            // {
            //     ModelInsCtrl.checkres(app, cmds, socket);
            // }
            // else if(cmds[1] == 'response')
            // {
            //     ModelInsCtrl.response(app, cmds, socket);
            // }
            // else if(cmds[1] == 'exit')
            // {
            //     ModelInsCtrl.exit(app, cmds, socket);
            // }
        });


        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            //找到对应的内存对象
            mi = app.modelInsColl.getBySocekt(socket);
            ModelSerRunCtrl.getByGUID(mi.guid, function (err,msr) {
                if(err)
                {
                    console.log('Error in finding MSR when socket closed!');
                }
                if(msr == null)
                {
                    console.log('Can not find MSR when socket closed!');
                    return ;
                }
                //判断是否结束
                var finished = false;
                if(mi.state == 'Finalized')
                {
                    finished = true;
                }
                //计算时间
                var date_now = new Date();
                var data_begin = new Date(msr.msr_datetime);
                var time_span = date_now.getTime() - data_begin.getTime();
                time_span = time_span / 1000;
                msr.msr_span = time_span;
                msr.msr_logs = mi.log;
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

                    if(!setting.debug){
                        //移除该实例
                        app.modelInsColl.removeBySocekt(socket);
                    }
                    

                    //销毁必要数据
                    for(var i = 0; i < msr.msr_input.length; i++){
                        if(msr.msr_input[i].Destroyed){
                            GeoDataCtrl.delete(msr.msr_input[i].DataId, function(err, result){

                            });
                        }
                    }

                    //通知消息数据
                    var noticeData = {
                        time : new Date(),
                        title : msr.msr_ms.ms_model.m_name + '停止运行！',
                        detail : '',
                        type : 'stop-run',
                        hasRead : false
                    };
                    NoticeCtrl.save(noticeData,function (err, data) {
                        if(err){
                            return console.log('Error in addNotice');
                        }
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
