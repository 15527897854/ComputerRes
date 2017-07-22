/**
 * Created by Franklin on 2017/4/5.
 */
var React = require('react');
var Axios = require('axios');

var DataUpLoader = require('./dataUploader');

var DataPreparation = React.createClass({
    getInitialState : function () {
        var rmt = 0;
        var host = '';
        if(this.props['data-type'] == 'rmt'){
            rmt = 1;
            host = this.props['data-host'];
        }

        return {
            rmt : rmt,
            host : host,
            states : [],
            allInputData : [],
            allOutputData : [],
            loading : true,
            limited : 0,
            authToken : ''
        };
    },

    componentDidMount : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc')
                {
                    this.setState({states : data.data.data.States, loading : false, limited : data.data.data.Limited});
                    this.state.states.map(function(State){
                        State.Event.map(function(Event){
                            if(Event.$.type == 'response'){
                                this.state.allInputData.push({
                                    StateId : State.$.id,
                                    Event : Event.$.name,
                                    DataId : '',
                                    Destroyed : false,
                                    Optional : Event.$.optional
                                });
                            }
                            else if(Event.$.type == 'noresponse'){
                                this.state.allOutputData.push({
                                    StateId : State.$.id,
                                    Event : Event.$.name,
                                    Destroyed : false,
                                    Tag : ''
                                });
                            }
                        }.bind(this));

                        window.allInputData = this.state.allInputData;
                        window.allOutputData = this.state.allOutputData;
                        window.authToken = this.state.authToken;
                        window.limited = this.state.limited;
                        window.addGeoData = this.onDataReady;
                        window.checkGeoData = this.checkGeoData;

                    }.bind(this));
                }
            },
            err => {}
        );
    },

    onDataReady : function(stateId, eventName, gdid){
        for(var i = 0; i < this.state.allInputData.length; i++)
        {
            if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName)
            {
                this.state.allInputData[i].DataId = gdid;
                break;
            }
        }
        this.forceUpdate();
    },

    onRemoveData : function(e, stateId, eventName){
        if(confirm("确认移除数据?"))
        {
            for(var i = 0; i < this.state.allInputData.length; i++)
            {
                if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName)
                {
                    this.state.allInputData[i].DataId = '';
                    this.forceUpdate();
                    break;
                }
            }
        }
    },

    getDataState : function(stateId, eventName){
        for(var i = 0; i < this.state.allInputData.length; i++)
        {
            if(this.state.allInputData[i].StateId == stateId && this.state.allInputData[i].Event == eventName && this.state.allInputData[i].DataId != '')
            {
                return (
                    <p id={ 'data_pre_p_' + stateId + '_' + eventName }>
                        <strong>{window.LanguageConfig.InputData.Event.Ready}&nbsp;:&nbsp;</strong><span className="label label-success">{window.LanguageConfig.InputData.Event.DataReady}</span>&nbsp;&nbsp;
                        { this.state.allInputData[i].DataId }&nbsp;&nbsp;
                        <button className="btn btn-danger btn-xs" onClick={(e) => { this.onRemoveData(e, stateId, eventName) }} >{window.LanguageConfig.InputData.Event.DataRemove}</button>
                    </p>
                );
            }
        }
        return (<p id={ 'data_pre_p_' + stateId + '_' + eventName }><strong>{window.LanguageConfig.InputData.Event.Ready}&nbsp;:&nbsp;</strong><span className="label label-warning">{window.LanguageConfig.InputData.Event.DataNoReady}</span></p>);
    },

    checkGeoData : function(){
        for(var i = 0; i < window.allInputData.length; i++){
            if(window.allInputData[i].DataId == '' && window.allInputData[i].Optional != 1 ){
                return {
                    result : 'fail',
                    message : window.LanguageConfig.InputData.Event.DataNoReadyMessage
                };
            }
            else{
                if($('#dataDestroyed_' + window.allInputData[i].StateId + '_' + window.allInputData[i].Event)[0].checked){
                    window.allInputData[i].Destroyed = true;
                }
                else{
                    window.allInputData[i].Destroyed = false;
                }
            }
        }

        for(var i = 0; i < window.allOutputData.length; i++)
        {
            window.allOutputData[i].Tag = $('#dataTag_' + window.allOutputData[i].StateId + '_' + window.allOutputData[i].Event).val();
            if($('#dataDestroyed_' + window.allOutputData[i].StateId + '_' + window.allOutputData[i].Event)[0].checked){
                window.allOutputData[i].Destroyed = true;
            }
            else{
                window.allOutputData[i].Destroyed = false;
            }
        }

        return {
            result : 'suc'
        };
    },

    render : function(){
        if(this.state.loading)
        {
            return (<span>Loading...</span>);
        }
        var authPanel = null;
        if(this.state.limited == 1){
            authPanel = (
                <div className="form-group">
                    <label className="col-md-1 col-sm-1 control-label" style={{"paddingTop" : "8px"}} >Auth Token</label>
                    <div className="col-md-6 col-sm-6">
                        <input name="authToken" type="text" id="authToken" className="form-control"  />
                    </div>
                </div>);
        }
        var states = this.state.states.map(function(State){
            var mark = true;
            var EventHead = State.Event.map(function(Event){
                var tag = '';
                if(mark)
                {
                    tag = 'active';
                    mark = false;
                }
                return (
                    <li key={'head' + State.$.id + '_' + Event.$.name} className={tag}>
                        <a style={{ paddingRight : '8px !important' }} href={'#' + State.$.id + '_' + Event.$.name} data-toggle="tab">
                            <i className="fa fa-flash"> </i>{Event.$.name}&nbsp;&nbsp;&nbsp;&nbsp;
                        </a>
                    </li>
                );
            });

            mark = true;
            var EventBody = State.Event.map(function(Event){
                var tag = '';
                if(mark){
                    tag = 'active';
                    mark = false;
                }
                var dataSelect = null;
                var optional = null;
                var dataReady = null;
                var dataType = 'SELECT';
                var dataDestoryed = (
                    <div className="checkbox">
                        <label>
                            <input id={ 'dataDestroyed_' + State.$.id + '_' + Event.$.name} type="checkbox" value="" />
                            {window.LanguageConfig.InputData.Event.Destoryed}
                        </label>
                    </div>
                );    
                if(this.props['data-type'] == 'CUSTOM'){
                    dataType = 'CUSTOM';
                }
                if(Event.$.type == 'response'){
                    dataSelect = (<DataUpLoader data-id={State.$.id + '_' + Event.$.name}
                                                data-type={dataType}
                                                data-rmt={this.state.rmt}
                                                data-host={this.state.host}
                                                onFinish={ (gdid) => { this.onDataReady(State.$.id, Event.$.name, gdid) } } />);
                    dataReady = this.getDataState(State.$.id, Event.$.name);
                    if(Event.$.optional == '1'){
                        optional = (<h4 style={{color : '#9AD717' }}><strong>{window.LanguageConfig.InputData.Event.Control}</strong></h4>);
                    }
                    else{
                        optional = (<h4 style={{color : '#9AD717' }}><strong>{window.LanguageConfig.InputData.Event.Required}</strong></h4>);
                    }
                }
                else if(Event.$.type == 'noresponse'){
                    optional = (<h4 style={{color : '#9AD717' }}><strong>{window.LanguageConfig.InputData.Event.Response}</strong></h4>);
                    dataReady = (<p><strong>{window.LanguageConfig.InputData.Event.ResponseDataTag}:</strong></p>);
                    dataSelect = (<input id={'dataTag_' + State.$.id + '_' + Event.$.name } className="form-control" type="text" />);
                }
                var udxDec = null;
                if(Event.UDXDeclaration){
                    udxDec = Event.UDXDeclaration.$.name + ' - ' + Event.UDXDeclaration.$.description;
                }
                return (
                    <div key={'body' + State.$.id + '_' + Event.$.name} className={ 'tab-pane ' + tag } id={State.$.id + '_' + Event.$.name}>
                        {optional}
                        <p><strong>{window.LanguageConfig.InputData.Event.Type} : </strong>{Event.$.type}</p>
                        <p><strong>{window.LanguageConfig.InputData.Event.Description} : </strong>{Event.$.description}</p>
                        <p><strong>{window.LanguageConfig.InputData.Event.DataReference} : </strong>{udxDec}</p>
                        {dataReady}
                        {dataSelect}
                        {dataDestoryed}
                    </div>
                );
            }.bind(this));

            return(
                <div key={State.$.id} className="panel-body">
                    <h4 style={{color : '#9ad717'}}><strong>{window.LanguageConfig.InputData.State.Title}</strong></h4>
                    <p><strong>{window.LanguageConfig.InputData.State.Name}&nbsp;:&nbsp;</strong>{State.$.name}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.ID}&nbsp;:&nbsp;</strong>{State.$.id}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.Description}&nbsp;:&nbsp;</strong>{State.$.description}</p>
                    <p><strong>{window.LanguageConfig.InputData.State.Type}&nbsp;:&nbsp;</strong>{State.$.type}</p>
                    <br />
                    <h4><strong>{window.LanguageConfig.InputData.Event.Title}</strong></h4>
                    <section className="panel">
                        <header className="panel-heading custom-tab ">
                            <ul className="nav nav-tabs">
                                {EventHead}
                            </ul>
                        </header>
                        <div className="panel-body">
                            <div className="tab-content">
                                {EventBody}
                            </div>
                        </div>
                    </section>
                </div>);
        }.bind(this));
        return (
            <div>
                {authPanel}
                <br />
                <br />
                {states}
            </div>
        );
    }
});

module.exports = DataPreparation;