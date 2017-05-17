var fs = require('fs');

var ModelSerCtrl = require('./modelSerControl');
var sysCtrl = require('./sysControl');
var registerCtrl = require('./registerCtrl');
var RemoteReqControl = require('./remoteReqControl');
var softwareEnCtrl = require('./softwareEnCtrl');
var hardwareEnCtrl = require('./hardwareEnCtrl');
var msrCtrl = require('./modelSerRunControl');
var request = require('request-promise');
var verCtrl = require('./versionCtrl');

sysCtrl.autoDetectHW(function (err,data) {
    
});

// verCtrl.satisfies('324.345.2345','((([0,345])))||((2345.22.23,infinite))&&(2345.22.23,3454.345.8)||324.x||*&&~1.2.3.4');

// var rst = verCtrl.baseMatch('1.2.235346',' 1.2.3');
// console.log(rst);

// console.log(verCtrl.match('2.234sad','eq','2.234sadf'));

// fs.readFile(__dirname + '/../helper/softwareEnviro.txt',function (err, data) {
//     data = data.toString();
//     var strswlist = data.split('[\t\t\t]');
//     var swlist = [];
//     var strVer = '';
//     for(var i=0;i<strswlist.length;i++){
//         var swItemKV = strswlist[i].split('[\t\t]');
//         swlist.push({
//             _id:swItemKV[0],
//             name:swItemKV[1],
//             version:swItemKV[2],
//             publisher:swItemKV[3],
//             type:swItemKV[4]
//         });
//         strVer += swItemKV[2] + '\n';
//     }
//     fs.writeFile(__dirname + '/../helper/softwareVersion.txt',strVer,function (err) {
//
//     })
// });

// softwareEnCtrl.getByWhere({},function (err, data) {
//     softwareEnCtrl.toTableTree(data,function () {
//
//     })
// });

// softwareEnCtrl.getByWhere({},function (err, data) {
//     softwareEnCtrl.toTableTree(data,function (err, rst) {
//         console.log(rst);
//     });
// });

// var hwe = {
//     name:'CPU',
//     value:'英特尔 Core i7-4770'
// };
// hardwareEnCtrl.save(hwe,function (err, data) {
//     console.log(data);
// });

// var testSWE = {
//     name:'a'
// };
// softwareEnCtrl.save(testSWE,function (err, data) {
//     console.log(data);
// });


// registerCtrl.register(function (rst) {
//     console.log(rst);
//     registerCtrl.deregister(function (rst) {
//         console.log(rst);
//     });
// });

// var url = 'http://127.0.0.1:8060/modelser';
// var form = {
//     m_name:'test post by server',
//     m_type:'a',
//     m_url:'',
//     ms_limited:1,
//     mv_num:1,
//     ms_des:'',
//     ms_xml:'',
//     u_name:'scr',
//     u_email:'',
//     ms_img:fs.createReadStream(__dirname + '/../public/images/404-error.png'),
//     file_model:fs.createReadStream('E:\\vs10\\saga_3.0.0_src\\saga-gis\\bin\\saga_vc_x64_d\\Packing_SAGA_Models\\climate_tools_0.zip')
// };
// RemoteReqControl.postByServer(url,form,function (err,msg) {
//     console.log(msg);
// });


// ModelSerCtrl.addDefaultTestify('58ee46a6347de959c8c65bd7');
// sysCtrl.getState(function (err, rst) {
//     if(err){
//        
//     }
//     else{
//         console.log(rst);
//     }
// });

// sysCtrl.getIP(function (err,ipv4) {
//     if(err){
//       
//     }
//     else{
//         console.log(ipv4);
//     }
// });

//post options
//表单数据在formData中
// var options = {
//     method:'POST',
//     url:'http://127.0.0.1:8060/geodata/file',
//     formData:{
//         gd_tag:'table',
//         myfile:fs.createReadStream(__dirname + '/../geo_data/gd_0b1fbba0-1c06-11e7-9acc-e19d25cc2070.xml'),
//     },
//     json:true
// };

//get options
//加上json：true会自动对json结果进行解析
//查询的参数在qs中
// var options = {
//     method:'GET',
//     url:'http://localhost:8060/notices',
//     qs:{                    
//         noticeType:'start-run'
//     },
//     json:true   
// };
//
// request(options)
//     .then(function (res) {
//         console.log(res);
//     })
//     .catch(function (err) {
//        
//     });