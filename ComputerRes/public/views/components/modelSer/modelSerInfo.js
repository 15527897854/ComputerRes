/**
 * Created by Franklin on 2017/3/21.
 */

var React = require('react');
var Axios = require('axios');
var CopyToClipBoard = require('copy-to-clipboard');

var NoteDialog = require('../../action/utils/noteDialog');

var ModelSerInfo = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            ms : null
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {
                this.setState({loading : false, ms : data.data.data });
            },
            err => {
                this.setState({loading : false, err : err });
            }
        );
    },

    copyToClipBoard : function(text){
        CopyToClipBoard(text);
        NoteDialog.openNoteDia('复制成功!');
    },

    render : function () {
        if(this.state.loading){
            return (
                <span className="" >加载中...</span>
            );
        }
        if(this.state.ms == null)
        {
            return (
                <span>未查询到数据</span>
            );
        }
        var platform = (
            <span className="label label-info">未知平台</span>);
        if(this.state.ms.ms_platform == 1)
        {
            platform = (
                <span className="label label-info">
                    <i className="fa fa-windows"> </i> windows
                </span>);
        }
        else if(this.state.ms.ms_platform == 2)
        {
            platform = (
                <span className="label label-info">
                    <i className="fa fa-linux"> </i>linux
                </span>);
        }
        var status = (
            <span className="badge badge-defult">不可用</span>);
        if(this.state.ms.ms_status == 1)
        {
            status = (
                <span className="badge badge-success">可用</span>
            );
        }
        var detail = '';
        if(this.state.ms.ms_model.m_url)
        {
            detail = (
                <a href={this.state.ms.ms_model.m_url} >更多信息</a>
            );
        }
        var img = (<img src="/images/modelImg/default.png" alt=""  />);
        if(this.state.ms.ms_img != null && this.state.ms.ms_img.trim() != ''){
            img = (<img height="128px" width="128px" src={ '/images/modelImg/' + this.state.ms.ms_img } alt=""  />)
        }
        var url = window.location.href;
        url = url.substr(0, url.lastIndexOf(':') + 5);
        var limited = null;
        if(this.state.ms.ms_limited == 1){
            limited = (<span className="label label-default tooltips" data-toggle="tooltip" data-placement="top" data-original-title="权限模型" ><i className="fa fa-lock" ></i>&nbsp;权限模型</span>);
        }
        else{
            limited = (<span className="label label-success tooltips" data-toggle="tooltip" data-placement="top" data-original-title="公开模型" ><i className="fa fa-unlock" ></i>&nbsp;公开模型</span>);
        }
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    模型服务信息
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="blog-img">
                                {img}
                            </div>
                        </div>
                        <div className="col-md-7">
                            <p className="muted" >名称&nbsp;:&nbsp;{this.state.ms.ms_model.m_name}</p>
                            <p className="muted" >类型&nbsp;:&nbsp;{this.state.ms.ms_model.m_type}</p>
                            <p className="muted" >版本号&nbsp;:&nbsp;{this.state.ms.mv_num}</p>
                            <p className="muted" >所在平台&nbsp;:&nbsp;{platform}</p>
                            <p className="muted" >部署时间&nbsp;:&nbsp;{this.state.ms.ms_update}</p>
                            <p className="muted" >状态&nbsp;:&nbsp;{status}</p>
                            <p className="muted" >权限情况&nbsp;:&nbsp;{limited}</p>
                            运行请求地址&nbsp;:&nbsp;
                            <div className="input-group m-bot15">
                                <span className="input-group-btn">
                                    <button type="button" className="btn btn-default" onClick={ (e) => { this.copyToClipBoard(url + '/public/modelser/preparation/' + this.state.ms._id) } } ><i className="fa fa-files-o"></i></button>
                                </span>
                                <input type="text" readOnly="readonly" className="form-control" value={url + '/public/modelser/preparation/' + this.state.ms._id} />
                            </div>
                            <p  className="muted" >描述&nbsp;:&nbsp;{this.state.ms.ms_des}</p>
                            <br />{detail}
                            <br />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerInfo;