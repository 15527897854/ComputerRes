/**
 * Created by Franklin on 2017/5/25.
 */

var RouteBase = require('./routeBase');
var ModelSerAccessCtrl = require('../control/modelSerAccessControl');

module.exports = function(app){
    //
    app.route('/fakedir/modelser/:path')
        .get(function(req, res, next){
            var path = req.params.path;
            if(req.session.user){
                return res.render('fakeModelSerRunPro', {
                    path : path
                });
            }
            else{
                return res.render('fakeLogin');
            }
        })
        .post(function(req, res, next){
            var path = req.params.path;
            ModelSerAccessCtrl.auth(path, req.body.username, req.body.pwd, function(err, result){
                if(err){
                    return res.end('Error : ' + JSON.stringify(err));
                }
                if(result){
                    req.session.user = req.body.username;
                    req.session.pwd = req.body.pwd;
                    return res.redirect('/fakedir/modelser/' + path);
                }
                else{
                    res.end('用户名或密码错误!');
                }
            });
        });
    
    //通过虚拟路径查询模型服务信息
    app.route('/fakedir/modelser/json/:path')
        .get(function(req, res, next){
            var path = req.params.path;
            ModelSerAccessCtrl.getModelSerByPath(path, RouteBase.returnFunction(res, 'error in getting modelser info!'));
        });
    
    //通过虚拟路径查询模型服务输入输出信息
    app.route('/fakedir/modelser/inputdata/json/:path')
        .get(function(req, res, next){
            var path = req.params.path;
            res.end('123');
        });
}