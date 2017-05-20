/**
 * Created by Administrator on 5.19.
 */
var BatchDeployModel = require('../model/batchDeploy');
var controlBase = require('./controlBase');

function BatchDeploy() {

}

BatchDeploy.__proto__ = controlBase;
BatchDeploy.model = BatchDeployModel;
module.exports = BatchDeploy;