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
app.use(bodyParser.json());
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
        "_id" : "597fc4fa2e72f22ac0799a7a",
        "ms_model" : {
            "m_register" : false,
            "m_id" : null,
            "p_id" : "c42aa27059c22e634f5a285f500663d9",
            "m_url" : "http://en.njnu.edu.cn",
            "m_type" : "DEM分类/基本地形参数 - DEM分类",
            "m_name" : "TestModel"
        },
        "mv_num" : "1.0",
        "ms_des" : "TestModel",
        "ms_platform" : 1,
        "ms_update" : "2017-8-1 08:02:02",
        "ms_path" : "597fc4fa2e72f22ac0799a7a/",
        "ms_img" : null,
        "ms_xml" : "{\"ModelClass\":{\"$\":{\"name\":\"TestModel\",\"uid\":\"EB7CD4DF-E606-4B43-907E-1C5B4C024A59\",\"style\":\"SimpleCalculation\"},\"AttributeSet\":{\"Categories\":{\"Category\":{\"$\":{\"principle\":\"DEM分类\",\"path\":\"DEM分类/基本地形参数\"}}},\"LocalAttributes\":{\"LocalAttribute\":{\"$\":{\"local\":\"EN_US\",\"wiki\":\"http://en.njnu.edu.cn\",\"localName\":\"TestModel\"},\"Keywords\":\"TestModel\",\"Abstract\":\"TestModel\"}}},\"Behavior\":{\"RelatedDatasets\":{\"DatasetItem\":[{\"$\":{\"name\":\"INIT_PARAMETER\",\"description\":\"初始参数数据集\",\"type\":\"internal\"},\"UdxDeclaration\":{\"$\":{\"name\":\"INIT_PARAMETER\",\"description\":\"\"},\"UdxNode\":{\"UdxNode\":[{\"$\":{\"name\":\"sourceFileName\",\"type\":\"external\",\"description\":\"\",\"externalId\":\"F73F31FF-2F23-4C7A-A57D-39D0C7A6C4E6\"}},{\"$\":{\"name\":\"winSize\",\"type\":\"DTKT_INT\",\"description\":\"\"}}]}}},{\"$\":{\"name\":\"OUTPUT_PARAMETER\",\"description\":\"运算结果数据集\",\"type\":\"external\",\"externalId\":\"F73F31FF-2F23-4C7A-A57D-39D0C7A6C4E6\"}}]},\"StateGroup\":{\"States\":{\"State\":[{\"$\":{\"id\":\"851a1985-a3f6-4c13-be53-f1c765022929\",\"name\":\"state1\",\"description\":\"模型开始运行\",\"type\":\"basic\"},\"Event\":[{\"$\":{\"name\":\"event1\",\"description\":\"加载运行参数\",\"type\":\"response\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"INIT_PARAMETER\"}}},{\"$\":{\"name\":\"event2\",\"description\":\"计算并返回运算结果\",\"type\":\"noresponse\"},\"DispatchParameter\":{\"$\":{\"datasetReference\":\"OUTPUT_PARAMETER\"}}}]},{\"$\":{\"id\":\"B62ACC53-0DDF-4553-B71E-132753AD160F\",\"name\":\"state2\",\"description\":\"模型结束运行\",\"type\":\"basic\"},\"Event\":{\"$\":{\"name\":\"event1\",\"description\":\"加载运行参数\",\"type\":\"noresponse\"},\"ResponseParameter\":{\"$\":{\"datasetReference\":\"INIT_PARAMETER\"}}}}]},\"StateTransitions\":\"\"}},\"Runtime\":{\"$\":{\"name\":\"tets_model\",\"version\":\"1.0\",\"baseDir\":\"$modelServicePath\\\\ModelName1\\\\model\\\\\",\"entry\":\"client.exe\"},\"HardwareConfigures\":\"\",\"SoftwareConfigures\":\"\",\"Assemblies\":{\"Add\":{\"$\":{\"name\":\"DemoMappingMethod\",\"value\":\"$dataMappingPath\\\\DemoMappingMethod\\\\DemoMappingMethod.exe\"}}},\"SupportiveResources\":\"\"}}}",
        "ms_status" : 1,
        "ms_user" : {
            "u_email" : "[Unknown]",
            "u_name" : "[Unknown]"
        },
        "ms_limited" : 0,
        "ms_permission" : 0,
        "__v" : 0
    },
    log : [],
    input : [
      {
            "StateId" : "c183e8c3-ba2b-4c8c-a517-09d03d8b4c05",
            "StateName" : "state1",
            "StateDes" : "模型开始运行",
            "Event" : "event1",
            "DataId" : "gd_f3469ab0-763e-11e7-8ea6-51d288fc30c6",
            "Tag" : "udx_zip_data.zip",
            "Destroyed" : false
        }, 
        {
            "StateId" : "922d29c4-9d09-4153-97a3-6f96a89f2cea",
            "StateName" : "state2",
            "StateDes" : "模型开始运行",
            "Event" : "event1",
            "DataId" : "gd_f3469ab0-763e-11e7-8ea6-51d288fc30c6",
            "Tag" : "udx_zip_data.zip",
            "Destroyed" : false
        }, 
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "state3",
            "StateDes" : "模型开始运行",
            "Event" : "event1",
            "DataId" : "",
            "Tag" : "",
            "Destroyed" : false
        }
    ],
    output : [ 
        {
            "StateId" : "c183e8c3-ba2b-4c8c-a517-09d03d8b4c05",
            "StateName" : "state1",
            "StateDes" : "模型开始运行",
            "Event" : "event2",
            "Destroyed" : false,
            "Tag" : "state1-event2",
            "DataId" : "gd_8b9648f0-7848-11e7-b6fe-7bbf552d12e4"
        }, 
        {
            "StateId" : "922d29c4-9d09-4153-97a3-6f96a89f2cea",
            "StateName" : "state2",
            "StateDes" : "模型开始运行",
            "Event" : "event2",
            "Destroyed" : false,
            "Tag" : "state2-event2",
            "DataId" : "gd_8b9648f1-7848-11e7-b6fe-7bbf552d12e4"
        }, 
        {
            "StateId" : "851a1985-a3f6-4c13-be53-f1c765022929",
            "StateName" : "state3",
            "StateDes" : "模型开始运行",
            "Event" : "event2",
            "Destroyed" : false,
            "Tag" : "state3-event2",
            "DataId" : "gd_8b9648f2-7848-11e7-b6fe-7bbf552d12e4"
        }, 
        {
            "StateId" : "B62ACC53-0DDF-4553-B71E-132753AD160F",
            "StateName" : "state4",
            "StateDes" : "模型结束运行",
            "Event" : "event1",
            "Destroyed" : false,
            "Tag" : "state4-event1",
            "DataId" : "gd_8b9648f3-7848-11e7-b6fe-7bbf552d12e4"
        }

    ],
    start : date.toLocaleString(),
    state : 'MC_READY'
  };
  var modelIns = new ModelIns(mis);
  app.modelInsColl.addIns(modelIns);
  global.debug = '调试模式';
}

module.exports = app;
