/**
 * Created by Franklin on 2016/9/13.
 */
var ChildCtrl = require('../control/childControl');

module.exports = function (app) {
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
                      res.render('');
                  }
              });
          }
      });

    /////////////////////////////////JSON
    app.route('/child-node/json/:cid')
        .get(function (req, res, next) {
        var cid = req.params.cid;
        if(cid == 'all')
        {
            ChildCtrl.getAll(function (err, clds) {
                if(err)
                {
                    return res.end('Error : ' + err);
                }
                res.end(JSON.stringify({
                    // user:req.session.user,
                    clds : clds,
                    blmodelser_r : true
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