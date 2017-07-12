var Request = require('request');
var fs = require('fs');
var QueryString = require('querystring');
var CommonMethod = require('./utils/commonMethod');

var languages = [
    {
        "Name" : "German",
        "Config" : "de"
    },
    {
        "Name" : "Japanese",
        "Config" : "jp"
    },
    {
        "Name" : "French",
        "Config" : "fra"
    },
    {
        "Name" : "Spanish",
        "Config" : "spa"
    },
    {
        "Name" : "Russian",
        "Config" : "ru"
    },
    {
        "Name" : "Dutch",
        "Config" : "nl"
    }
];

var appid = '20161031000031093';
var salt = (new Date).getTime();
var key = 'urSUhJgUwa4roNB5gChM';
var from = 'en';

var jsEn = fs.readFileSync('./public/languages/en.json');
jsEn = JSON.parse(jsEn);
var propertys = Object.keys(jsEn);
var props = [];

function InsertProps(obj, keys){
    for(var i = 0; i < keys.length; i++){
        if(typeof obj[keys[i]] == 'object'){
            propertys = Object.keys(obj[keys[i]]);
            InsertProps(obj[keys[i]], propertys);
        }
        else{
            props.push(obj[keys[i]]);
        }
    }
}

InsertProps(jsEn, propertys);

props.splice(0, 1);
var query = props.join('\n');

var cfgIndex = 0;
function SetProps(jsNew, values){
    var propertys = Object.keys(jsNew);
    for(var i = 0; i < propertys.length; i++){
        if(typeof jsNew[propertys[i]] == 'object'){
            SetProps(jsNew[propertys[i]], values);
        }
        else{
            jsNew[propertys[i]] = values.trans_result[cfgIndex].dst;
            cfgIndex ++;
        }
    }
}

var pending = (function(index){
    return function(err, data){
        if(err){
        }
        var resJson = JSON.parse(data.body);
        var jsNewConfig = jsEn;

        cfgIndex = 0;
        SetProps(jsNewConfig, resJson);

        // var jsConfig = {
        //     "ConfigName" : resJson.trans_result[0].dst,
        //     "SelectButton" : resJson.trans_result[1].dst,
        //     "Name" : resJson.trans_result[2].dst,
        //     "Heading" : {
        //         "Administrator" : {
        //             "Title" : resJson.trans_result[3].dst,
        //             "Signature" : resJson.trans_result[4].dst
        //         },
        //         "User" : {
        //             "Title" : resJson.trans_result[5].dst,
        //             "Info" : resJson.trans_result[6].dst,
        //             "Settings"  : resJson.trans_result[7].dst,
        //             "SignOut" : resJson.trans_result[8].dst
        //         },
        //         "Homepage" : resJson.trans_result[9].dst,
        //         "Status" : resJson.trans_result[10].dst,
        //         "Notice" : resJson.trans_result[11].dst,
        //         "LocalModelService" : {
        //             "Title" : resJson.trans_result[12].dst,
        //             "Checking" : resJson.trans_result[13].dst,
        //             "Instances" : resJson.trans_result[14].dst,
        //             "Records" : resJson.trans_result[15].dst,
        //             "Deployment" : resJson.trans_result[16].dst
        //         },
        //         "RemoteModelService" : {
        //             "Title" : resJson.trans_result[17].dst,
        //             "Checking" : resJson.trans_result[18].dst,
        //             "Instances" : resJson.trans_result[19].dst,
        //             "Records" : resJson.trans_result[20].dst,
        //             "Network" : resJson.trans_result[21].dst
        //         },
        //         "CloudModelService" : resJson.trans_result[22].dst,
        //         "DataCenter" : resJson.trans_result[23].dst,
        //         "Settings" : {
        //             "Title" : resJson.trans_result[24].dst,
        //             "General" : resJson.trans_result[25].dst,
        //             "Environment" : resJson.trans_result[26].dst
        //         }
        //     },
        //     "Navigation" : {
        //         "Notice" : {
        //             "Title" : resJson.trans_result[27].dst,
        //             "NoMessage" : resJson.trans_result[28].dst
        //         },
        //         "User" : {
        //             "Info" : resJson.trans_result[29].dst,
        //             "Settings"  : resJson.trans_result[30].dst,
        //             "SignOut" : resJson.trans_result[31].dst
        //         }
        //     },
        //     "Homepage" : {
        //         "Welcome" : resJson.trans_result[32].dst,
        //         "ModelService" : resJson.trans_result[33].dst,
        //         "Notice" : resJson.trans_result[34].dst,
        //         "Status" : resJson.trans_result[35].dst,
        //         "Deployment" : resJson.trans_result[36].dst,
        //         "ModelServiceRunningRecords" : resJson.trans_result[37].dst,
        //         "Network" : resJson.trans_result[38].dst
        //     },
        //     "Notice" : {
        //         "NoticeTable" : resJson.trans_result[39].dst,
        //         "Classify" : resJson.trans_result[40].dst,
        //         "Start" : resJson.trans_result[41].dst,
        //         "Stop" : resJson.trans_result[42].dst,
        //         "Delete" : resJson.trans_result[43].dst,
        //         "AllMessage" : resJson.trans_result[44].dst,
        //         "AllReadMessage" : resJson.trans_result[45].dst,
        //         "AllUnreadMessage" : resJson.trans_result[46].dst,
        //         "MarkAllRead " : resJson.trans_result[47].dst,
        //         "InfoTitle" : resJson.trans_result[48].dst,
        //         "AllMessageMarkedRead" : resJson.trans_result[49].dst,
        //         "MessageMarkedRead" : resJson.trans_result[50].dst,
        //         "WarningTitle" : resJson.trans_result[51].dst,
        //         "MessageMarkedReadFailed" : resJson.trans_result[52].dst,
        //         "GettingNoticeFailed" : resJson.trans_result[53].dst
        //     },
        //     "ModelService" : {
        //         "Name" : resJson.trans_result[54].dst,
        //         "Status" : resJson.trans_result[55].dst,
        //         "Version" : resJson.trans_result[56].dst,
        //         "Platform" : resJson.trans_result[57].dst,
        //         "Avai" : resJson.trans_result[58].dst,
        //         "Unavai" : resJson.trans_result[59].dst,
        //         "Address" : resJson.trans_result[60].dst,
        //         "Start" : resJson.trans_result[61].dst,
        //         "Stop" : resJson.trans_result[62].dst,
        //         "Delete" : resJson.trans_result[63].dst,
        //         "Invoking" : resJson.trans_result[64].dst,
        //         "Auth" : resJson.trans_result[65].dst,
        //         "Public" : resJson.trans_result[66].dst
        //     },
        //     "ModelServiceTable" : {
        //         "localTitle" : resJson.trans_result[67].dst,
        //         "RemoteTitle" : resJson.trans_result[68].dst,
        //         "Instances" : resJson.trans_result[69].dst,
        //         "Address" : resJson.trans_result[70].dst,
        //         "Operation" : resJson.trans_result[71].dst,
        //         "Detail" : resJson.trans_result[72].dst,
        //         "Register" : resJson.trans_result[73].dst
        //     },
        //     "ModelServiceDetail" : {
        //         "Deployer" : resJson.trans_result[38].dst,
        //         "Type" : resJson.trans_result[38].dst,
        //         "DeploymentTime" : resJson.trans_result[38].dst,
        //         "Limited" : resJson.trans_result[38].dst,
        //         "URLInvoking" : resJson.trans_result[38].dst,
        //         "API" : resJson.trans_result[38].dst,
        //         "Copy" : resJson.trans_result[38].dst,
        //         "CopySuccessfully" : resJson.trans_result[38].dst,
        //         "Description" : resJson.trans_result[38].dst,
        //         "PublicInvoking" : resJson.trans_result[38].dst,
        //         "AdminInvoking" : resJson.trans_result[38].dst
        //     },
        //     "ModelServiceRecord" : {
        //         "StartTime" : resJson.trans_result[38].dst,
        //         "User" : resJson.trans_result[38].dst,
        //         "InstanceID" : resJson.trans_result[38].dst,
        //         "InputData" : resJson.trans_result[38].dst,
        //         "OutputData" : resJson.trans_result[38].dst,
        //         "Log" : resJson.trans_result[38].dst,
        //         "Span" : resJson.trans_result[38].dst,
        //         "Process" : resJson.trans_result[38].dst,
        //         "Finished" : resJson.trans_result[38].dst,
        //         "Unfinished" : resJson.trans_result[38].dst,
        //         "SetAsTestify" : resJson.trans_result[38].dst,
        //         "StandOutput" : resJson.trans_result[38].dst,
        //         "StandError" : resJson.trans_result[38].dst,
        //         "InvokingError" : resJson.trans_result[38].dst
        //     },
        //     "TablePaging" : {
        //         "LengthMenu" : resJson.trans_result[38].dst,
        //         "ZeroRecords" : resJson.trans_result[38].dst,
        //         "Info" : resJson.trans_result[38].dst,
        //         "InfoEmtpy" : resJson.trans_result[38].dst,
        //         "InfoFiltered" : resJson.trans_result[38].dst,
        //         "Processing" : resJson.trans_result[38].dst,
        //         "Search" : resJson.trans_result[38].dst,
        //         "Paginate" : {
        //             "First" : resJson.trans_result[38].dst,
        //             "Previous" : resJson.trans_result[38].dst,
        //             "Next" : resJson.trans_result[38].dst,
        //             "Last" : resJson.trans_result[38].dst
        //         }
        //     },
        //     "ModelInstancesTable" : {
        //         "LocalTitle" : resJson.trans_result[38].dst,
        //         "RemoteTitle" : resJson.trans_result[38].dst,
        //         "ID" : resJson.trans_result[38].dst,
        //         "Version" : resJson.trans_result[38].dst,
        //         "ModelName" : resJson.trans_result[38].dst,
        //         "StartTime" : resJson.trans_result[38].dst,
        //         "Status" : resJson.trans_result[38].dst,
        //         "Operation" : resJson.trans_result[38].dst,
        //         "Address" : resJson.trans_result[38].dst,
        //         "Kill" : resJson.trans_result[38].dst,
        //         "Killed" : resJson.trans_result[38].dst
        //     }
        // };
        
        fs.writeFile(__dirname + '/public/languages/' + languages[index].Config + '.json', JSON.stringify(jsNewConfig), function(err, result){
            if(!err){
                console.log('Language : ' + languages[index].Name + ' configuration has been built!');
            }
        });

    }
});

for(var i = 0; i < languages.length; i++){
    var query_t = languages[i].Name + '\n' + query;
    var sign = appid + query_t + salt + key;
    sign = CommonMethod.md5(sign);
    var to = languages[i].Config;
    var queryJson = {
        q: query_t,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    };
    var qString = QueryString.stringify(queryJson);
    Request.get('http://api.fanyi.baidu.com/api/trans/vip/translate?' + qString, pending(i));
}



