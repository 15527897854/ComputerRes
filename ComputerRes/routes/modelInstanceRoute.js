/**
 * Created by Franklin on 2016/8/6.
 */
var ModelSerCtrl = require('../control/modelSerControl');

module.exports = function (app) {
    //模型实例页面
    app.route('/modelins')
        .get(function (req, res, next) {
            res.render('modelInstance',
                {
                    // user:req.session.user,
                    blmodelser : true
                });
        });

    //得到模型实例的JSON数据
    app.route('/modelins/json/:guid')
        .get(function (req, res, next) {
            var guid = req.params.guid;
            if(guid == 'all')
            {
                var miss = app.modelInsColl.getAllIns();
                miss = JSON.stringify(miss);
                res.end(miss);
            }
            else
            {
                var mis = app.modelInsColl.getByGUID(guid);
                if(mis != -1)
                {
                    mismodel = {
                        state : mis.state,
                        guid : mis.guid
                    };
                    return res.end(JSON.stringify({
                        'res' : 'suc',
                        'mis' : mismodel
                    }));
                }
                else
                {
                    return res.end(JSON.stringify({
                        res : null,
                        mis : null
                    }));
                }
            }
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
            ModelSerCtrl.getChildMSRI(null, function (err, childmsri) {
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
        })
};