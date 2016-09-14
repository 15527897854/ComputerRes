var NoticeCtrl = require('../control/noticeCtrl');

module.exports = function (app) {
    app.route('/note')
        .get(function(req, res, next) {
            res.render('notice');
        });

    app.route('/notices')
        .get(function(req, res){
            var where;
            if(req.query['latest'] == 'true'){
                where = {hasRead:0};
                NoticeCtrl.getWhere(where,function (err, data){
                    if(data){
                        res.send({data:data.slice(0,4),length:data.length});
                    }
                    else {
                        res.send({data:null,length:0});
                    }
                })
            }
            else {
                where = {};
                NoticeCtrl.getWhere(where,function (err, data){
                    var arr = [0,0,0,0,0,0];
                    if(data){
                        data.forEach(function (item){
                            if(item.hasRead == 0){
                                if(item.type == 'startServer'){
                                    arr[0]++;
                                }
                                else if(item.type == 'stopServer'){
                                    arr[1]++;
                                }
                                else if(item.type == 'startRun'){
                                    arr[2]++;
                                }
                                else if(item.type == 'stopRun'){
                                    arr[3]++;
                                }
                                else if(item.type == 'delServer'){
                                    arr[4]++;
                                }
                                else if(item.type == 'errInfo'){
                                    arr[5]++;
                                }
                            }
                        });
                    }
                    res.send({data:data,arr:arr});
                })
            }
        })
        .post(function (req, res) {
            var id = req.body._id;
            // console.log(id);
            NoticeCtrl.getByOID(id,function (err, notice) {
                if(err){
                    res.send({status:0});
                }
                // console.log(id);
                console.log(id+ ":"+notice);
                notice.hasRead = 1;
                NoticeCtrl.update(notice,function (err, data) {
                    if(err){
                        res.send({status:0});
                    }
                    res.send({status:1});
                })
            })
    });
};