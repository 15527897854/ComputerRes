/**
 * Created by Franklin on 2016/8/6.
 */

module.exports = function (app) {
    //模型实例页面
    app.route('/modelins')
        .get(function (req, res, next) {
            res.render('modelInstance',
                {
                    blmodelser : true
                });
        });

    //得到模型实例的JSON数据
    app.route('/modelins/json/:guid')
        .get(function (req, res, next) {
            var guid = req.params.guid;
            if(guid == 'all')
            {
                var miss = JSON.stringify(app.modelInsColl.ModelInsArr);
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
                        'mis' : JSON.stringify(mismodel)
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
}