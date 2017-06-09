/**
 * Created by Franklin on 16-3-27.
 * Control fot ModelService
 */
var http = require('http');
var fs = require('fs');
var path = require('path');

var rimraf = require('rimraf');
var unzip = require('unzip');
var ObjectId = require('mongodb').ObjectID;
var uuid = require('node-uuid');
var iconv = require('iconv-lite');

var setting = require('../setting');
var ModelSerModel = require('../model/modelService');
var ModelSerRunModel = require('../model/modelSerRun');
var FileOpera = require('../utils/fileOpera');
var Child = require('../model/child');
var remoteReqCtrl = require('./remoteReqControl');
var ControlBase = require('./controlBase');
var ParamCheck = require('../utils/paramCheck');
var GeoDataCtrl = require('../control/geoDataControl');
var CommonMethod = require('../utils/commonMethod');
var SystemCtrl = require('./sysControl');
var batchDeployCtrl = require('./batchDeploy');
var SWECtrl = require('./softwareEnCtrl');
var HWECtrl = require('./hardwareEnCtrl');

var ModelSerControl = function () {
};
ModelSerControl.__proto__ = ControlBase;
ModelSerControl.model = ModelSerModel;


////////////////远程服务

//搜索子节点模型服务信息信息
ModelSerControl.getChildModelSer = function (callback) {
    Child.getAllAvai(function (err, childMs) {
        if (err) {
            return callback(err);
        }

        if (childMs.length == 0) {
            return callback(null, [])
        }

        var pending = (function (pcallback) {
            var count = 0;
            return function (index) {
                count++;
                return function (err, data) {
                    count--;
                    if (err) {
                        childMs[index].ping = 'err';
                    }
                    else {
                        childMs[index].ping = 'suc';
                        childMs[index].ms = data;
                    }
                    if (count == 0) {
                        pcallback();
                    }
                }
            }
        });

        var done = pending(function () {
            return callback(null, childMs);
        });

        for (var i = 0; i < childMs.length; i++) {
            remoteReqCtrl.getRequestJSON('http://' + childMs[i].host + ':' + childMs[i].port + '/modelser/json/all', done(i));
        }
    });
};

//查询子节点的所有模型服务运行实例
ModelSerControl.getAllRmtMis = function (headers, callback) {
    Child.getAll(function (err, children) {
        if (err) {
            return callback(err);
        }

        var pending = (function (i, host) {
            count++;
            return function (err, mis) {
                count--;
                if (!err) {
                    children[i].mis = mis;
                }
                if (count == 0) {
                    return callback(null, children[i]);
                }
            }
        });

        var count = 0;
        for (var i = 0; i < children.length; i++) {
            remoteReqCtrl.getRequestJSON('http://' + children[i].host + ':' + children[i].port + '/modelins/json/all', pending(i));
        }
    });
};

//查询某个子节点某个模型服务运行实例
ModelSerControl.getRmtMis = function (host, guid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, guid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelins/json/' + guid, this.returnFunction(callback, "error in get rmt model service instance"));
                }
            }.bind(this));
        }
    }
};

//得到远程模型的详细信息
ModelSerControl.getRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//启动远程模型
ModelSerControl.startRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=start', this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//关闭远程模型
ModelSerControl.stopRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.putRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=stop', this.returnFunction(callback, "error in get rmt model service"));
            }.bind(this));
        }
    }
};

//获取远程模型输入信息
ModelSerControl.getRmtInputDate = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/inputdata/json/' + msid, this.returnFunction(callback, "error in get input data of rmt model service"));
                }
            }.bind(this));
        }
    }
};

//运行远程模型
ModelSerControl.runRmtModelSer = function (host, msid, inputdata, outputdata, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, host)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid + '?ac=run&inputdata=' + inputdata + '&outputdata=' + outputdata, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, data);
                    });
                }
            });
        }
    }
};

//删除远程模型服务
ModelSerControl.deleteRmtModelSer = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.deleteRequestJSON('http://' + child.host + ':' + child.port + '/modelser/' + msid, this.returnFunction(callback, "error in get input data of rmt model service"));
            }.bind(this));
        }
    }
};

//远程上传模型
ModelSerControl.postRmtModelSer = function (req, host, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        Child.getByHost(host, function (err, child) {
            if (err) {
                return callback(err);
            }
            remoteReqCtrl.postRequest(req, 'http://' + child.host + ':' + child.port + '/modelser/' + req.sessionID, this.returnFunction(callback, "error in get input data of rmt model service"));
        }.bind(this));
    }
};

//远程查看图像
ModelSerControl.getRmtImg = function (host, imgname, res, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, imgname)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                remoteReqCtrl.getRequestPipe(res, 'http://' + child.host + ':' + child.port + '/images/modelImg/' + imgname);
                return callback(null, true);
            });
        }
    }
};

///////////////本地服务

//搜寻本地可用模型信息
ModelSerControl.getLocalModelSer = function (callback) {
    ModelSerModel.getAll('AVAI', this.returnFunction(callback, 'error in getting all model services'));
};

//模型压缩包文件结构验证
//成功返回 isValidate == true，失败返回 错误信息
//status == 0 表示后台读取数据库或者文件出错
ModelSerControl.validate = function (modelPath, callback) {
    var configPath = modelPath + 'package.config';
    var rst = {
        status: 1,
        isValidate: true,
        cfgfile: true,
        cfg: [],
        mdl: true,
        start: true
    };
    fs.stat(configPath, function (err, stat) {
        if (err && err.code == 'ENOENT') {
            rst.cfgfile = false;
            rst.isValidate = false;
            callback(rst);
        }
        else if (err) {
            callback({status: 0});
        }
        else if (stat) {
            ModelSerControl.readCfgBypath(configPath, function (err, cfg) {
                if (err) {
                    callback({status: 0});
                }
                else {
                    //验证config文件
                    {
                        if (!cfg.host) {
                            rst.isValidate = false;
                            rst.cfg.push('host');
                        }
                        else if (!cfg.port) {
                            rst.isValidate = false;
                            rst.cfg.push('port');
                        }
                        else if (!cfg.start) {
                            rst.isValidate = false;
                            rst.cfg.push('start');
                        }
                        else if (!cfg.type) {
                            rst.isValidate = false;
                            rst.cfg.push('type');
                        }
                        else if (!cfg.mdl) {
                            rst.isValidate = false;
                            rst.cfg.push('mdl');
                        }
                        if (!rst.isValidate) {
                            callback(rst);
                        }
                    }
                    //验证 模型启动文件、mdl
                    var startPath = modelPath + cfg.start;
                    var mdlPath = modelPath + cfg.mdl;
                    fs.stat(startPath, function (err, stat) {
                        if (err && err.code == 'ENOENT') {
                            rst.start = false;
                            rst.isValidate = false;
                            fs.stat(mdlPath, function (err, stat2) {
                                if (err && err.code == 'ENOENT') {
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if (err) {
                                    callback({status: 0});
                                }
                                else if (stat2) {
                                    callback(rst);
                                }
                            });
                        }
                        else if (err) {
                            callback({status: 0});
                        }
                        else if (stat) {
                            fs.stat(mdlPath, function (err, stat2) {
                                if (err && err.code == 'ENOENT') {
                                    rst.mdl = false;
                                    rst.isValidate = false;
                                    callback(rst);
                                }
                                else if (err) {
                                    callback({status: 0});
                                }
                                else if (stat2) {
                                    callback(rst);
                                }
                            });
                        }
                    });
                }
            });
        }

    });
};

//新增模型服务
//先解压到以_oid命名的文件夹中，验证成功在添加记录，失败不添加记录并删除该文件夹
ModelSerControl.addNewModelSer = function (fields, files, callback) {
    var date = new Date();
    var img = null;
    if (files.ms_img) {
        if (files.ms_img.size != 0) {
            img = uuid.v1() + path.extname(files.ms_img.path);
            fs.renameSync(files.ms_img.path, setting.modelpath + '../public/images/modelImg/' + img);
        }
        else {
            FileOpera.rmdir(files.ms_img.path);
        }
    }

    //产生新的OID
    var oid = new ObjectId();

    //解压路径
    var model_path = setting.modelpath + oid.toString() + '/';
    //MD5码
    FileOpera.getMD5(files.file_model.path, function (err, md5_value) {
        if (err) {
            return callback(err);
        }

        var afterUncompress = function () {
            //文件验证
            ModelSerControl.validate(model_path, function (rst) {
                if (!rst.status || !rst.isValidate) {
                    //删除文件和文件夹
                    FileOpera.rmdir(files.file_model.path);
                    FileOpera.rmdir(model_path);
                    callback(null, rst);
                }
                else {
                    //添加默认测试数据，不用异步请求，两者不相关
                    ModelSerControl.addDefaultTestify(oid.toString());

                    //添加模型运行文件权限
                    if (setting.platform == 2) {
                        //
                        ModelSerModel.readCfgBypath(model_path + 'package.config', function (err, cfg) {
                            if (err) {

                            }
                            else {
                                FileOpera.chmod(model_path + cfg.start, 'exec');
                            }
                        });
                    }

                    //删除文件
                    //FileOpera.rmdir(files.file_model.path);
                    //转移模型包
                    fs.rename(files.file_model.path, setting.modelpath + 'packages/' + oid + '.zip', function (err) {
                        if (err) {
                            console.log('err in moving package!');
                        }
                    });

                    //生成新的纪录
                    var newmodelser = {
                        _id: oid,
                        ms_model: Object.assign({
                            m_name: fields.m_name,
                            m_type: fields.m_type,
                            m_url: fields.m_url,
                            p_id: md5_value
                        }, fields.m_model_append),
                        ms_limited: fields.ms_limited,
                        mv_num: fields.mv_num,
                        ms_des: fields.ms_des,
                        ms_update: date.toLocaleString(),
                        ms_platform: setting.platform,
                        ms_path: oid.toString() + '/',
                        ms_img: img,
                        ms_xml: fields.ms_xml,
                        ms_status: 0,
                        ms_user: {
                            u_name: fields.u_name,
                            u_email: fields.u_email
                        }
                    };

                    var ms = new ModelSerModel(newmodelser);
                    ModelSerModel.save(ms, function (err, data) {
                        if (err) {
                            console.log(err);
                            callback(null, {status: 0});
                        }
                        else {
                            rst.data = data;
                            callback(null, rst);
                        }
                    });
                }
            });
        };

        CommonMethod.Uncompress(files.file_model.path, model_path, function (err) {
            afterUncompress();
        });
    });
};

//region 批量部署
ModelSerControl.addBatchDeployItemsByMDL = function (ms_user, zip_path, isLocal) {
    var batch_path = path.relative(setting.modelpath, zip_path) + '\\';
    FileOpera.getAllFiles(zip_path, '.zip', function (files) {
        var addOne = function (i) {
            if (i == files.length) {
                return ModelSerControl.batchDeployByMDL(batch_path, isLocal);
            }
            var batchItem = {
                batch_path: batch_path,
                zip_path: path.relative(batch_path, zip_path + files[i]),
                deployed: false,
                ms_user: ms_user
            };
            var where = {
                batch_path: batch_path,
                zip_path: path.relative(batch_path, zip_path + files[i])
            };
            batchDeployCtrl.getByWhere(where, function (err, data) {
                if (err) {
                    return console.log(err);
                }
                else {
                    if (data.length != 0) {
                        addOne(i + 1);
                    }
                    else {
                        batchDeployCtrl.save(batchItem, function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            else {
                                addOne(i + 1);
                            }
                        })
                    }
                }
            });
        };
        if (files.length != 0)
            addOne(0);
        else
            console.log('no zip to batch deploy!');
    })
};

ModelSerControl.batchDeployByMDL = function (batch_path, isLocal) {
    var where = {
        batch_path: batch_path,
        deployed: false
    };
    batchDeployCtrl.getByWhere(where, function (err, bds) {
        var deployOne = function (i) {
            ModelSerControl.deployOneByMDL(bds[i], isLocal, function (err) {
                if (err) {
                    console.log('deploy ' + i + ' failed!');
                }
                else {
                    console.log('deploy ' + i + ' successed!');
                }
                if (i < bds.length - 1)
                    deployOne(i + 1);
            });
        };
        if (bds.length != 0)
            deployOne(0);
    })
};

//通过mdl部署
//流程：解压  读config  读mdl  组织modelservice  移动package文件  更新deployItem  更新modelservice中的m_id
ModelSerControl.deployOneByMDL = function (bdItem, isLocal, callback) {
    var msID = new ObjectId();
    var zip_path;
    if(bdItem.batch_path.indexOf(':')==-1)
        zip_path = path.join(setting.modelpath, bdItem.batch_path, bdItem.zip_path);
    else
        zip_path = bdItem.batch_path;
    var model_path = path.join(setting.modelpath, msID.toString()) + '\\';
    CommonMethod.Uncompress(zip_path, model_path, function () {
        var cfg_path = path.join(model_path, 'package.config');
        ModelSerControl.readCfgBypath(cfg_path, function (err, cfg) {
            if (err) {
                FileOpera.rmdir(model_path);
                console.log(err);
                return callback(err);
            }
            else {
                var mdl_path = path.join(model_path, cfg.mdl);
                ModelSerControl.readMDLByPath(mdl_path, function (err, mdl) {
                    if (err) {
                        FileOpera.rmdir(model_path);
                        console.log(err);
                        return callback(err);
                    }
                    else {
                        mdl = mdl.ModelClass;
                        FileOpera.getMD5(zip_path, function (err, strMD5) {
                            if (err) {
                                console.log('err in get file md5!');
                                return callback(err);
                            }
                            else {
                                var ms_des = '';
                                for (var i = 0; i < mdl.AttributeSet.LocalAttributes.LocalAttribute; i++) {
                                    ms_des += mdl.AttributeSet.LocalAttributes.LocalAttribute[i].Abstract + '\n';
                                }
                                var msItem = {
                                    _id: msID,
                                    ms_des: ms_des,
                                    ms_user: bdItem.ms_user,
                                    ms_path: msID.toString() + '\\',
                                    ms_model: {
                                        m_name: mdl.$.name,
                                        m_type: mdl.$.type,
                                        p_id: strMD5,
                                        m_url: '',
                                        m_id: ''
                                    },
                                    mv_num: '1.0',
                                    ms_status: 1,
                                    ms_limited: 0,
                                    ms_xml: null,
                                    testify: [],
                                    ms_img: null,
                                    ms_platform: setting.platform,
                                    ms_update: (new Date()).toLocaleString()
                                };

                                ModelSerControl.save(msItem, function (err, data) {
                                    if (err) {
                                        FileOpera.rmdir(model_path);
                                        console.log(err);
                                        return callback(err);
                                    }
                                    else {
                                        if (isLocal) {
                                            bdItem.deployed = true;
                                            batchDeployCtrl.update(bdItem, function (err, data) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(err)
                                                }
                                                else {
                                                    //添加默认测试数据，不用异步请求，两者不相关
                                                    ModelSerControl.addDefaultTestify(msItem._id.toString());
                                                    //转移模型包
                                                    FileOpera.copyFile(zip_path, setting.modelpath + 'packages/' + msID.toString() + '.zip');
                                                    callback(null);
                                                }
                                            });
                                        }
                                        else {
                                            var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/DeploymentPackageHandleServlet?uid=' + strMD5;
                                            remoteReqCtrl.getByServer(url, {}, function (err, res) {
                                                if (err) {
                                                    console.log('get remote portal m_id failed!');
                                                    return callback(err);
                                                }
                                                else {
                                                    bdItem.deployed = true;
                                                    batchDeployCtrl.update(bdItem, function (err, data) {
                                                        if (err) {
                                                            console.log(err);
                                                            return callback(err)
                                                        }
                                                        else {
                                                            //添加默认测试数据，不用异步请求，两者不相关
                                                            ModelSerControl.addDefaultTestify(msItem._id.toString());
                                                            //转移模型包
                                                            FileOpera.copyFile(zip_path, setting.modelpath + 'packages/' + msID.toString() + '.zip');
                                                            //更新m_id
                                                            msItem.ms_model.m_id = res.modelItemId;
                                                            ModelSerControl.update(msItem, function (err, data) {
                                                                if (err) {
                                                                    console.log('err in update model service m_id!');
                                                                    return callback(err);
                                                                }
                                                                else {
                                                                    callback(null);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                })
            }
        })
    })
};
//endregion

//将记录放置在回收站
//并删除文件
ModelSerControl.deleteToTrush = function (_oid, callback) {
    var oid = _oid;
    ModelSerModel.getByOID(_oid, function (err, item) {
        if (err) {
            return callback(err);
        }
        item.ms_status = -1;
        ModelSerModel.update(item, function (err, mess) {
            if (err) {
                return callback(err);
            }
            //删除文件
            FileOpera.rmdir(setting.modelpath + item.ms_path);
            //删除模型包
            FileOpera.rmdir(setting.modelpath + 'packages/' + oid + '.zip');
            return callback(null, item);
        });
    });
};

//根据OID查询模型服务信息
ModelSerControl.getByOID = function (msid, callback) {
    ModelSerModel.getByOID(msid, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//根据MID查询模型服务
ModelSerControl.getByMID = function (mid, callback) {
    ModelSerModel.getByMID(mid, this.returnFunction(callback, 'error in getting model service by MID'));
};

//根据PID查询模型服务
ModelSerControl.getByPID = function (mid, callback) {
    ModelSerModel.getByPID(mid, this.returnFunction(callback, 'error in getting model service by PID'));
};

//更新模型服务信息
ModelSerControl.update = function (ms, callback) {
    ModelSerModel.update(ms, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

//开启运行实例
ModelSerControl.run = function (ms_id, guid, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if (err) {
            return callback(err);
        }
        if (ms.ms_status != 1) {
            return callback({
                Error: -1,
                Message: 'Service is not available'
            });
        }
        ModelSerModel.run(ms_id, guid, function (err, stdout, stderr) {
            ModelSerRunModel.getByGUID(guid, function (err2, item) {
                if (err2) {
                    return console.log(JSON.stringify(err2));
                }
                if (item == null) {
                    return console.log('Can not find MSR when it is ended !');
                }
                if (err) {
                    item.msr_des += 'Error Message : ' + JSON.stringify(err) + '\r\n';
                }
                if (stdout) {
                    item.msr_des += 'Stand Output Message : ' + JSON.stringify(stdout) + '\r\n';
                }
                if (stderr) {
                    item.msr_des += 'Stand Error Message : ' + JSON.stringify(stderr) + '\r\n';
                }
                var mis = global.app.modelInsColl.getByGUID(guid);
                //没有配置环境，进程无法启动
                if (mis.state == "MC_READY" && mis.socket == null) {
                    global.app.modelInsColl.removeByGUID(guid);
                    item.msr_status = -1;
                    ModelSerRunModel.update(item, function (err, res) {
                        if (err) {
                            return console.log(JSON.stringify(err2));
                        }
                    })
                }
                else {
                    ModelSerRunModel.updateDes(item._id, item.msr_des, function (err, res) {
                        if (err) {
                            return console.log(JSON.stringify(err2));
                        }
                    });
                }
            });
        }, function (err, ms) {
            if (err) {
                return callback(err);
            }
            return callback(null, ms);
        });
    });

};

//获取所有门户网站模型服务
ModelSerControl.getCloudModelsers = function (callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ModelItemToContainerServlet', this.returnFunction(callback, 'error in get cloud model service'));
};

//获取模型门户所有类别
ModelSerControl.getCloudModelserCategory = function (callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetClassServlet', function (err, categories) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].children.length > 0) {
                categories[i]['nodes'] = [];
            }
            for (var j = 0; j < categories[i].children.length; j++) {
                var index = ModelSerControl.getCategoryById(categories, categories[i].children[j]);
                if (index != -1) {
                    categories[index]['backColor'] = '#FFFFFF';
                    categories[index]['text'] = categories[index]['name'];
                    if (categories[index]['isLeaf'] === 'true') {
                        categories[index]['selectable'] = true;
                        categories[index]['icon'] = "fa fa-book";
                        categories[index]['selectedIcon'] = "fa fa-check";
                    }
                    else {
                        categories[index]['selectable'] = false;
                        categories[index]['state'] = {
                            expanded: false
                        };
                    }
                    categories[i].nodes.push(categories[index]);
                }
            }
        }

        return callback(null, categories[0]);
    });
};

ModelSerControl.getCategoryById = function (array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == id) {
            return i;
        }
    }
    return -1;
};

//获取某一类别下的所有模型部署包
ModelSerControl.getCloudModelPackageByMid = function (mid, callback) {
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetDeployPackageServlet?modelItemId=' + mid, function (err, packages) {
        if (err) {
            return callback(err);
        }
        var count = 0;
        if (packages.length == 0) {
            return callback(null, packages);
        }
        var pending = function (index) {
            count++;
            return function (err, ms) {
                //此处对模型的软硬件环境进行检测
                ModelSerControl.getMatchedByPid(packages[index].id,function (err, rst) {
                    if(err){
                        return callback(err);
                    }
                    else{
                        count--;
                        if(rst){
                            packages[index].enviro = rst;
                            if (ms.length != 0) {
                                packages[index]['pulled'] = true;
                                packages[index]['ms_id'] = ms[0]._id;
                            }
                            else {
                                packages[index]['pulled'] = false;
                            }
                            if (count == 0) {
                                return callback(null, packages);
                            }
                        }
                    }
                });
            }
        };

        for (var i = 0; i < packages.length; i++) {
            if(packages[i].id && packages[i].id != '')
                ModelSerModel.getByPid(packages[i].id, pending(i));
        }
    });
};

ModelSerControl.getMatchedByPid = function (pid, callback) {
    var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetMDLFromPid?pid=' + pid;
    remoteReqCtrl.getByServer(url,null,function (err, res) {
        if(err){
            return callback(err);
        }
        else{
            res = JSON.parse(res);
            if(res.error && res.error != ''){
                return callback(null,null);
            }
            else if(res.result && res.result != ''){
                ModelSerControl.parseMDLStr(res.result,function (err, mdl) {
                    if(err){
                        return callback(err);
                    }
                    else{
                        var softDemands = [],hardDemands = [];
                        var hardJSON = mdl.ModelClass.Runtime.HardwareConfigures.INSERT;
                        var softJSON = mdl.ModelClass.Runtime.SoftwareConfigures.INSERT;
                        if(hardJSON == undefined)
                            hardJSON = [];
                        if(softJSON == undefined)
                            softJSON = [];
                        for(var i=0;i<hardJSON.length;i++){
                            hardDemands.push({name:hardJSON[i].$.name,value:hardJSON[i]._});
                        }
                        for(var j=0;j<softJSON.length;j++){
                            softDemands.push({
                                name:softJSON[j].$.name,
                                platform:softJSON[j].$.platform == undefined?'':softJSON[j].$.platform,
                                version:softJSON[j]._
                            });
                        }
                        var matchedRst = {};
                        SWECtrl.ensMatched(softDemands,function (rst) {
                            rst = JSON.parse(rst);
                            matchedRst.swe = rst;
                            HWECtrl.ensMatched(hardDemands,function (rst) {
                                rst = JSON.parse(rst);
                                matchedRst.hwe = rst;
                                return callback(null,matchedRst);
                            })
                        })
                    }
                });
            }
        }
    })
};

//获取某一类别下的所有模型
ModelSerControl.getCloudModelByCategoryId = function (id, callback) {
    remoteReqCtrl.postRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/ModelItemServlet?nameId=' + id, function (err, items) {
        if (err) {
            return callback(err);
        }
        if (items.length == 0) {
            return callback(null, items);
        }
        var count = 0;
        var pending = function (index) {
            count++;
            return function (err, mss) {
                if (mss.length != 0) {
                    items[index]['pulled'] = true;
                }
                else {
                    items[index]['pulled'] = false;
                }
                count--;
                if (count == 0) {
                    return callback(null, items);
                }
            }

        };
        for (var i = 0; i < items.length; i++) {
            ModelSerModel.getByMID(items[i].model_id, pending(i));
        }
    });
};

//上传模型部署包
ModelSerControl.uploadPackage = function (msid, mid, pkg_name, pkg_version, pkg_des, portal_uname, portal_pwd, callback) {
    var pending = function () {
        SystemCtrl.loginPortal(portal_uname, portal_pwd, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result) {
                var pending2 = function () {
                    remoteReqCtrl.postRequestJSONWithFormData('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/UploadPackageZipServlet', {
                        id: mid,
                        file: fs.createReadStream(setting.modelpath + 'packages/' + msid + '.zip')
                    }, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        if (data == null) {
                            return callback(new Error('portal result in null!'));
                        }
                        if (data.result == 'no') {
                            return callback(new Error('Error in login portal!'));
                        }
                        var resJson = data;
                        var url = 'http://' + setting.portal.host + ':' + setting.portal.port +
                            '/GeoModeling/DeploymentPackageHandleServlet';
                        // '?calcName=' + pkg_name + '&calcDesc=' + pkg_des + '&calcPlatform=1&modelItemId=' + mid + '&calcFcId=' + resJson.fcId + '&calcFileName=' + resJson.result;
                        url = encodeURI(url);
                        remoteReqCtrl.postRequestJSONWithForm(url, {
                            calcName: pkg_name,
                            calcDesc: pkg_des,
                            calcPlatform: 1,
                            modelItemId: mid,
                            calcFcId: resJson.fcId,
                            calcFileName: resJson.result
                        }, function (err, data) {
                            if (err) {
                                return callback(err);
                            }
                            if (data.result == 'no') {
                                return callback(new Error('Link fail in portal !'));
                            }
                            ModelSerModel.getByOID(msid, function (err, item) {
                                if (err) {
                                    return callback(err);
                                }
                                item.ms_model.m_id = mid;
                                item.ms_model.p_id = data.result;
                                ModelSerModel.update(item, function (err, result) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    return callback(null, {
                                        fcid: resJson.fcId,
                                        p_id: data
                                    });
                                })
                            });
                        });
                    });
                };
                if (!fs.existsSync(setting.modelpath + 'packages/' + msid + '.zip')) {
                    CommonMethod.compress(setting.modelpath + 'packages/' + msid + '.zip', setting.modelpath + msid);
                }
                pending2();
            }
            else {
                return callback(new Error('Login fail!', -1));
            }
        });
    };

    if (!portal_uname) {
        SystemCtrl.getPortalToken(function (err, token) {
            if (err) {
                return callback(err);
            }
            portal_uname = token['portal_uname'];
            portal_pwd = token['portal_pwd'];
            pending();
        });
    }
    else {
        pending();
    }
};

//得到初始输入数据
ModelSerControl.getInputData = function (ms_id, callback) {
    ModelSerModel.getByOID(ms_id, function (err, ms) {
        if (err) {
            return callback(err);
        }
        ModelSerModel.readMDL(ms, function (err, mdl) {
            if (err) {
                return callback(err);
            }
            try {
                var dataDecs = null;
                if (mdl.ModelClass.Behavior.RelatedDatasets != null) {
                    dataDecs = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
                }
                else if (mdl.ModelClass.Behavior.DatasetDeclarations != null) {
                    dataDecs = mdl.ModelClass.Behavior.DatasetDeclarations.DatasetDeclaration;
                }
                var state = mdl.ModelClass.Behavior.StateGroup.States.State;
                if (state instanceof Array) {
                    for (var k = 0; k < state.length; k++) {
                        for (var i = 0; i < state[k].Event.length; i++) {
                            for (var j = 0; j < dataDecs.length; j++) {
                                if (state[k].Event[i].hasOwnProperty('ResponseParameter')) {
                                    if (state[k].Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if (state[k].Event[i].hasOwnProperty('DispatchParameter')) {
                                    if (state[k].Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                                else if (state[k].Event[i].hasOwnProperty('ControlParameter')) {
                                    if (state[k].Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name) {
                                        if (dataDecs[j].UDXDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                        else if (dataDecs[j].UdxDeclaration) {
                                            state[k].Event[i].UDXDeclaration = dataDecs[j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return callback(null, state);
                }
                else {
                    for (var i = 0; i < state.Event.length; i++) {
                        for (var j = 0; j < dataDecs.length; j++) {
                            if (state.Event[i].hasOwnProperty('ResponseParameter')) {
                                if (state.Event[i].ResponseParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state.Event[i].hasOwnProperty('DispatchParameter')) {
                                if (state.Event[i].DispatchParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                            else if (state.Event[i].hasOwnProperty('ControlParameter')) {
                                if (state.Event[i].ControlParameter.$.datasetReference == dataDecs[j].$.name) {
                                    if (dataDecs[j].UDXDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                    else if (dataDecs[j].UdxDeclaration) {
                                        state.Event[i].UDXDeclaration = dataDecs[j];
                                    }
                                }
                            }
                        }
                    }
                    var arr = [state];
                    return callback(null, arr);
                }
            }
            catch (newerr) {
                console.log('Error in data makeup ; ' + newerr);
                return callback(newerr);
            }
        });
    });
};

ModelSerControl.readMDLByPath = function (path, callback) {
    ModelSerModel.readMDLByPath(path, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    })
};

ModelSerControl.parseMDLStr = function (mdlStr, callback) {
    ModelSerModel.parseMDLStr(mdlStr,function (err, json) {
        if(err){
            return callback(err);
        }
        else{
            return callback(null,json);
        }
    })
};

ModelSerControl.readCfg = function (ms, callback) {
    ModelSerModel.readCfg(ms, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelSerControl.readCfgBypath = function (path, callback) {
    ModelSerModel.readCfgBypath(path, function (err, data) {
        if (err) {
            return callback(err);
        }
        return callback(null, data);
    });
};

ModelSerControl.getRmtPreparationData = function (host, msid, callback) {
    if (ParamCheck.checkParam(callback, host)) {
        if (ParamCheck.checkParam(callback, msid)) {
            Child.getByHost(host, function (err, child) {
                if (err) {
                    return callback(err);
                }
                if (ParamCheck.checkParam(callback, child)) {
                    remoteReqCtrl.getRequestJSON('http://' + child.host + ':' + child.port + '/modelser/json/' + msid, function (err, data) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, data);
                    });
                }
            });
        }
    }
};

//将testify文件夹下的测试数据添加到config.json中，同时将测试数据记录在redis中，将数据复制到geo_data中
//callback完全是为了同步和异步而设
ModelSerControl.addDefaultTestify = function (msid, callback) {
    if (!callback) {
        callback = function () {};
    }
    var testifyRoot = setting.modelpath + msid + '/testify';
    var configPath = setting.modelpath + msid + '/testify/config.json';
    var configData;
    fs.stat(configPath, function (err, stat) {
        if (err) {
            if (err.code = 'ENOENT') {
                configData = '[]';
            }
            else {
                return callback()
            }
        }
        else if (stat) {
            configData = fs.readFileSync(configPath).toString();
        }
        var configJSON = JSON.parse(configData);
        for (var i = 0; i < configJSON.length; i++) {
            if (configJSON[i].tag == 'default') {
                //已经生成过默认测试数据
                return callback()
            }
        }
        //得到testify一级目录下的所有xml
        FileOpera.getAllFiles(testifyRoot, '.xml', function (files) {
            ModelSerControl.getInputData(msid, function (err, states) {
                if (err) {
                    return callback();
                }
                var newTestify = {
                    tag: 'default',
                    detail: '',
                    path: '',
                    inputs: []
                };
                var geodataList = [];
                //针对博文的所有测试数据都是input的情况
                if (states.length == 1 && states[0].$.name == 'RUNSTATE') {
                    var stateID = states[0].$.id;
                    var events = states[0].Event;
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].$.name == 'LOADDATASET' && events[i].$.type == 'response') {
                            for (var j = 0; j < files.length; j++) {
                                if (files[j] == 'input.xml') {
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = __dirname + '/../geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/input.xml').toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId: gdid,
                                        Event: events[i].$.name,
                                        Optional: events[i].$.optional,
                                        StateId: stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if (stat.size - 16 > setting.data_size) {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'FILE',
                                            gd_value: fname
                                        };
                                    }
                                    else {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'STREAM',
                                            gd_value: gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                else {
                    for (var i = 0; i < states.length; i++) {
                        var stateID = states[i].$.id;
                        var events = states[i].Event;
                        for (var j = 0; j < events.length; j++) {
                            for (var k = 0; k < files.length; k++) {
                                if (events[j].$.name + '.xml' == files[k] && events[j].$.type == 'response') {
                                    //复制文件
                                    var gdid = 'gd_' + uuid.v1();
                                    var fname = gdid + '.xml';
                                    var geo_data_Path = __dirname + '/../geo_data/' + fname;
                                    var gd_value = fs.readFileSync(testifyRoot + '/' + files[i]).toString();
                                    fs.writeFileSync(geo_data_Path, gd_value);
                                    //向config.json中添加记录
                                    newTestify.inputs.push({
                                        DataId: gdid,
                                        Event: events[j].$.name,
                                        Optional: events[j].$.optional,
                                        StateId: stateID
                                    });

                                    var stat = fs.statSync(geo_data_Path);
                                    var geodata;
                                    if (stat.size - 16 > setting.data_size) {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'FILE',
                                            gd_value: fname
                                        };
                                    }
                                    else {
                                        geodata = {
                                            gd_id: gdid,
                                            gd_tag: '',
                                            gd_type: 'STREAM',
                                            gd_value: gd_value
                                        }
                                    }
                                    geodataList.push(geodata);
                                }
                            }
                        }
                    }
                }
                var addFile = function (i) {
                    //向redis中添加记录
                    GeoDataCtrl.addData(geodataList[i], function (err, rst) {
                        if (err) {
                            return callback()
                        }
                        else {
                            if (i < geodataList.length - 1) {
                                addFile(i + 1);
                            }
                            else {
                                if (geodataList.length == 0) {
                                    fs.writeFileSync(configPath, '[]');
                                }
                                else {
                                    //没有出错在向config.json中添加记录
                                    configJSON.push(newTestify);
                                    fs.writeFileSync(configPath, JSON.stringify(configJSON));
                                }
                                return callback();
                            }
                        }
                    });
                };
                if (geodataList.length)
                    addFile(0);
                else
                    callback();
            });
        });
    });
};

ModelSerControl.addTestify = function (msrid, testifyData, callback) {
    ModelSerRunModel.getByOID(msrid, function (err, msr) {
        if (err) {
            return callback(err);
        }
        var configRoot = setting.modelpath + msr.ms_id + '/testify';
        var configPath = configRoot + '/config.json';
        fs.stat(configPath, function (err, stat) {
            var configJSON;
            if (stat && !err) {
                var configData = fs.readFileSync(configPath).toString();
                if (configData == "") {
                    configData = "[]";
                }
                configJSON = JSON.parse(configData);
                //判断是否已添加该测试记录
                for (var i = 0; i < configJSON.length; i++) {
                    if (configJSON[i].DataId == msrid) {
                        return callback(null, {suc: true, status: 2});
                    }
                }
            }
            else if (err.code = 'ENOENT') {
                configJSON = [];
            }
            else {
                callback(err);
            }
            var newTestify = configRoot + '/' + msrid;
            try {
                fs.mkdirSync(newTestify);
            }
            catch (e) {
                if (e.code != 'EEXIST')
                    return callback(err);
            }
            for (var i = 0; i < msr.msr_input.length; i++) {
                if (msr.msr_input[i].DataId != "") {
                    var srcPath = __dirname + '/../geo_data/' + msr.msr_input[i].DataId + '.xml';
                    var dstPath = newTestify + '/' + msr.msr_input[i].DataId + '.xml';
                    try {
                        if (fs.existsSync(srcPath)) {
                            var srcData = fs.readFileSync(srcPath).toString();
                            fs.writeFileSync(dstPath, srcData);
                        }
                    }
                    catch (e) {
                        callback(e);
                    }
                }
            }


            //添加记录
            testifyData.inputs = [];
            for (var i = 0; i < msr.msr_input.length; i++) {
                if (msr.msr_input[i].DataId != "") {
                    var input = {
                        DataId: msr.msr_input[i].DataId,
                        Event: msr.msr_input[i].Event,
                        Optional: msr.msr_input[i].Optional,
                        StateId: msr.msr_input[i].StateId
                    };
                    testifyData.inputs.push(input);
                }
            }
            configJSON.push(testifyData);
            fs.writeFile(configPath, JSON.stringify(configJSON), function (err) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
                callback(null, {suc: true, status: 1});
            })
        })
    })
};

ModelSerControl.getTestify = function (msid, callback) {
    var configPath = setting.modelpath + msid + '/testify/config.json';
    fs.stat(configPath, function (err, stat) {
        var rst;
        if (err) {
            if (err.code = 'ENOENT') {
                rst = {status: 0, testifies: []};
            }
            else {
                rst = {status: -1};
            }
        }
        else if (stat) {
            var testifyData = fs.readFileSync(configPath).toString();
            rst = {status: 1, testifies: JSON.parse(testifyData)};
        }
        rst = JSON.stringify(rst);
        callback(rst);
    })
};

ModelSerControl.delTestify = function (msid, testifyPath, callback) {
    var testifyFolder = setting.modelpath + msid + '/testify/' + testifyPath;
    var configPath = setting.modelpath + msid + '/testify/config.json';
    var configData = fs.readFileSync(configPath).toString();
    var configJSON = JSON.parse(configData);
    try {
        //删除记录
        for (var i = 0; i < configJSON.length; i++) {
            if (testifyPath == configJSON[i].path) {
                configJSON.splice(i, 1);
                break;
            }
        }
        fs.writeFileSync(configPath, JSON.stringify(configJSON));
        //删除文件
        FileOpera.rmdir(testifyFolder);
        callback(JSON.stringify({suc: true}));
    }
    catch (e) {
        return callback(JSON.stringify({suc: false}));
    }
};

//从门户网站或本机获取runtime节点
ModelSerControl.getRuntimeByPid = function (pid, place, cb) {
    var runtime = {};
    if(place == 'local'){
        ModelSerModel.getByPID(pid,function (err, ms) {
            if(err){
                return cb(err);
            }
            else{
                if(!ms || ms.length ==0)
                    return cb({code:'查不到对应模型！'});
                ms = ms[0];
                ModelSerModel.readMDL(ms,function (err, mdl) {
                    if(err){
                        return cb(err);
                    }
                    else{
                        if(!mdl)
                            return cb({code:'解析模型MDL出错！'});
                        ModelSerControl.getRuntimeFromMDL(mdl,function (demands) {
                            return cb(null,demands);
                        });
                    }
                })
            }
        })
    }
    else if(place == 'portal'){
        var url = 'http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetMDLFromPid?pid=' + pid;
        remoteReqCtrl.getByServer(url,null,function (err, res) {
            if(err){
                return cb(err);
            }
            else{
                res = JSON.parse(res);
                if(res.error && res.error != ''){
                    return cb({code:res.error});
                }
                else if(res.result && res.result != ''){
                    ModelSerControl.parseMDLStr(res.result,function (err, mdl) {
                        if(err){
                            return cb(err);
                        }
                        else{
                            ModelSerControl.getRuntimeFromMDL(mdl,function (demands) {
                                return cb(null,demands);
                            })
                        }
                    });
                }
            }
        })
    }
};

ModelSerControl.getRuntimeFromMDL = function (mdl, cb) {
    var softDemands = [],hardDemands = [];
    var hardJSON = mdl.ModelClass.Runtime.HardwareConfigures.INSERT;
    var softJSON = mdl.ModelClass.Runtime.SoftwareConfigures.INSERT;
    if(hardJSON == undefined)
        hardJSON = [];
    if(softJSON == undefined)
        softJSON = [];
    for(var i=0;i<hardJSON.length;i++){
        hardDemands.push({name:hardJSON[i].$.name,value:hardJSON[i]._});
    }
    for(var j=0;j<softJSON.length;j++){
        softDemands.push({
            name:softJSON[j].$.name,
            platform:softJSON[j].$.platform == undefined?'':softJSON[j].$.platform,
            version:softJSON[j]._
        });
    }
    cb({
        swe:softDemands,
        hwe:hardDemands
    });
};

module.exports = ModelSerControl;