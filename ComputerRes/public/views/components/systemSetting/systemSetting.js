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
                state = '注册';
            register = (<button className="btn btn-success btn-sm" type="button" onClick={e => {this.changeRegisterState()}}><i className="fa fa-retweet"> </i>{state}</button>)
        }
        return (
            <div className="wrapper">
                <p><strong>当前版本&nbsp;:&nbsp;</strong><span>v{this.state.data.version}</span> </p>
                <p><strong>计算机资源OID&nbsp;:&nbsp;</strong><span>v{this.state.data.oid}</span> </p>
                <p><strong>开放端口&nbsp;:&nbsp;</strong><span>{this.state.data.port}</span> </p>
                <p><strong>平台&nbsp;:&nbsp;</strong><span>{platform}</span> </p>
                <p><strong>模型信息库&nbsp;:&nbsp;</strong><span>数据库名称&nbsp;:&nbsp;{this.state.data.mongodb.name}&nbsp;服务器&nbsp;:&nbsp;{this.state.data.mongodb.host}&nbsp;端口&nbsp;:&nbsp;{this.state.data.mongodb.port}</span> </p>
                <p><strong>UDX数据库&nbsp;:&nbsp;</strong><span>服务器&nbsp;:&nbsp;{this.state.data.redis.host}&nbsp;端口&nbsp;:&nbsp;{this.state.data.redis.port}</span> </p>
                <p><strong>Socket&nbsp;:&nbsp;</strong><span>服务器&nbsp;:&nbsp;{this.state.data.socket.host}&nbsp;端口&nbsp;:&nbsp;{this.state.data.socket.port}</span> </p>
                <p><strong>数据分界点&nbsp;:&nbsp;</strong><span>{this.state.data.data_size}&nbsp;byte</span> </p>
                <p><strong>调试状态&nbsp;:&nbsp;</strong><span>{ debug }</span> </p>
                {register}
            </div>
        );
    }
});

module.exports = SystemSetting;