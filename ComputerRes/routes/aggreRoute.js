/**
 * Created by SCR on 2017/6/29.
 */
var MSAggreCtrl = require('../control/MSAggreCtrl');

module.exports = function (app) {
    //region render
    app.route('/aggregation')
        .get(function (req, res, next) {
            res.render('aggregation/aggregation',{
                openli:'aggregation-li'
            });
        });

    //endregion

    ///////////////////////////////////////////////////////////////////////////
    //region ajax

    //获取所有可用的服务
    app.route('/aggregation/ms/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all'){
                MSAggreCtrl.getAllMS(function (rst) {
                    return res.end(rst);
                })
            }

        });

    //获取参与聚合的服务详细信息，包括host、port、state、以及存在ms数据库中的数据
    app.route('/aggregation/SADL/getServices')
        .get(function (req, res, next) {
            var mss = req.query.mss;
            MSAggreCtrl.getSADLServices(mss,function (rst) {
                return res.end(rst);
            })
        });

    //获取一个服务的详细信息
    app.route('/aggregation/SADL/getMSDetail')
        .get(function (req, res, next) {
            var _id = req.query._id;
            MSAggreCtrl.getMSDetail(_id,function (rst) {
                return res.end(rst);
            })
        });
    //endregion
};