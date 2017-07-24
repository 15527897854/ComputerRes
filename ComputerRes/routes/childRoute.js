/**
 * Created by Franklin on 2016/9/13.
 */
var ChildCtrl = require('../control/childControl');
var RouteBase = require('./routeBase');
var CommonMethod = require('../utils/commonMethod');

module.exports = function (app) {
    app.route('/child-node')
        .post(function(req, res, next){
            var host = CommonMethod.getIP(req);

            if(req.body.platform == undefined || req.body.port == undefined){
                return res.end(JSON.stringify({
                    result : 'err',
                    message : 'platform, port or both are undefined!'
                }));
            }
            var port = req.body.port;
            var platform = req.body.platform;
            var access_token = req.body.access_token;
            ChildCtrl.AddNewChild({
                host : host,
                port : port,
                platform : platform,
                accepted : false,
                access_token : access_token
            },RouteBase.returnFunction(res, 'error in adding new child!'));
        });

    app.route('/child-node/:cid')
        .get(function (req, res, next) {
          var cid = req.params.cid;
          if(cid == 'all')
          {
              ChildCtrl.getAll(function (err, clds) {
                  if(err)
                  {
                      return res.end('Error : ' + err);
                  }
                  res.render('child-nodes',{
                      // user:req.session.user,
                      clds : clds,
                      blmodelser_r : true
                  });
              });
          }
          else
          {
              ChildCtrl.getByOID(cid, function (err, cld) {
                  if(err)
                  {
                      return res.end('Error : ' + err);
                  }
                  else
                  {
                      res.render('child-node',{
                          host : cld.host
                      });
                  }
              });
          }
        })
        .put(function (req, res, next){
            var cid = req.params.cid;
            if(req.query.ac == 'accept'){
                ChildCtrl.Accept(cid, RouteBase.returnFunction(res, 'error in accepting a child request'));
            }
        })
        .delete(function(req, res, next){
            var cid = req.params.cid;
            ChildCtrl.remove(cid, RouteBase.returnFunction(res, 'Error in removing a child node'));
        });

    ///////////////////////////////// JSON
    app.route('/child-node/json/:cid')
        .get(function (req, res, next) {
        var cid = req.params.cid;
        if(cid == 'all')
        {
            ChildCtrl.getAllWithPing(function (err, children) {
                if(err)
                {
                    return res.end('Error : ' + err);
                }
                res.end(JSON.stringify({
                    children : children
                }));
            });
        }
        else
        {
            ChildCtrl.getByOID(cid, function (err, cld) {
                if(err)
                {
                    return res.end('Error : ' + err);
                }
                else
                {
                    res.render('');
                }
            });
        }
    });
};