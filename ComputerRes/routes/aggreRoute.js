/**
 * Created by SCR on 2017/8/11.
 */

var ModelSerCtrl = require('../control/modelSerControl');

module.exports = function (app) {
    // 接收到数据坐标
    app.route('/integration/onReceivedDataPosition')
        .post(function (req, res, next) {
            // var centerHost = ;
            // var centerPort = ;
            var dataLocation = req.body;
            // 两种选择：应该选择第二种，第一种可以会断开连接
            // 数据下载完成时在 response，数据下载完成后发送请求更新数据准备状态为 RECEIVED
            // 立即回复，收到回复后数据状态将更新为 PENDING

            // 收到数据坐标，开始请求数据
            DataDriver.onReceivedDataPosition(dataLocation);

            res.end('');
        });

    app.route('/integration/SADL/getMSDetail')
        .get(function (req, res, next) {
            var _id = req.query._id;
            ModelSerCtrl.getMSDetail(_id,function (err,rst) {
                err?res.end(JSON.stringify({error:err})):
                    res.end(JSON.stringify({error:null,MSDetail:rst}));
            })
        });
};