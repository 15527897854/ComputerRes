/**
 * Created by Franklin on 2017/5/15.
 */

var React = require('react');
var Axios = require('axios');

var Crypto = require('../../action/utils/crypto');

var LoginPanel = React.createClass({

    login : function(e){
        if($('#adminname').val().trim() == ''){
            return;
        }
        if($('#adminpwd').val().trim() == ''){
            return;
        }
        var adminname = $('#adminname').val();
        var adminpwd = Crypto.crypto($('#adminpwd').val());
        Axios.post('/login', {
            adminname : adminname,
            adminpwd : adminpwd
        }).then(
            data => {
                if(data.data.result == 'suc'){
                    if(data.data.data == true){
                        window.location.href = '/index';
                    }
                    else{
                        alert('用户名或密码错误!');
                    }
                }
                else{
                    alert('访问出错!');
                }
            },
            err => {}
        );
    },
    render : function(){
        return (
            <div className="container">
                <div className="form-signin-heading text-center" >
                    <h1 className="sign-title">模型服务容器 - 登录</h1>
                    <img src="images/login-logo.png" style={ { "paddingTop" : "100px" } } alt=""/>
                </div>
                <form className="form-signin" id="form" style={ { "marginTop" : "35px" ,"marginBottom" : "5px"  }}>
                    <div className="login-wrap" style={{"paddingTop" : "50px"}} >
                        <input type="text" id="adminname" name="adminname" className="form-control" placeholder="用户名" />
                        <input type="password" id="adminpwd" name="adminpwd" className="form-control" placeholder="密码" />

                        <div id="error" style={{"color" : "#DE5130", "fontSize" : "12px", "fontWeight" : "normal"}}></div>

                        <button className="btn btn-lg btn-login btn-block" type="button" onClick={this.login} >
                            <i className="fa fa-check"></i>
                        </button>
                    </div>
                </form>
            </div>
        );
    }
});

module.exports = LoginPanel;