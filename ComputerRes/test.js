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