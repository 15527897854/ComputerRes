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
        "_id" : "5989c9c350aed72b1c8a9b1e",
        "ms_model" : {
            "m_register" : false,
            "m_id" : null,
            "p_id" : "469f7bc5f572d284bbad8863dc27d4b4",
            "m_url" : "http://hydrology.usu.edu/taudem/taudem5/",
            "m_type" : "TauDEM_AreaD8 - DEM",
            "m_name" : "TauDEM_AreaD8"
        },
        "mv_num" : "1.1.0.0",
        "ms_des" : "TauDEM_AreaD8",
        "ms_platform" : 1,
        "ms_update" : "2017-8-8 22:25:07",
        "ms_path" : "TauDEM_AreaD8_5989c9c350aed72b1c8a9b1e/",
        "ms_img" : null,
        "ms_xml" : "{\"ModelClass\":{\"$\":{\"name\":\"TauDEM_AreaD8\",\"uid\":\"d91e7c3f-41b3-4f62-a457-21c459dc8cfe\",\"style\":\"SimpleCalculation\"},\"AttributeSet\":{\"Categories\":{\"Category\":{\"$\":{\"principle\":\"DEM\",\"path\":\"TauDEM_AreaD8\"}}},\"LocalAttributes\":{\"LocalAttribute\":{\"$\":{\"local\":\"EN_US\",\"localName\":\"TauDEM_AreaD8\",\"wiki\":\"http://hydrology.usu.edu/taudem/taudem5/\"},\"Keywords\":\"TauDEM; AreaD8\",\"Abstract\":\"TauDEM_AreaD8\"}}},\"Behavior\":{\"RelatedDatasets\":{\"DatasetItem\":[{\"$\":{\"name\":\"Raster_Template\",\"type\":\"external\",\"externalId\":\"F73F31FF-2F23-4C7A-A57D-39D0C7A6C4E6\",\"description\":\"Raster_Data\"}},{\"$\":{\"name\":\"Vector_Template\",\"type\":\"external\",\"externalId\":\"4996E027-209B-4121-907B-1ED36A417D22\",\"description\":\"Vector_Data\"}},{\"$\":{\"name\":\"EdgeContamination_Param\",\"type\":\"internal\",\"description\":\"EdgeContamination\"},\"UdxDeclaration\":{\"UdxNode\":{\"UdxNode\":{\"$\":{\"name\":\"checkEdge\",\"type\":\"DTKT_INT\",\"description\":\"checkEdge\"}}}}}]},\"StateGroup\":{\"States\":{\"State\":{\"$\":{\"id\":\"851a1985-a3f6-4c13-be53-f1c765022929\",\"name\":\"RUNSTATE\",\"type\":\"basic\",\"description\":\"Model Start Runing\"},\"Event\":[{\"$\":{\"name\":\"D8FlowDirection\",\"type\":\"response\",\"optional\":\"False\",\"description\":\"Input D8FlowDirection\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"Raster_Template\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"Outlets\",\"type\":\"response\",\"optional\":\"True\",\"description\":\"Input Outlets\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"Vector_Template\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"WeightGrid\",\"type\":\"response\",\"optional\":\"True\",\"description\":\"Input WeightGrid\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"Raster_Template\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"EdgeContamination\",\"type\":\"response\",\"optional\":\"True\",\"description\":\"Input EdgeContamination\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"EdgeContamination_Param\",\"description\":\"Load\"}}},{\"$\":{\"name\":\"AreaD8\",\"type\":\"noresponse\",\"optional\":\"False\",\"description\":\"Ouput AreaD8\"},\"DispatchParameter\":{\"$\":{\"datasetReference\":\"Raster_Template\",\"description\":\"Export\"}}}]}},\"StateTransitions\":\"\"}},\"Runtime\":{\"$\":{\"name\":\"TauDEM_AreaD8\",\"version\":\"1.1.0.0\",\"baseDir\":\"$(ModelServicePath)\\\\TauDEM_AreaD8\",\"entry\":\"TauDEM_AreaD8.exe\"},\"HardwareConfigures\":{\"Add\":{\"$\":{\"key\":\"Main Frequency\",\"value\":\"2.8\"}}},\"SoftwareConfigures\":{\"Add\":{\"$\":{\"key\":\"Memory Size\",\"value\":\"50M\"}}},\"Assemblies\":{\"Assembly\":[{\"$\":{\"name\":\"GDALRasterMapping.exe\",\"path\":\"$(DataMappingPath)\\\\GDALRasterMapping\\\\\"}},{\"$\":{\"name\":\"OGRVectorMapping.exe\",\"path\":\"$(DataMappingPath)\\\\OGRVectorMapping\\\\\"}}]},\"SupportiveResources\":{\"Add\":[{\"$\":{\"type\":\"library\",\"name\":\"GDAL\"}},{\"$\":{\"type\":\"runtime\",\"name\":\"MSMPI\"}}]}}}}",
        "ms_status" : 1,
        "ms_user" : {
            "u_email" : "[Unknown]",
            "u_name" : "[Batch]"
        },
        "ms_permission" : 0,
        "__v" : 0
    },
    log : [],
    input : [
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "RUNSTATE",
            "StateDes" : "Model Start Runing",
            "Event" : "D8FlowDirection",
            "DataId" : "gd_309ecda0-7c49-11e7-9659-a1f3754f22b6",
            "Tag" : "udx_zip_D8FlowDir.zip",
            "Destroyed" : false,
            "Optional" : "False"
        }, 
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "RUNSTATE",
            "StateDes" : "Model Start Runing",
            "Event" : "Outlets",
            "DataId" : "gd_9c78dc40-7c4a-11e7-935e-f33d689b3c28",
            "Tag" : "udx_zip_Outlets.zip",
            "Destroyed" : false,
            "Optional" : "True"
        }, 
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "RUNSTATE",
            "StateDes" : "Model Start Runing",
            "Event" : "WeightGrid",
            "DataId" : "gd_489d2a60-7cd4-11e7-b70f-750b08f27d27",
            "Tag" : "udx_zip_PeukerDouglas.zip",
            "Destroyed" : false,
            "Optional" : "1"
        }, 
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "RUNSTATE",
            "StateDes" : "Model Start Runing",
            "Event" : "EdgeContamination",
            "DataId" : "gd_4fb2d340-7cd4-11e7-b70f-750b08f27d27",
            "Tag" : "udx_xml_EdgeFlag.xml",
            "Destroyed" : false,
            "Optional" : "1"
        }
    ],
    output : [
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "RUNSTATE",
            "StateDes" : "Model Start Runing",
            "Event" : "AreaD8",
            "Destroyed" : false,
            "Tag" : "RUNSTATE-AreaD8",
            "DataId" : "gd_64275620-7cd4-11e7-b70f-750b08f27d27"
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
