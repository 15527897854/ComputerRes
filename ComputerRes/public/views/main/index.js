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

if(document.getElementById('rmtModelSerTable') != null) {
    ReactDOM.render(
        <RmtModelSerTable source="/modelser/rmt/json/all" />,
        document.getElementById('rmtModelSerTable'));
}

if(document.getElementById('modelserinfo') != null) {
    ReactDOM.render(<ModelSerInfo source={ document.getElementById('modelserinfo').getAttribute('data-url') }  />,
        document.getElementById('modelserinfo'));
}

if(document.getElementById('rmtModelSerRunTable') != null) {
    ReactDOM.render(<RmtModelSerRunTable source="/modelserrun/rmt/json/all"/>,
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
    ReactDOM.render(<CloudModelSerTable source=""/>,
        document.getElementById('cloudModelSerTable'));
}

if(document.getElementById('dataCollectionTable') != null) {
    ReactDOM.render(<DataCollectionTable source="/geodata/json/all"/>,
        document.getElementById('dataCollectionTable'));
}

if(document.getElementById('DataPreparation') != null) {
    ReactDOM.render(<DataPreparation source={document.getElementById('DataPreparation').getAttribute('data-source') } />,
        document.getElementById('DataPreparation'));
}
