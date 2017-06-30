/**
 * Created by Franklin on 2017/6/19.
 */

var React = require('react');
var Axios = require('axios');
var CopyToClipBoard = require('copy-to-clipboard');

var NoteDialog = require('../../action/utils/noteDialog');
var ModelSerOpera = require('./modelSerOpera');

var ModelSerDetail = React.createClass({
    getInitialState : function(){
        return {
            loading : true,
            err : null,
            ms : null
        };
    },

    componentDidMount : function(){
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({
                        loading : false,
                        err : null,
                        ms : data.data.data
                    });
                }
                else{
                    this.setState({
                        loading : false,
                        err : data.data.message,
                        ms : null
                    });
                }
            },
            err => {
                this.setState({
                    loading : false,
                    err : err.message,
                    ms : null
                });
            }
        );
    },

    copyToClipBoard : function(text){
        CopyToClipBoard(text);
        NoteDialog.openNoteDia('复制成功!');
    },

    onDeleted : function(){
        if(this.props['data-type'] == 'admin'){
            window.location.href = '/modelser/all';
        }
        else{
            window.location.href = '/public/modelser/all';
        }
    },

    render : function(){
        if(this.state.loading){
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err){
            return (
                <span>出现异常 : {JSON.stringify(this.state.err)}</span>
            );
        }
        var platform = null;
        if(this.state.ms.ms_platform == 1){
            platform = (
                <span className="label label-info">
                    <i className="fa fa-windows"></i>&nbsp;
                    windows
                </span>
            )
        }
        else if(this.state.ms.ms_platform == 2){
            platform = (
                <span className="label label-info">
                    <i className="fa fa-linux"></i>&nbsp;
                    linux
                </span>
            )
        }
        else{
            platform = (
                <span className="label label-info">
                    Unknown
                </span>
            )
        }
        var status = null;
        var opera_status = null;
        if(this.state.ms.ms_status == 1){
            opera_status = "started";
            status = (
                <span className="badge badge-success">可用</span>
            )
        }
        else {
            opera_status = "stopped";
            status = (
                <span className="badge badge-default">不可用</span>
            );
        }
        var img = null;
        if(this.state.ms.ms_img != null && this.state.ms.ms_img.trim() != ''){
            img = (<img width="128" height="128" src={"/images/modelImg/" + this.state.ms.ms_img } alt={this.state.ms.ms_model.ms_name} />);
        }
        else{
            img = (<img width="128" height="128" src="/images/modelImg/default.png" alt={this.state.ms.ms_model.ms_name} />);
        }
        var moreInfo = null;
        if(this.state.ms.ms_model.m_url && this.state.ms.ms_model.m_url.trim() != ''){
            moreInfo = (<a href={this.state.ms.ms_model.m_url} >更多信息</a>);
        }
        var limited = null;
        if(this.state.ms.ms_limited == 1){
            limited = (<span className="label label-default tooltips" data-toggle="tooltip" data-placement="top" data-original-title="权限模型" ><i className="fa fa-lock" ></i>&nbsp;权限模型</span>);
        }
        else{
            limited = (<span className="label label-success tooltips" data-toggle="tooltip" data-placement="top" data-original-title="公开模型" ><i className="fa fa-unlock" ></i>&nbsp;公开模型</span>);
        }
        var url = window.location.href;
        url = url.substr(0, url.lastIndexOf(':') + 5);
        
        var starting = "/modelser/" + this.state.ms._id + '?ac=start';
        var stopping = "/modelser/" + this.state.ms._id + '?ac=stop';
        var deleting = "/modelser/" + this.state.ms._id;
        var run = "/modelser/preparation/" + this.state.ms._id;

        var modelserOpera = null;
        if(this.props['data-type'] == 'admin'){
            modelserOpera = (<ModelSerOpera 
                                    data-status={opera_status} 
                                    data-starting={starting}
                                    data-stopping={stopping}
                                    data-deleting={deleting}
                                    data-run={run}
                                    onStarted={this.refresh}
                                    onStopped={this.refresh}
                                    onDeleted={this.onDeleted}
                                        />);
        }

        return (
            <div className="panel panel-default">
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="blog-img">
                                {img}
                            </div>
                        </div>
                        <div className="col-md-7">
                            <h1 className="mtop35">{ this.state.ms.ms_model.m_name }</h1>
                            <p className="muted" >
                                部署人&nbsp;:&nbsp;{ this.state.ms.ms_user.u_name }&nbsp;&nbsp;&nbsp;&nbsp;
                                Email&nbsp;:&nbsp;{ this.state.ms.ms_user.u_email }
                            </p>
                            <p className="muted" >
                                模型类型&nbsp;:&nbsp;{ this.state.ms.ms_model.m_type }
                            </p >
                            <p className="muted" >
                                版本号&nbsp;:&nbsp;{ this.state.ms.mv_num }
                            </p>
                            <p className="muted" >
                                所在平台&nbsp;:&nbsp;{platform}
                            </p>
                            <p className="muted" >
                                部署时间&nbsp;:&nbsp;{ this.state.ms.ms_update }
                            </p>
                            <p className="muted" >
                                状态&nbsp;:&nbsp;{status}
                            </p>
                            <p className="muted" >
                                权限情况&nbsp;:&nbsp;{limited}
                            </p>
                            运行请求地址&nbsp;:&nbsp;
                            <div className="input-group m-bot15">
                                <span className="input-group-btn">
                                    <button title="复制" type="button" className="btn btn-default" onClick={ (e) => { this.copyToClipBoard(url + '/public/modelser/preparation/' + this.state.ms._id); } } ><i className="fa fa-files-o"></i></button>
                                    <button title="公开调用" type="button" className="btn btn-default" onClick={ (e) => { window.open(url + '/public/modelser/preparation/' + this.state.ms._id); } } ><i className="fa fa-retweet"></i></button>
                                </span>
                                <input type="text" readOnly="readonly" className="form-control" value={url + '/public/modelser/preparation/' + this.state.ms._id} />
                            </div>
                            API调用地址&nbsp;:&nbsp;
                            <div className="input-group m-bot15">
                                <span className="input-group-btn">
                                    <button title="复制" type="button" className="btn btn-default" onClick={ (e) => { this.copyToClipBoard(url + '/modelser/preparation/' + this.state.ms._id); } } ><i className="fa fa-files-o"></i></button>
                                </span>
                                <input type="text" readOnly="readonly" className="form-control" value={url + '/modelser/' + this.state.ms._id + '?ac=run&inputdata=[]&outputdate=[]&auth={username:"",pwd:""}'} />
                            </div>
                            <p className="muted" >
                                描述&nbsp;:&nbsp;
                                { this.state.ms.ms_des }

                            </p>
                            {moreInfo}
                            <br />
                            <br />
                            {modelserOpera}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerDetail;