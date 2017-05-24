var CommonMethod = require('./utils/commonMethod');
var uuid = require('node-uuid');

var path = uuid.v1();
var token = CommonMethod.crypto(JSON.stringify({
    username : 'shenchaorao',
    pwd : 'e10adc3949ba59abbe56e057f20f883e',
    deadline : '2017-5-30 10:00:00',
    times : 5,
    pid : 'fa5651d3dc49c581e3a4796110e1328e',
    path : path
}));

console.log(token);