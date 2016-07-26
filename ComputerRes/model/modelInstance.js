/**
 * Created by Franklin on 2016/7/25.
 * model for ModelInstance
 */
var uuid = require('node-uuid');

function ModelInstance() {
    this.gid = "";
    this.socekt = null;
    this.msinfo = null;
}

module.exports = ModelInstance;

ModelInstance.getGID = function () {
    return uuid.v1();
}