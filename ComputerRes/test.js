var CommonMethod = require('./utils/commonMethod');
var uuid = require('node-uuid');
var ModelSerAccessCtrl = require('./control/modelSerAccessControl');

var path = uuid.v1();
var token = {
    username : 'shenchaorao',
    pwd : 'e10adc3949ba59abbe56e057f20f883e',
    deadline : '2017-5-30 10:00:00',
    times : 5,
    pid : 'fa5651d3dc49c581e3a4796110e1328e',
    path : path
};

ModelSerAccessCtrl.save(token, function(err, result){
    if(err){
        return console.log('error in saving token!');
    }
    return console.log('saving token successful!');
});

token = CommonMethod.crypto(JSON.stringify(token), '222.192.7.74');

console.log(token);

var tokenJson = CommonMethod.decrypto(token, '222.192.7.75');

console.log(tokenJson);