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
            loading : true
        };
    },

    componentDidMount : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc')
                {
                    this.setState({states : data.data.data, loading : false});
                    this.state.states.map(function(State){
                        State.Event.map(function(Event){
                            if(Event.$.type == 'response'){
                                this.state.allInputData.push({
                                    StateId : State.$.id,
                                    Event : Event.$.name,
                                    DataId : '',
                                    Optional : Event.$.optional
                                });
                            }
                            else if(Event.$.type == 'noresponse'){
                                this.state.allOutputData.push({
                                    StateId : State.$.id,
                                    Event : Event.$.name,
                                    Tag : ''
                                });
                            }
                        }.bind(this));

                        window.allInputData = this.state.allInputData;
                        window.allOutputData = this.state.allOutputData;
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
                        <strong>数据准备情况&nbsp;:&nbsp;</strong><span className="label label-success">已准备</span>&nbsp;&nbsp;
                        { this.state.allInputData[i].DataId }&nbsp;&nbsp;
                        <button className="btn btn-danger btn-xs" onClick={(e) => { this.onRemoveData(e, stateId, eventName) }} >移除</button>
                    </p>
                );
            }
        }
        return (<p id={ 'data_pre_p_' + stateId + '_' + eventName }><strong>数据准备情况&nbsp;:&nbsp;</strong><span className="label label-warning">未准备</span></p>);
    },

    render : function(){
        if(this.state.loading)
        {
            return (<span>加载中...</span>);
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
                if(Event.$.type == 'response'){
                    dataSelect = (<DataUpLoader data-id={State.$.id + '_' + Event.$.name}
                                                data-type="SELECT"
                                                data-rmt={this.state.rmt}
                                                data-host={this.state.host}
                                                onFinish={ (gdid) => { this.onDataReady(State.$.id, Event.$.name, gdid) } } />);
                    dataReady = this.getDataState(State.$.id, Event.$.name);
                    if(Event.$.optional == '1'){
                        optional = (<h4 style={{color : '#9AD717' }}><strong>可选参数</strong></h4>);
                    }
                    else{
                        optional = (<h4 style={{color : '#9AD717' }}><strong>必选参数</strong></h4>);
                    }
                }
                else if(Event.$.type == 'noresponse'){
                    optional = (<h4 style={{color : '#9AD717' }}><strong>输出参数</strong></h4>);
                    dataReady = (<p><strong>结果数据标签:</strong></p>);
                    dataSelect = (<input id={'dataTag_' + State.$.id + '_' + Event.$.name } className="form-control" type="text" />);
                }
                var udxDec = null;
                if(Event.UDXDeclaration){
                    udxDec = Event.UDXDeclaration.$.name + ' - ' + Event.UDXDeclaration.$.description;
                }
                return (
                    <div key={'body' + State.$.id + '_' + Event.$.name} className={ 'tab-pane ' + tag } id={State.$.id + '_' + Event.$.name}>
                        {optional}
                        <p><strong>类型：</strong>{Event.$.type}</p>
                        <p><strong>描述：</strong>{Event.$.description}</p>
                        <p><strong>数据参考：</strong>{udxDec}</p>
                        {dataReady}
                        {dataSelect}
                    </div>
                );
            }.bind(this));

            return(
            <div key={State.$.id} className="panel-body">
                <h4 style={{color: '#9ad717'}}><strong>状态信息</strong></h4>
                <p><strong>名称&nbsp;:&nbsp;</strong>{State.$.name}</p>
                <p><strong>ID&nbsp;:&nbsp;</strong>{State.$.id}</p>
                <p><strong>描述&nbsp;:&nbsp;</strong>{State.$.description}</p>
                <p><strong>类型&nbsp;:&nbsp;</strong>{State.$.type}</p>
                <br />
                <h4><strong>事件</strong></h4>
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
                {states}
            </div>
        );
    }
});

module.exports = DataPreparation;