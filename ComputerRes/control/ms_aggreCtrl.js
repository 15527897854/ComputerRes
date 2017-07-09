var setting = require('../setting');
var Promise = require('bluebird');
var remoteReqCtrl = require('./remoteReqControl');
var modelserCtrl = require('./modelSerControl');

var MS_AggreCtrl = (function () {
    //region private
    var __getCloudMS = function(cb){
        remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetClassServlet', function(err, categories){
            if(err){
                return cb(err);
            }
            var rst = [];
            var getCategoryById = function(id){
                for(var i = 0; i < categories.length; i++){
                    if(categories[i].id == id){
                        return i;
                    }
                }
                return -1;
            };
            var addLeafCate = function (index) {
                if(categories[index].children.length){
                    categories[index].child_node = [];
                    for(var j=0;j<categories[index].children.length;j++){
                        var childIndex = getCategoryById(categories[index].children[j]);
                        addLeafCate(childIndex);
                        categories[index].child_node.push(categories[childIndex])
                    }
                }
                else{

                }
                categories[index].hasAdded = true;
            };
            for(var i = 0; i < categories.length; i++) {
                if (categories[i].hasAdded == undefined) {
                    addLeafCate(i);
                    rst.push(categories[i]);
                }
            }
            return cb(null, rst);
        });
    };

    var __getChildMS = function (cb) {

    };

    var __getLocalMS = function (cb) {
        modelserCtrl.getLocalModelSer(function (err, mss) {
            err?cb(err):cb(null,mss);
        })
    };

    //endregion

    //region public
    return {
        getAllMS : function (cb) {
            __getLocalMS(function (err,mss) {
                err?cb(err):cb(null,mss);
            })
        },

        getPortalMS:function () {

        }
    };
    //endregion
})();

module.exports = MS_AggreCtrl;
