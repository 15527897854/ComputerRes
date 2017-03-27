/**
 * Created by Franklin on 2016/11/24.
 */
var setting = require('../setting');
var ModelSerRunCtrl = require('./modelSerRunControl');
var GeoDataCtrl = require('./geoDataControl');
var NoticeCtrl = require('./noticeCtrl');

var ModelInsCtrl = function () {};

module.exports = ModelInsCtrl;

ModelInsCtrl.enter = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    if(app.modelInsColl.bindSocket(cmds[0], socket) > 0)
    {
        socket.write('entered');
        console.log(cmds[0] + ' -- enter');
        app.modelInsColl.changeStateBySocket(socket, 'MC_ENTER');
    }
};

ModelInsCtrl.request = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    ModelSerRunCtrl.getByGUID(cmds[0], function (err, msr) {
        if(err)
        {
            console.log(err);
        }
        else
        {
            if (msr == null)
            {
                ModelInsCtrl.kill(app, cmds[0]);
                return ;
            }
            app.modelInsColl.changeStateBySocket(socket, 'MC_REQUEST');
            console.log(cmds[0] + ' -- request');
            var msg = "dataReady";

            var count = 0;
            var gdcb = (function (index) {
                count ++;
                return function (err, item) {
                    count --;
                    if(!err)
                    {
                        if(item != null)
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
};

ModelInsCtrl.checkdata = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKDATA');
    console.log(cmds[0] + ' -- checkdata');
    socket.write('oncheckdata');
};

ModelInsCtrl.calculate = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    app.modelInsColl.changeStateBySocket(socket, 'MC_CALCULATE');
    console.log(cmds[0] + ' -- calculate');
    socket.write('oncalculate');
};

ModelInsCtrl.checkres = function(app, cmds, socket){
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    app.modelInsColl.changeStateBySocket(socket, 'MC_CHECKRES');
    console.log(cmds[0] + ' -- checkres');
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

            var count = 0;
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

                for(var j = 0; j < msr.msr_output.length; j++)
                {
                    if(msr.msr_output[j].StateId == detail[0] && msr.msr_output[j].Event == detail[1])
                    {
                        count ++;
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
};

ModelInsCtrl.response = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    app.modelInsColl.changeStateBySocket(socket, 'MC_RESPONSE');
    console.log(cmds[0] + ' -- response');

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
};

ModelInsCtrl.exit = function (app, cmds, socket) {
    if (app == undefined || app == null || cmds == undefined || cmds == null)
    {
        return;
    }
    app.modelInsColl.changeStateBySocket(socket, 'MC_EXIT');
    console.log(cmds[0] + ' -- exit');
    socket.write('bye');
};

ModelInsCtrl.kill = function (app, guid) {
    if(app == undefined || app == null || guid == undefined || guid == null)
    {
        return;
    }
    var mis = app.modelInsColl.getByGUID(guid);
    mis.socket.write('kill');
};