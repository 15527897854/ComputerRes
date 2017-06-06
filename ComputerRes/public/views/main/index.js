/**
 * Created by Franklin on 2017/3/14.
 */
var React = require('react');
var ReactDOM = require('react-dom');

var RmtModelSerTable = require('../components/modelSer/rmtModelSerTable');
var RmtModelSerRunTable = require('../components/modelSerRun/rmtModelSerRunTable');
var ModelSerInfo = require('../components/modelSer/modelSerInfo');
var SystemSetting = require('../components/systemSetting/systemSetting');
var ChildrenTable = require('../components/children/ChildrenTable');
var ParentPanel = require('../components/systemSetting/parentPanel');
var CloudModelSerTable = require('../components/modelSer/cloudModelSerTable');
var DataCollectionTable = require('../components/data/dataCollectionTable');
var DataPreparation = require('../components/data/dataPreparation');
var ModelSerUploader = require('../components/modelSer/modelSerUploader');
var UserInfo = require('../components/systemSetting/userInfo');
var LoginPanel = require('../components/systemSetting/loginPanel');
var EnviroPanel = require('../components/enviro/enviroPanel');
var EnMatchPanel = require('../components/enviro/enMatchPanel');

if(document.getElementById('rmtModelSerTable') != null) {
    ReactDOM.render(
        <RmtModelSerTable
            data-source={ document.getElementById('rmtModelSerTable').getAttribute('data-source') }
            data-type={ document.getElementById('rmtModelSerTable').getAttribute('data-type') }
        />,
        document.getElementById('rmtModelSerTable'));
}

if(document.getElementById('modelserinfo') != null) {
    ReactDOM.render(<ModelSerInfo source={ document.getElementById('modelserinfo').getAttribute('data-source') }  />,
        document.getElementById('modelserinfo'));
}

if(document.getElementById('rmtModelSerRunTable') != null) {
    ReactDOM.render(<RmtModelSerRunTable
        data-source={ document.getElementById('rmtModelSerRunTable').getAttribute('data-source') }
        data-type={ document.getElementById('rmtModelSerRunTable').getAttribute('data-type') }
    />,
        document.getElementById('rmtModelSerRunTable'));
}

if(document.getElementById('settingPage') != null) {
    ReactDOM.render(<SystemSetting source="/settings"/>,
        document.getElementById('settingPage'));
}

if(document.getElementById('childPanel') != null) {
    ReactDOM.render(<ChildrenTable source="/child-node/json/all"/>,
        document.getElementById('childPanel'));
}

if(document.getElementById('parentPanel') != null) {
    ReactDOM.render(<ParentPanel source="/parent"/>,
        document.getElementById('parentPanel'));
}

if(document.getElementById('cloudModelSerTable') != null) {
    ReactDOM.render(<CloudModelSerTable data-source={document.getElementById('cloudModelSerTable').getAttribute('data-source') }/>,
        document.getElementById('cloudModelSerTable'));
}

if(document.getElementById('dataCollectionTable') != null) {
    ReactDOM.render(<DataCollectionTable source="/geodata/json/all"/>,
        document.getElementById('dataCollectionTable'));
}

if(document.getElementById('userInfo') != null) {
    ReactDOM.render(<UserInfo />,
        document.getElementById('userInfo'));
}

if(document.getElementById('loginPanel') != null) {
    ReactDOM.render(<LoginPanel />,
        document.getElementById('loginPanel'));
}

if(document.getElementById('modelSerUploader') != null) {
    ReactDOM.render(<ModelSerUploader 
    data-source-category="/modelser/cloud/category"
    data-msid={document.getElementById('modelSerUploader').getAttribute('data-msid')}/> ,
        document.getElementById('modelSerUploader'));
}

if(document.getElementById('DataPreparation') != null) {
    ReactDOM.render(<DataPreparation
        data-source={document.getElementById('DataPreparation').getAttribute('data-source') }
        data-type={ document.getElementById('DataPreparation').getAttribute('data-type') }
        data-host={ document.getElementById('DataPreparation').getAttribute('data-host') } />,
        document.getElementById('DataPreparation'));
}

if(document.getElementById('enviro-section') != null){
    var width = $('#swe').width() - 60;
    var tabletree = {
        editable:true,
        checkbox:false,
        operate:true,
        autowidth:true,
        css:{
            width:{
                tabletree:width,
                title:(width-140)/2,
                value:(width-140)/2
            }
        }
    };
    var fields = [{
        title:'name',
        type:'string'
    },{
        title:'version',
        type:'string'
    },{
        title:'description',
        type:'string'
    },{
        title:'type',
        type:'string'
    },{
        title:'platform',
        type:'string'
    },{
        title:'alias',
        type:'Array'
    }];
    ReactDOM.render(<EnviroPanel
        tableID='swe-table'
        type="software"
        tabletree={tabletree}
        fields={fields}
    />, document.getElementById('swe'));

    fields = [{
        title:'name',
        type:'string'
    },{
        title:'value',
        type:'string'
    }];
    ReactDOM.render(<EnviroPanel
        tableID='hwe-table'
        type="hardware"
        tabletree={tabletree}
        fields={fields}
    />, document.getElementById('hwe'));
}

if(document.getElementById('enMatch-section') != null){
    var width = $('#enMatch-section').width() - 100;
    var css = {
        width:{
            tabletree:width,
            title:(width-140)/5,
            demand:(width-140)*2/5,
            enviro:(width-140)*2/5
        }
    };
    ReactDOM.render(<EnMatchPanel
        pid={$('#enMatch-section').attr('data-pid')}
        place= {$('#enMatch-section').attr('data-pidPlace')}
        css={css}
    />,document.getElementById('enMatch-section'));
}