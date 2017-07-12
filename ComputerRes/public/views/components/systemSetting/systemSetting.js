/**
 * Created by Franklin on 2017/3/26.
 */

var React = require('react');
var Axios = require('axios');

var SystemSetting = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props.source).then(
            data => { this.setState({ loading : false, err : null, data : data.data.data }); },
            err => { this.setState({ loading : false, err : err, data : null }); }
        );
    },

    changeRegisterState:function () {
        var url = '/system/registration';
        var qs;
        if(this.state.data.registered == 1){
            qs = 'deregister';
        }
        else if(this.state.data.registered == 0){
            qs = 'register';
        }
        url = url + '?ac=' + qs;
        Axios.get(url).then(
            msg => {
                var title,detail;
                if(msg.status == -1){
                    title = '警告：';
                    detail = '服务器出错，请稍后重试！';
                }
                else if(msg.status == 1){
                    title = '提示：';
                    detail = '向门户网站注册成功！';
                }
                else if(msg.status == 2){
                    title = '提示：';
                    detail = '已经向门户网站注册过，无需重复注册！';
                }
                $.gritter.add({
                    title: title,
                    text: '<p>' + detail + '</p>',
                    sticky: false,
                    time: 2000
                });
                return false;
            },
            err => {
                $.gritter.add({
                    title: '警告',
                    text: '<p>服务器出错，请稍后重试！</p>',
                    sticky: false,
                    time: 2000
                });
                return false;
            }
        );
    },

    render : function()
    {
        if(this.state.loading)
        {
            return (<span>loading...</span>);
        }
        if(this.state.err)
        {
            return (<span>err: {JSON.stringify(this.state.err)}</span>);
        }
        var platform = (<span className="label label-info">Unknown</span>);
        if(this.state.data.platform == 1)
        {
            platform = (<span className="label label-info"><i className="fa fa-windows"></i> windows</span>);
        }
        else if(this.state.data.platform == 2)
        {
            platform = (<span className="label label-info"><i className="fa fa-linux"></i> linux</span>);
        }
        var debug = '否';
        if(this.state.data.debug)
        {
            debug = '是';
        }
        if(this.state.data.registered != -1){
            var state;
            if(this.state.data.registered == 1)
                state = '注销';
            else if(this.state.data.registered == 0)
                state = window.LanguageConfig.Settings.Register;
            register = (<button className="btn btn-success btn-sm" type="button" onClick={e => {this.changeRegisterState()}}><i className="fa fa-retweet"> </i>{state}</button>)
        }
        return (
            <div className="wrapper">
                <p><strong>{window.LanguageConfig.Settings.Version}&nbsp;:&nbsp;</strong><span>v{this.state.data.version}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.OID}&nbsp;:&nbsp;</strong><span>{this.state.data.oid}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.Port}&nbsp;:&nbsp;</strong><span>{this.state.data.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.Platform}&nbsp;:&nbsp;</strong><span>{platform}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.DBTitle}&nbsp;:&nbsp;</strong><span>{window.LanguageConfig.Settings.DBName}&nbsp;:&nbsp;{this.state.data.mongodb.name}&nbsp;{window.LanguageConfig.Settings.DBHost}&nbsp;:&nbsp;{this.state.data.mongodb.host}&nbsp;{window.LanguageConfig.Settings.DBPort}端口&nbsp;:&nbsp;{this.state.data.mongodb.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.UDXDBTitle}&nbsp;:&nbsp;</strong><span>{window.LanguageConfig.Settings.UDXDBHost}&nbsp;:&nbsp;{this.state.data.redis.host}&nbsp;{window.LanguageConfig.Settings.UDXDBPort}&nbsp;:&nbsp;{this.state.data.redis.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.SocketTitle}&nbsp;:&nbsp;</strong><span>{window.LanguageConfig.Settings.SocketHost}&nbsp;:&nbsp;{this.state.data.socket.host}&nbsp;{window.LanguageConfig.Settings.SocketPort}&nbsp;:&nbsp;{this.state.data.socket.port}</span> </p>
                <p><strong>{window.LanguageConfig.Settings.Demarcation}&nbsp;:&nbsp;</strong><span>{this.state.data.data_size}&nbsp;byte</span> </p>
                <p><strong>{window.LanguageConfig.Settings.DebugMode}&nbsp;:&nbsp;</strong><span>{ debug }</span> </p>
                {register}
            </div>
        );
    }
});

module.exports = SystemSetting;