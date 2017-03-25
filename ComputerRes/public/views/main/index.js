/**
 * Created by Franklin on 2017/3/14.
 */
var React = require('react');
var ReactDOM = require('react-dom');

var RmtModelSerTable = require('../components/modelSer/rmtModelSerTable');
var RmtModelSerRunTable = require('../components/modelSerRun/rmtModelSerRunTable');
var ModelSerInfo = require('../components/modelSer/modelSerInfo');

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
    ReactDOM.render(<RmtModelSerRunTable source="/modelserrun/rmt/json/all" />,
        document.getElementById('rmtModelSerRunTable'));
}