var setting = require('../setting');
var Promise = require('bluebird');
var remoteReqCtrl = require('./remoteReqControl');
var modelSerCtrl = require('./modelSerControl');
var modelBase = require('../model/modelBase');
var sysCtrl = require('./sysControl');
var ObjectID = require('mongodb').ObjectID;

var MSAggreCtrl = (function () {
    //获取所有门户的ms
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
    //获取所有子节点的ms
    var __getChildMS = function (cb) {

    };
    //获取本机所有的ms
    var __getLocalMS = function (cb) {
        new Promise((resolve,reject)=>{
            modelSerCtrl.getByWhere({ms_status:1,ms_limited:0},function (err, mss) {
                if(err) return reject(err);
                return resolve(mss);
            });
        }).then((mss)=>{
            sysCtrl.getIP(function (err, ip) {
                if(err) cb(err);
                for(var i=0;i<mss.length;i++){
                    mss[i].host = ip;
                    mss[i].port = setting.port;
                }
                cb(null,mss);
            });
        }).catch((err)=>{
            return cb(err);
        })
    };

    //将数据库中存储的ms转换为集成时需要的service结构,包括MDL、host、port
    var __getSADLService = function (ms, cb) {
        var url = 'http://'+ms.host+':'+ms.port+'/aggregation/SADL/getMSDetail';
        var form = {
            _id : ms._id
        };
        remoteReqCtrl.getByServer(url,form,function (err, res) {
            // res:{
            //     MS:Object,
            //     MDL:Object
            // }
            if(err) return cb(err);
            res = JSON.parse(res);
            if(res.error) return cb(res.error);
            res.MSDetail.host = ms.host;
            res.MSDetail.port = ms.port;
            res.MSDetail._id = res.MSDetail.MS._id;
            return cb(null,res.MSDetail);
        })
    };

    return {
        //获取所有可用的ms，并在ms中增加两个字段：host，port
        getAllMS : function (cb) {
            __getLocalMS(function (err,mss) {
                err?
                    cb(JSON.stringify({error:err})):
                    cb(JSON.stringify({error:null,mss:mss}));
            })
        },

        //获取门户上所有可用的ms，带有两个字段：host，port
        getPortalMS:function () {

        },

        //获取参与聚合任务的所有ms详细信息，包括states信息
        getSADLServices:function (mss,cb) {
            var SADLServices = [];
            var count = 0;
            var pending = function () {
                count++;
                return function (err, SADLService) {
                    count--;
                    if(err){
                        SADLServices.push({error:err});
                    }
                    else{
                        SADLServices.push({error:null,SADLService:SADLService});
                    }
                    if(count == 0){
                        return cb(JSON.stringify(SADLServices));
                    }
                }
            };
            for(var i=0;i<mss.length;i++){
                __getSADLService(mss[i],pending());
            }
        }
    };
})();

module.exports = MSAggreCtrl;
