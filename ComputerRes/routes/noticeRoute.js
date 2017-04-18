var NoticeCtrl = require('../control/noticeCtrl');

module.exports = function (app) {
    app.route('/note')
        .get(function(req, res, next) {
            res.render('notice');
        });

    app.route('/notices')
        .get(function(req, res){
            var noticeFilter = req.query.noticeFilter;
            var noticeType = req.query.noticeType;
            var where = {};
            if(noticeFilter == '已读'){
                where.hasRead = true;
            }
            else if(noticeFilter == '未读'){
                where.hasRead = false;
            }
            if(noticeType && noticeType != 'all'){
                where.type = noticeType;
            }
            NoticeCtrl.getByWhere(where,function (err, data){
                if(err){
                    return res.end(JSON.stringify({status:0}));
                }
                else {
                    data = data.reverse();
                    return res.end(JSON.stringify({status:1,data:data}));
                }
            })
        })
        .post(function (req, res) {
            var id = req.body._id;
            NoticeCtrl.updateState({_id:id},function (err, data) {
                res.end(data);
            });
    });
};