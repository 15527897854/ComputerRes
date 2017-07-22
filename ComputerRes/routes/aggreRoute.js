/**
 * Created by SCR on 2017/6/29.
 */
var MSAggreCtrl = require('../control/Integrate/MSAggreCtrl');
var ModelSerCtrl = require('../control/modelSerControl');
var formidable = require('formidable');
var AggreSolutionModel = require('../model/Integrate/aggreSolution');
var DataDriver = require('../control/Integrate/DataDriver');
var DataDriverFunc = new DataDriver();

module.exports = function (app) {
    //region render

    // new/edit solution
    // query solution
    // solution detail
    // configure solution
    app.route('/aggregation/solution/:ac')
        .get(function (req, res, next) {
            var ac = req.params.ac;
            // if(Object.getOwnPropertyNames(req.query).length == 0){
                if(ac == 'new'){
                    return res.render('aggregation/newSolution',{
                        openli:'aggregation-li'
                    });
                }
                else if(ac == 'query'){
                    return res.render('aggregation/solutionLibrary',{
                        openli:'aggregation-li'
                    });
                }
                else if(ac == 'edit' || ac == 'configure' || ac == 'detail'){
                    var ejsFile = null;
                    if(ac == 'edit'){
                        ejsFile = 'aggregation/newSolution';
                    }
                    else if(ac == 'detail' || ac == 'configure'){
                        ejsFile = 'aggregation/solutionDetail';
                    }
                    var solutionID = null;
                    if(ac == 'configure'){
                        solutionID = req.query.solutionID;
                    }
                    else{
                        solutionID = req.query._id;
                    }
                    if(!solutionID || solutionID == undefined){
                        return res.render('aggregation/solutionDetail',{
                            openli:'aggregation-li',
                            solution: '',
                            solutionName: 'query error!'
                        });
                    }
                    AggreSolutionModel.getByOID(solutionID,function (err, solution) {
                        if(err){
                            return res.end(JSON.stringify(err));
                        }
                        else{
                            if(solution && solution != undefined){
                                return res.render(ejsFile,{
                                    openli:'aggregation-li',
                                    solution: JSON.stringify(solution),
                                    solutionName: solution.solutionInfo.solutionName
                                });
                            }
                            else{
                                return res.render(ejsFile,{
                                    openli:'aggregation-li',
                                    solution: '',
                                    solutionName: 'query error!'
                                });
                            }
                        }
                    });
                }
                else{
                    next();
                }
            // }
        });

    // query task
    // new/edti task
    // task detail
    app.route('/aggregation/task/:ac')
        .get(function (req, res, next) {
            var ac = req.params.ac;
            if(ac == 'query'){
                return res.render('aggregation/taskList',{
                    openli:'aggregation-li'
                })
            }
            else if(ac == 'new'){
                var solutionID = req.query.solutionID;
                if(!solutionID || solutionID == undefined){
                    return res.render('aggregation/solutionDetail',{
                        openli:'aggregation-li',
                        solution: '',
                        solutionName: 'query error!'
                    });
                }
                AggreSolutionModel.getByOID(solutionID,function (err, solution) {
                    if (err) {
                        return res.end(JSON.stringify(err));
                    }
                    else {
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
            else if(ac == 'edit' || ac == 'detail'){
                var taskID = req.query._id;
                if(!taskID || taskID == undefined){
                    return res.render('aggregation/solutionDetail',{
                        openli:'aggregation-li',
                        solution: '',
                        solutionName: 'query error!'
                    });
                }
                MSAggreCtrl.getTaskDetailByID(taskID,function (err, taskDetail) {
                    if(err){
                        return res.end(JSON.stringify(err));
                    }
                    else if(taskDetail){
                        return res.render('aggregation/solutionDetail',{
                            openli:'aggregation-li',
                            task: JSON.stringify(taskDetail),
                            taskName: taskDetail.taskInfo.taskName
                        });
                    }
                    else{
                        return res.render('aggregation/solutionDetail',{
                            openli:'aggregation-li',
                            task: '',
                            taskName: 'query error!'
                        });
                    }
                });
            }
            else {
                next();
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

    //endregion

    ///////////////////////////////////////////////////////////////////////////
    //region ajax

    // region 获取聚合服务列表
    //获取所有可用的服务
    app.route('/aggregation/ms/:msid')
        .get(function (req, res, next) {
            var msid = req.params.msid;
            if(msid == 'all'){
                MSAggreCtrl.getAllMS(function (err,mss) {
                    if(err){
                        return res.end(JSON.stringify({error:err}));
                    }
                    else{
                        return res.end(JSON.stringify({error:null,mss:mss}));
                    }
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

    // region solution router

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

    app.route('/aggregation/solution/save')
        .post(function (req, res, next) {
            var solution = req.body;
            MSAggreCtrl.saveSolution(solution,function (err, msg) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,_id:msg}));
                }
            })
        });

    app.route('/aggregation/solution/getByID')
        .get(function (req,res,next) {
            var _id = req.query._id;
            var isComplete = req.query.isComplete;
            if(!_id || _id == undefined){
                return res.end(JSON.stringify({error:'Can\'t find this solution!'}));
            }
            if(!isComplete || isComplete == undefined){
                return res.end(JSON.stringify({error:'Please specify the "isComplete" field!'}));
            }
            if(_id == 'all' && isComplete == 'false'){
                MSAggreCtrl.getSolutionsSegmentByID(function (err, solutionsSegment) {
                    if(err){
                        return res.end(JSON.stringify({error:err}));
                    }
                    else{
                        return res.end(JSON.stringify({error:null,solutionsSegment:solutionsSegment}));
                    }
                })
            }
        });

    // endregion

    // region task router
    app.route('/aggregation/task/save')
        .post(function (req, res, next) {
            var task = req.body;
            MSAggreCtrl.saveTask(task,function (err, msg) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,_id:msg}));
                }
            })
        });

    app.route('/aggregation/task/getByID')
        .get(function (req, res, next) {
            var _id = req.query._id;
            var isComplete = req.query.isComplete;
            if(!_id || _id == undefined){
                return res.end(JSON.stringify({error:'Can\'t find this task!'}));
            }
            if(!isComplete || isComplete == undefined){
                return res.end(JSON.stringify({error:'Please specify the "isComplete" field!'}));
            }
            if(_id == 'all' && isComplete == 'false'){
                MSAggreCtrl.getTasksSegmentByID(function (err, tasksSegment) {
                    if(err){
                        return res.end(JSON.stringify({error:err}));
                    }
                    else{
                        return res.end(JSON.stringify({error:null,tasksSegment:tasksSegment}));
                    }
                })
            }
        });

    app.route('/aggregation/task/delete')
        .delete(function (req, res, next) {
            var _id = req.body._id;
            MSAggreCtrl.delTaskByID(_id,function (err, rst) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,result:rst}));
                }
            });
        });

    // TODO 发送给各个子节点kill命令
    app.route('/aggregation/task/kill')
        .post(function (req, res, next) {

        });

    // 点击运行按钮触发
    app.route('/aggregation/task/run')
        .post(function (req, res, next) {
            var task = req.body;
            MSAggreCtrl.runTask(task,function (err, msg) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null}));
                }
            })
        });

    // endregion

    ////////////////////////////////////////////////////////////////////////////////////
    // region aggregation

    // region computer node router
    // 接收到数据坐标
    app.route('/aggregation/onReceivedDataLocation')
        .post(function (req, res, next) {
            var dataLocation = req.body;
            // 两种选择：应该选择第二种，第一种可以会断开连接
            // 数据下载完成时在 response，数据下载完成后发送请求更新数据准备状态为 RECEIVED
            // 立即回复，数据状态更新为 PENDING
            var dataDriver = new DataDriver();
            dataDriver.init(dataLocation.taskID,function (err) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    dataDriver.onReceivedDataLocation(dataLocation);
                    return res.end(JSON.stringify({dataState:'PENDING'}));
                }
            });
        });

    // 数据准备完成，可以触发运行事件了
    app.route('/aggregation/onReceivedMSReady')
        .post(function (req, res, next) {
            var runCfg = req.body;

            var centerHost = req.body.centerHost;
            var centerPort = req.body.centerPort;
            var taskID = req.body.taskID;
            var MSinsID = req.body.MSinsID;

            //读取输入文件参数
            var inputData = req.body.inputData;
            var outputData = JSON.stringify(req.body.outputData);

            var user = {
                u_name : '[匿名]',
                u_type : 2
            };
            if(req.session.admin){
                user = {
                    u_name : req.session.admin,
                    u_type : 0
                };
            }
            if(req.session.user){
                user = {
                    u_name : req.session.user,
                    u_type : 1
                };
            }

            DataDriverFunc.onReceivedMSReady(runCfg,user,function (err, msr) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    return res.end(JSON.stringify({error:null,MSRID:msr._id}));
                }
            });

        });

    // endregion

    // region control center router
    // 接收到数据，更新数据准备状态为 RECEIVED
    app.route('/aggregation/onReceivedDataDownloaded')
        .post(function (req, res, next) {
            var replyData = req.body;
            var dataDriver = new DataDriver();
            dataDriver.init(replyData.taskID,function (err) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    dataDriver.onReceivedDataDownloaded(replyData, function (err) {
                        if(err){
                            return res.end(JSON.stringify({error:err}));
                        }
                        else{
                            return res.end(JSON.stringify({error:null}));
                        }
                    })
                }
            });
        });

    app.route('/aggregation/onReceivedMSFinished')
        .post(function (req, res, next) {
            var finishedInfo = req.body;
            var dataDriver = new DataDriver();
            dataDriver.init(finishedInfo.taskID,function (err) {
                if(err){
                    return res.end(JSON.stringify({error:err}));
                }
                else{
                    dataDriver.onReceivedMSFinished(finishedInfo, function (err) {
                        if(err){
                            return res.end(JSON.stringify({error:err}));
                        }
                        else{
                            return res.end(JSON.stringify({error:null}));
                        }
                    })
                }
            });
        })

    // endregion


    //endregion
};