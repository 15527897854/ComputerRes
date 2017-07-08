/**
 * Created by SCR on 2017/6/29.
 */
module.exports = function (app) {
    app.route('/aggregation')
        .get(function (req, res, next) {
            res.render('bpmn/app/aggregation');
        })
};