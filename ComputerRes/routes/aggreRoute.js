/**
 * Created by SCR on 2017/6/29.
 */
var MSAggreCtrl = require('../control/MSAggreCtrl');
var ModelSerCtrl = require('../control/modelSerControl');
var formidable = require('formidable');
var AggreSolutionModel = require('../model/aggreSolution');

module.exports = function (app) {
    //region render

    // new/edit solution
    // query solution
    // configure solution
    app.route('/aggregation/solution/:ac')
        .get(function (req, res, next) {
            var ac = req.params.ac;
            // if(Object.getOwnPropertyNames(req.query).length == 0){
                if(ac == 'new' || ac == 'edit'){
                    return res.render('aggregation/newSolution',{
                        openli:'aggregation-li'
                    });
                }
                else if(ac == 'query'){
                    return res.render('aggregation/solutionLibrary',{
                        openli:'aggregation-li'
                    });
                }
                else if(ac == 'configure'){
                    return res.render('aggregation/configureSolution',{
                        openli:'aggregation-li'
                    });
                }
            // }
            next();
        });

    app.route('/aggregation/solution/detail')
        .get(function (req, res, next) {
            var _id = req.query._id;
            if(_id && _id != undefined){
                AggreSolutionModel.getByOID(_id,function (err, solution) {
                    if(err){
                        return res.end(JSON.stringify({error:err}));
                    }
                    else{
                        if(solution && solution != undefined){
                            return res.render('aggregation/solutionDetail',{
                                openli:'aggregation-li',
                                solution: JSON.stringify(solution),
                                solutionName: solution.solutionInfo.solutionName
                            });
                        }
                        else{
                            return res.render('aggregation/solutionDetail',{
                                openli:'aggregation-li',
                                solution: '',
                                solutionName: 'query error!'
                            });
                        }

                    }
                });
            }
        });

    // query instance
    app.route('/aggregation/instance')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'query'){
                return res.render('instance',{
                    openli:'aggregation-li'
                });
            }

            next();
        });

    // query task
    app.route('/aggregation/task')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'query'){
                return res.render('taskList',{
                    openli:'aggregation-li'
                })
            }

            next();
        });

    //endregion

    ///////////////////////////////////////////////////////////////////////////
    //region ajax

    // region 获取聚合服务列表
    //获取所有可用的服务
    app.route('/aggregation/ms/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all'){
                MSAggreCtrl.getAllMS(function (rst) {
                    return res.end(rst);
                })
            }

        });

    //获取参与聚合的服务详细信息，包括host、port、MDL、以及存在ms数据库中的数据
    app.route('/aggregation/SADL/getServices')
        .get(function (req, res, next) {
            var mss = req.query.mss;
            MSAggreCtrl.getSADLServices(mss,function (rst) {
                return res.end(rst);
            })
        });

    //获取一个服务的详细信息
    app.route('/aggregation/SADL/getMSDetail')
        .get(function (req, res, next) {
            var _id = req.query._id;
            ModelSerCtrl.getMSDetail(_id,function (err,rst) {
                err?res.end(JSON.stringify({error:err})):
                    res.end(JSON.stringify({error:null,MSDetail:rst}));
            })
        });
    // endregion

    // delete solution
    app.route('/aggregation/solution/delete')
        .delete(function (req, res, next) {
            var _id = req.body._id;
            MSAggreCtrl.delSolutionByID(_id,function (err, rst) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,result:rst}));
                }
            });
        });

    app.route('/aggregation/solution/getByID')
        .get(function (req,res,next) {
            var _id = req.query._id;
            var isComplete = req.query.isComplete;
            if(_id && _id != undefined && isComplete && isComplete != undefined){
                MSAggreCtrl.getSolutionByID(_id, isComplete, function (err, solutionsSegment) {
                    if(err){
                        return res.end(JSON.stringify({error:err}));
                    }
                    else{
                        return res.end(JSON.stringify({error:null,solutionsSegment:solutionsSegment}));
                    }
                })
            }
        });

    app.route('/aggregation/solution/save')
        .post(function (req, res, next) {
            var solution = req.body;
            MSAggreCtrl.saveAggreSolution(solution,function (err, msg) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,_id:msg}));
                }
            })
        });


    app.route('/aggregation/run')
        .post(function (req, res, next) {
            var aggreCfg = req.body.aggreCfg;
        });

    app.route('/aggregation/newandrun')
        .post(function (req, res, next) {

        });

    // kill instance
    app.route('/aggregation/instance')
        .get(function (req, res, next) {
            var ac = req.query.ac;
            if(ac == 'kill'){

            }
        });


    //endregion
};