/**
 * Created by Franklin on 2016/8/6.
 */
var ModelSerCtrl = require('../control/modelSerControl');
var ModelSerRunCtrl = require('../control/modelSerRunControl');

module.exports = function (app) {
    //模型实例页面
    app.route('/modelins/all')
        .get(function (req, res, next) {
            res.render('modelInstance',{
                    blmodelser : true
                });
        });

    app.route('/modelins/:guid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var guid = req.params.guid;
            if(ac == 'detail'){
                ModelSerRunCtrl.getByGUID(guid, function(err, msr){
                    if(err){
                        return res.redirect('/modelins/all');
                    }
                    if(msr == null){
                        return res.redirect('/modelins/all');
                    }
                    return res.redirect('/modelserrun/' + msr._id);
                });
            }
            else{
                return res.end(JSON.stringify({
                    result : 'err',
                    message : 'Unknown cmd!'
                }));
            }
        })
        .put(function(req, res, next){
            var ac = req.query.ac;
            var guid = req.params.guid;
            if(ac == 'kill'){
                var flag = app.modelInsColl.kill(guid);
                if(flag == 1){
                    return res.end(JSON.stringify({
                        result : 'suc',
                        data : 1
                    }));
                }
                return res.end(JSON.stringify({
                    result : 'fail',
                    data : 1
                }));
            }
            if(ac == 'detail'){
                ModelSerRunCtrl.getByGUID(guid, function(err, msr){
                    if(err){
                        return res.redirect('/modelins/all');
                    }
                    if(msr == null){
                        return res.redirect('/modelins/all');
                    }
                    res.redirect('/modelserrun/' + msr._id);
                });
            }
            return res.end(JSON.stringify({
                result : 'err',
                message : 'Unknown cmd!'
            }));
        });

    //请求转发 获取远程的模型实例
    app.route('/modelins/rmt/all')
        .get(function (req, res, next) {
            res.render('modelInstance_r',{
                blmodelser_r : true
            });
        });
    
    app.route('/modelins/rmt/json/all')
        .get(function (req, res) {
            ModelSerCtrl.getAllRmtMis(null, function (err, childmsri) {
                // childmsri = JSON.parse(JSON.stringify(childmsri));
                var data = [];
                for(var i = 0;i<childmsri.length;i++){
                    data[i] = {
                        msri:childmsri[i].msri,
                        ping:childmsri[i].ping,
                        host:childmsri[i].host
                    };
                }
                res.end(JSON.stringify({
                    childmsri : data
                }));
            });
        });

    app.route('/modelins/rmt/json/:host/:guid')
        .get(function(req, res, next)
        {
            var host = req.params.host;
            var guid = req.params.guid;
            ModelSerCtrl.getRmtMis(host, guid, function(err, data){
                if(err)
                {
                    return res.end('error : ' + JSON.stringify(err));
                }
                return res.end(JSON.stringify(data));
            });
        });
};