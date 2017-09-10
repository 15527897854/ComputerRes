var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var ModelIns = require('./model/modelInstance');
var ModelInsCollection = require('./model/modelInsCollection');
var FileUploadRecord = require('./model/fileUpload');
var init = require('./init');
var settings = require('./setting');
var SysCtrl = require('./control/sysControl');

var routes = require('./routes/index');

var app = express();
global.app = app;

//init setting
init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit:'10000000kb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret:'wfsiudhjkfhoihiewhrlkjflkjasd',
  cookie:{maxAge : 3600000 * 2},
  resave:false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//正在运行的模型实例集合
app.modelInsColl = new ModelInsCollection();

//创建文件传输记录变量
global.fileupload = new FileUploadRecord();

//http request
routes(app);

//socket connection
var socket = require('./socket/mc_socket');
var sockTrans = socket(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//debug for model-instance
if(settings.debug)
{
  var date = new Date();
  var mis = {
    guid : settings.debugGUID,
    socket : null,
    ms : {
        "_id" : "59b14396ae51264b5473825f",
        "ms_model" : {
            "m_register" : false,
            "m_id" : null,
            "p_id" : "efc078ce7205ea84a3d78901c5edd5eb",
            "m_url" : "http://hydrology.usu.edu/taudem/taudem5/",
            "m_type" : "TaiHu_Fvcom - DEM",
            "m_name" : "TaiHu_Fvcom"
        },
        "mv_num" : "1.1.0.0",
        "ms_des" : "TaiHu_Fvcom",
        "ms_platform" : 1,
        "ms_update" : "2017-9-7 21:03:18",
        "ms_path" : "TaiHu_Fvcom_59b14396ae51264b5473825f/",
        "ms_img" : null,
        "ms_xml" : "{\"ModelClass\":{\"$\":{\"name\":\"TaiHu_Fvcom\",\"uid\":\"227f5ee8-cdb9-4a8a-a849-05c693936303\",\"style\":\"SimpleCalculation\"},\"AttributeSet\":{\"Categories\":{\"Category\":{\"$\":{\"principle\":\"DEM\",\"path\":\"TaiHu_Fvcom\"}}},\"LocalAttributes\":{\"LocalAttribute\":{\"$\":{\"local\":\"EN_US\",\"localName\":\"TaiHu_Fvcom\",\"wiki\":\"http://hydrology.usu.edu/taudem/taudem5/\"},\"Keywords\":\"TaiHu; Fvcom\",\"Abstract\":\"TaiHu_Fvcom\"}}},\"Behavior\":{\"RelatedDatasets\":{\"DatasetItem\":[{\"$\":{\"name\":\"TaiHu_Run_Param\",\"type\":\"internal\",\"description\":\"TaiHu_Run\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_COD_Param\",\"type\":\"internal\",\"description\":\"TaiHu_COD\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_DO_Param\",\"type\":\"internal\",\"description\":\"TaiHu_DO\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_PHYT_Param\",\"type\":\"internal\",\"description\":\"TaiHu_PHYT\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_bfw_Param\",\"type\":\"internal\",\"description\":\"TaiHu_bfw\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_cor_Param\",\"type\":\"internal\",\"description\":\"TaiHu_cor\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_dep_Param\",\"type\":\"internal\",\"description\":\"TaiHu_dep\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_grd_Param\",\"type\":\"internal\",\"description\":\"TaiHu_grd\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_its_Param\",\"type\":\"internal\",\"description\":\"TaiHu_its\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_mc_Param\",\"type\":\"internal\",\"description\":\"TaiHu_mc\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_obc_Param\",\"type\":\"internal\",\"description\":\"TaiHu_obc\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_riv_Param\",\"type\":\"internal\",\"description\":\"TaiHu_riv\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_riv_wqm_Param\",\"type\":\"internal\",\"description\":\"TaiHu_riv_wqm\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_spg_Param\",\"type\":\"internal\",\"description\":\"TaiHu_spg\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_grd_topo_Param\",\"type\":\"internal\",\"description\":\"TaiHu_grd_topo\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"TaiHu_windstaion_Param\",\"type\":\"internal\",\"description\":\"TaiHu_windstaion\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}},{\"$\":{\"name\":\"Taihu_topo_Param\",\"type\":\"internal\",\"description\":\"Taihu_topo\"},\"UdxDeclaration\":{\"UdxNode\":\"\"}}]},\"StateGroup\":{\"States\":{\"State\":{\"$\":{\"id\":\"680b2271-26d9-4cad-b85d-92511c0867ad\",\"name\":\"TaiHuFvcomState\",\"type\":\"basic\",\"description\":\"TaiHuFvcomState\"},\"Event\":[{\"$\":{\"name\":\"TaiHu_Run\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_Run\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_Run_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_COD\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_COD\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_COD_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_DO\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_DO\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_DO_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_PHYT\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_PHYT\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_PHYT_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_bfw\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_bfw\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_bfw_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_cor\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_cor\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_cor_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_dep\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_dep\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_dep_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_grd\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_grd\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_grd_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_its\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_its\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_its_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_mc\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_mc\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_mc_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_obc\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_obc\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_obc_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_riv\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_riv\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_riv_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_riv_wqm\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_riv_wqm\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_riv_wqm_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_spg\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_spg\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_spg_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_grd_topo\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_grd_topo\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_grd_topo_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"TaiHu_windstaion\",\"type\":\"response\",\"optional\":0,\"description\":\"Input TaiHu_windstaion\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"TaiHu_windstaion_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"Taihu_topo\",\"type\":\"noresponse\",\"optional\":0,\"description\":\"Ouput Taihu_topo\"},\"DispatchParameter\":{\"$\":{\"datasetReference\":\"Taihu_topo_Param\",\"description\":\"Export\"}}}]}},\"StateTransitions\":\"\"}},\"Runtime\":{\"$\":{\"name\":\"TaiHu_Fvcom\",\"version\":\"1.1.0.0\",\"baseDir\":\"$(ModelServicePath)\\\\TaiHu_Fvcom\",\"entry\":\"TaiHu_Fvcom.exe\"},\"HardwareConfigures\":{\"Add\":{\"$\":{\"key\":\"Main Frequency\",\"value\":\"2.8\"}}},\"SoftwareConfigures\":{\"Add\":[{\"$\":{\"key\":\"Operation Platform\",\"value\":\"Windows\"}},{\"$\":{\"key\":\"Language Platform\",\"value\":\"MSVC 2013 x64\"}},{\"$\":{\"key\":\"Language Platform\",\"value\":\"C# 2010\"}},{\"$\":{\"key\":\"Memory Size\",\"value\":\"50M\"}}]},\"Assemblies\":{\"Assembly\":[{\"$\":{\"name\":\"GDALRasterMapping.exe\",\"path\":\"$(DataMappingPath)\\\\GDALRasterMapping\\\\\"}},{\"$\":{\"name\":\"OGRVectorMapping.exe\",\"path\":\"$(DataMappingPath)\\\\OGRVectorMapping\\\\\"}},{\"$\":{\"name\":\"TauDEM_Path\",\"path\":\"$(ModelServicePath)\\\\TauDEM5Exe\\\\\"}}]},\"SupportiveResources\":{\"Add\":[{\"$\":{\"type\":\"library\",\"name\":\"GDAL\"}},{\"$\":{\"type\":\"runtime\",\"name\":\"MSMPI\"}}]}}}}",
        "ms_status" : 1,
        "ms_user" : {
            "u_email" : "[Unknown]",
            "u_name" : "[Unknown]"
        },
        "ms_limited" : 0,
        "ms_permission" : 0,
    },
    log : [],
    input : [
        
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_Run",
            "DataId" : "gd_85068e20-93c1-11e7-adf5-016261c89e77",
            "Tag" : "taihu_run.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_COD",
            "DataId" : "gd_a7065230-93c1-11e7-adf5-016261c89e77",
            "Tag" : "COD.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_DO",
            "DataId" : "gd_ac469ed0-93c1-11e7-adf5-016261c89e77",
            "Tag" : "DO.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_PHYT",
            "DataId" : "gd_affc2cc0-93c1-11e7-adf5-016261c89e77",
            "Tag" : "PHYT.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_bfw",
            "DataId" : "gd_d9da2ef0-93c3-11e7-adf5-016261c89e77",
            "Tag" : "taihu_bfw.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_cor",
            "DataId" : "gd_f5f2b800-93c3-11e7-adf5-016261c89e77",
            "Tag" : "taihu_cor.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_dep",
            "DataId" : "gd_fecc09e0-93c3-11e7-adf5-016261c89e77",
            "Tag" : "taihu_dep.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_grd",
            "DataId" : "gd_02f36c70-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_grd.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_its",
            "DataId" : "gd_1196fb70-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_its.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_mc",
            "DataId" : "gd_1b86ed70-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_mc.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_obc",
            "DataId" : "gd_2ed7fef0-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_obc.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_riv",
            "DataId" : "gd_354077e0-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_riv.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_riv_wqm",
            "DataId" : "gd_67f0b1f0-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_riv_wqm.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_spg",
            "DataId" : "gd_6fa3d350-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihu_spg.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_grd_topo",
            "DataId" : "gd_72a3a5d0-93c4-11e7-adf5-016261c89e77",
            "Tag" : "taihut_grd_topo.dat",
            "Destroyed" : false,
            "Optional" : 0
        }, 
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "TaiHu_windstaion",
            "DataId" : "gd_7f0d7170-93c4-11e7-adf5-016261c89e77",
            "Tag" : "windstation.dat",
            "Destroyed" : false,
            "Optional" : 0
        }
    ],
    output : [
        {
            "StateId" : "680b2271-26d9-4cad-b85d-92511c0867ad",
            "StateName" : "TaiHuFvcomState",
            "StateDes" : "TaiHuFvcomState",
            "Event" : "Taihu_topo",
            "Destroyed" : false,
            "Tag" : "TaiHuFvcomState-Taihu_topo",
            "DataId" : "gd_643ce2a0-93cd-11e7-96fa-0b4283413b10"
        }

    ],
    start : date.toLocaleString(),
    state : 'MC_READY'
  };
  var modelIns = new ModelIns(mis);
  app.modelInsColl.addIns(modelIns);
  global.debug = '调试模式';
}

var ip = SysCtrl.getIPSync();
if(ip){
    app.centerHost = SysCtrl.getIPSync();
    app.centerPort = settings.port;
}
module.exports = app;
