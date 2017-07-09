/**
 * Created by SCR on 2017/6/29.
 */
var MS_AggreCtrl = require('../control/ms_aggreCtrl');

module.exports = function (app) {
    //region render
    app.route('/aggregation')
        .get(function (req, res, next) {
            res.render('aggregation');
        });

    //endregion

    ///////////////////////////////////////////////////////////////////////////
    //region ajax
    app.route('/aggregation/ms/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all'){
                MS_AggreCtrl.getAllMS(function (rst) {
                    return res.end(JSON.stringify(rst));
                })
            }

        })
    //endregion
};