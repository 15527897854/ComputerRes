/**
 * Created by Franklin on 2017/5/14.
 */

var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');
var Crypto = require('../../action/utils/crypto');

var PortalInfo = React.createClass({
    getInitialState : function(){
        return {
            loading : true,
            err : false,
            data : null,
            processBar : false,
            warning : null
        };
    },


    componentDidMount : function(){
        this.refresh();
    },

    refresh : function(){
        Axios.get('/json/portalinfo').then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({loading : false, data : data.data.data});
                }
                else if(data.data.result == 'err'){
                    this.setState({loading : false, err : data.data.message});
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    onSubmit : function(){
        var portalname = $('#txtPortalName').val();
        var portalpwd = Crypto.crypto($('#txtPortalPwdNew').val());

        Axios.put('/json/portalinfo?portalname=' + portalname + '&portalpwd=' + portalpwd).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('更改成功!', '门户信息更改成功!');
                    this.dialogClose();
                    this.refresh();
                }
                else{
                    this.setState({warning : '验证失败'});
                }
                this.setState({processBar : false});
            },
            err => {}
        );
        this.setState({processBar : true});
    },

    dialogClose : function(){
        $('#portalInfoDia').modal('hide');
    },

    render : function(){
        if(this.state.loading){
            return (<span>加载中...</span>);
        }
        if(this.state.err){
            return (<span>Error: {JSON.stringify(this.state.err)}</span>);
        }
        var warning = null;
        if(this.state.warning){
            warning = (
                <div className="alert alert-block alert-danger fade in">
                    <strong>{this.state.warning}</strong>
                </div>
            );
        }
        var processBar = null;
        var btnDisabled = null;
        if(this.state.processBar){
            processBar = (
                <div className="progress progress-striped active progress-sm">
                    <div style={ { 'width' : '100%' }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"> </span>
                    </div>
                </div>
            );
            btnDisabled = 'disabled';
        }
        return (
            <div>
                <p>门户用户名: {this.state.data} &nbsp;&nbsp;&nbsp;<button className="btn btn-sm btn-info"  data-toggle="modal"
                        data-target="#portalInfoDia" >更改信息</button></p>
                <div aria-hidden="true" aria-labelledby="portalInfoDia" role="dialog" tabIndex="-1" id="portalInfoDia" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">更改信息</h4>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="txtPortalName" className="control-label" style={{ "text-align" : "left"}}>请输入门户网站用户名: </label>
                                <input id="txtPortalName" name="txtPortalName" type="text" placeholder="门户网站用户名" className="form-control"/>
                                <label htmlFor="txtPortalPwdNew" className="control-label" style={{ "text-align" : "left"}}>请输入密码: </label>
                                <input id="txtPortalPwdNew" name="txtPortalPwdNew" type="password" className="form-control"/>
                                <br />
                                {processBar}
                                {warning}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={this.onSubmit} disabled={btnDisabled} >确认</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal" >关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PortalInfo;