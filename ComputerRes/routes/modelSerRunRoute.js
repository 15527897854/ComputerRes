/**
 * Created by Franklin on 2016/8/5.
 * Route for model-service running info
 */
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var ModelSerCtrl = require('../control/modelSerControl');
var setting = require('../setting');
var remoteReqCtrl = require('../control/remoteReqControl');

module.exports = function (app) {
    //查看模型记录信息
    app.route('/modelserrun/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if(msrid == 'all')
            {
                ModelSerRunCtrl.getAll(function (err, msr) {
                    res.render('modelRuns', {
                        msr : msr,
                        blmodelser : true
                    });
                });
            }
            else
            {
                ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    ModelSerCtrl.getByOID(msr.ms_id, function (err, ms) {
                        if(err)
                        {
                            return res.end('Error : ' + err);
                        }
                        res.render('modelRun', {
                            msr : msr,
                            ms : ms,
                            blmodelser : true
                        });
                    });
                });
            }
        });
    
    //远程访问   查看其它结点的模型运行记录
    app.route('/modelserrun/rmt/:msrid')
        .get(function (req, res, next) {
            var msrid = req.params.msrid;
            if(msrid == 'all')
            {
                ModelSerRunCtrl.getAll(function (err, msr) {
                    res.render('modelRuns_r', {
                        msr : msr,
                        blmodelser : true
                    });
                });
            }
            else
            {
                ModelSerRunCtrl.getByOID(msrid, function (err, msr) {
                    if(err)
                    {
                        return res.end('Error : ' + err);
                    }
                    ModelSerCtrl.getByOID(msr.ms_id, function (err, ms) {
                        if(err)
                        {
                            return res.end('Error : ' + err);
                        }
                        res.render('modelRun_r', {
                            msr : msr,
                            ms : ms,
                            blmodelser : true
                        });
                    });
                });
            }
        })
}