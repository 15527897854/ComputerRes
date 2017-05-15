/**
 * Created by Franklin on 2017/5/14.
 */

var React = require('react');
var Axios = require('axios');

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
        Axios.get('/portalinfo').then(
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
                                <label htmlFor="txtAdminName" className="control-label">请输入用户名: </label>
                                <input id="txtAdminName" name="txtAdminName" type="text" placeholder="管理员用户名" className="form-control"/>
                                <label htmlFor="txtPwdNow" className="control-label">请输入密码: </label>
                                <input id="txtPwdNow" name="txtPwdNow" type="password" className="form-control"/>
                                <br />
                                {warning}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={this.onSubmit} >确认</button>
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