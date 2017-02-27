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
var settings = require('./setting');

var routes = require('./routes/index');

var app = express();

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
  cookie:{maxAge : 3600000},
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
var sockTrans = new socket(app);

// setInterval(function () {
//   if(app.modelInsColl.ModelInsArr.length == 1)
//   {
//     sockTrans.sendMsg(app.modelIns[0], 'Welcome !!! ');
//   }
// }, 1000);

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
    guid : "219e7c83-02f7-43cc-b74f-28c22874a677",
    socket : null,
    ms : null,
    start : date.toLocaleString(),
    state : 'MC_READY'
  };
  var modelIns = new ModelIns(mis);
  app.modelInsColl.addIns(modelIns);
}

module.exports = app;
