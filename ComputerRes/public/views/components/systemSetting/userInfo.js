/**
 * Created by Franklin on 2017/5/13.
 */

var React = require('react');
var Axios = require('axios');

var PortalInfo = require('./portalInfo');
var Crypto = require('../../action/utils/crypto');
var NoteDialog = require('../../action/utils/noteDialog');

var UserInfo = React.createClass({
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
        Axios.get('/json/admininfo').then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({loading : false, data : data.data.data});
                    $('#txtAdminName').val(data.data.data);
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

    checkNewPwd : function(e){
        if($('#txtPwdNew').val() != $('#txtPwdNew_r').val()){
            this.setState({warning : '两次密码不同!'});
        }
        else{
            this.setState({warning : null});
        }
    },

    onSubmit : function(){
        if($('#txtAdminName').val().trim() == ''){
            this.setState({warning : '请输入用户名!'});
            return;
        }
        if($('#txtPwdNow').val().trim() == ''){
            this.setState({warning : '请输入当前密码!'});
            return;
        }
        if($('#txtPwdNew').val().trim() == ''){
            this.setState({warning : '请输入新密码!'});
            return;
        }
        if($('#txtPwdNew').val().trim() != $('#txtPwdNew_r').val().trim()){
            this.setState({warning : '两次密码不同!'});
            return;
        }
        var adminName = this.state.data;
        var pwd = Crypto.crypto($('#txtPwdNow').val());
        var newAdminName = $('#txtAdminName').val();
        var newAdminPwd = Crypto.crypto($('#txtPwdNew').val());
        Axios.put('/json/admininfo?adminName=' + adminName + '&pwd=' + pwd + '&newAdminName=' + newAdminName + '&newAdminPwd=' + newAdminPwd).then(
            data => {
                if(data.data.result == 'suc'){
                    if(data.data.data.result == 1){
                        NoteDialog.openNoteDia('更改成功!', '管理员信息更改成功!');
                        this.clearForm();
                        this.closeDialog();
                        this.refresh();
                    }
                    else if(data.data.data.result == -1){
                        NoteDialog.openNoteDia('更改失败!', '账户验证失败!');
                        this.clearForm();
                    }
                }
                else{
                    NoteDialog.openNoteDia('更改失败!', '出错:' + data.data.message);
                    this.clearForm();
                }
            },
            err => {
                NoteDialog.openNoteDia('更改失败!', '连接出错:' + JSON.stringify(err));
                this.clearForm();
            }
        );
    },

    clearForm : function(){
        $('#txtPwdNow').val('');
        $('#txtPwdNew').val('');
        $('#txtPwdNew_r').val('');
    },

    closeDialog : function(){
        $('#adminPwdChange').modal('hide');
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
                    <button type="button" className="close close-sm" data-dismiss="alert">
                        <i className="fa fa-times"></i>
                    </button>
                    <strong>{this.state.warning}</strong>
                </div>
            );
        }
        return (
        <section className="panel" >
            <header className="panel-heading" >
                User Infomation
            </header>
            <div className="panel-body">
                <p>Administator User Name&nbsp;:&nbsp;{this.state.data} &nbsp;&nbsp;&nbsp;<button className="btn btn-sm btn-info" data-toggle="modal"
                        data-target="#adminPwdChange" >Set</button></p>
                <PortalInfo />
                <div aria-hidden="true" aria-labelledby="adminPwdChange" role="dialog" tabIndex="-1" id="adminPwdChange" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Update Infomation</h4>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="txtAdminName" className="control-label">Please Input Administator Username: </label>
                                <input id="txtAdminName" name="txtAdminName" type="text" placeholder="User Name" className="form-control"/>
                                <label htmlFor="txtPwdNow" className="control-label">Currect Password: </label>
                                <input id="txtPwdNow" name="txtPwdNow" type="password" className="form-control"/>
                                <label htmlFor="txtPwdNew" className="control-label">New Password: </label>
                                <input id="txtPwdNew" name="txtPwdNew" type="password" className="form-control"/>
                                <label htmlFor="txtPwdNew_r" className="control-label">New Password Again: </label>
                                <input id="txtPwdNew_r" name="txtPwdNew_r" type="password" className="form-control" onBlur={this.checkNewPwd} />
                                <br />
                                {warning}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={this.onSubmit} >Comfirm</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal" >Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>);
    }
});

module.exports = UserInfo;