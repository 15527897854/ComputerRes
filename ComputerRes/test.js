// var CommonMethod = require('./utils/commonMethod');
// var uuid = require('node-uuid');
// var ModelSerAccessCtrl = require('./control/modelSerAccessControl');

// var path = uuid.v1();
// var token = {
//     username : 'zfy',
//     pwd : 'e10adc3949ba59abbe56e057f20f883e',
//     deadline : '2017-5-30 10:00:00',
//     times : 5,
//     pid : '2cfef3fa-f1c8-457b-969b-471620553837',
//     path : path
// };

// ModelSerAccessCtrl.save(token, function(err, result){
//     if(err){
//         return console.log('error in saving token!');
//     }
//     return console.log('saving token successful!');
// });

// token = CommonMethod.crypto(JSON.stringify(token), '222.192.7.74');

// console.log(token);

// var tokenJson = CommonMethod.decrypto(token, '222.192.7.75');

// console.log(tokenJson);


// var ModelServiceRunModel = require('./model/modelSerRun');

// ModelServiceRunModel.getAllStatisticInfoByDate(new Date('2017-7-17 00:00:00'), new Date('2017-7-18 00:00:00'), function(err, data){
//     if(err){
//         return console.log('error');
//     }
//     console.log(data);
// });


// ModelServiceModel.readMDLByPath('E:/DemoData/GeoModeling/Demo.mdl', function(err, mdl){
//     if(err){
//         return console.log(err);
//     }
//     console.log('suc');
// });

// var RequestCtrl = require('./control/remoteReqControl');
// var formData = { 'id' : '123', 'computeCollection': '123', 'collName': '123' };

// RequestCtrl.postRequestJSONWithFormData('http://223.2.40.81:8080/registerDataMappingServlet?collName=123', formData, function(err, data){
    
// });
// var ModelSerCtrl = require('./control/modelSerControl');

// ModelSerCtrl.RegisterModelService('597221e696ddfe2e306cce51', function(err, data){
//     if(err){
//         console.log(err);
//     }
//     return console.log(data);
// });

var cmd = '{onResponseData}d6d4a13d-aa22-4f9b-8bfa-bec0105641c0&RUNSTATE&RETURNDATASET&184[OK][RAW|FIL]e:\GitCode\GeoModel-fz_yss_update\ComputerRes/geo_model/AspectAnalysis_FrmDiff_5984cc7b3445aa46ec8fa21d//instance/d6d4a13d-aa22-4f9b-8bfa-bec0105641c0\RUNSTATE\RETURNDATASET\aspect.asc';
var queryStr = cmd.split('&');

//! querys
var sname = queryStr[1];
var event = queryStr[2];
var signals = queryStr[3];

//! data
opLeft = cmd.lastIndexOf(']');
var data = cmd.substr(opLeft + 1);
data = data.replace('\0', '');
var nameLength = signals.substr(0, signals.indexOf('['));
var dataSignal = signals.substr(signals.indexOf('[') + 1, signals.indexOf(']') - signals.indexOf('[') - 1);
signals = signals.substr(signals.indexOf(']') + 1);
var dataType = signals.substr(1, signals.indexOf(']') - 1);
var dataFormat = dataType.substr(dataType.indexOf('|') + 1);
dataType = dataType.substr(0, dataType.indexOf('|'));