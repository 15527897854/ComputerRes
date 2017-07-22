/**
 * Created by Franklin on 2017/3/14.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerRunInfo = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            msr : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.msr){
                    this.setState({msr : data.data.msr, loading : false});
                }
                else{
                    this.setState({err : data.data, loading : false});
                }
             },
            err => {  }
        );
    },

    render : function () {
        if(this.state.loading){
            return (<span>loading...</span>);
        }
        if(this.state.error){
            return (<span>Error:{JSON.stringify(this.state.error)}</span>);
        }
        var user = '';
        if(this.state.msr.msr_user.u_type == 0){
            user += '本地调用者';
        }
        else{
            user += '外地调用者';
        }
        user += ' - ' + this.state.msr.msr_user.u_name;
        var descript = this.state.msr.msr_des;
        // descript = descript.replace(/\r\n/g, '<br />');
        // descript = descript.replace(/\\r\\n/g, '<br />');
        // descript = descript.replace(/\\n/g, '<br />');
        // descript = descript.replace(/\"/g, '');
        // descript = descript.replace(/Stand Output Message :/g, '<span class="label label-info" >模型程序标准输出</span><br />');
        // descript = descript.replace(/Stand Error Message :/g, '<span class="label label-warning" >模型程序错误信息</span><br />');
        // descript = descript.replace(/Error Message :/g, '<span class="label label-danger" >调用错误信息</span><br />');
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    模型运行信息
                    <span className="tools pull-right">
                    <a href="javascript:;" className="fa fa-chevron-down"> </a>
                 </span>
                </div>
                <div className="panel-body">
                    <p><strong>模型开始时间&nbsp;:&nbsp;</strong>{this.state.msr.msr_date}</p>
                    <p><strong>模型调用者&nbsp;:&nbsp;</strong>{user}</p>
                    <p><strong>运行实例GUID&nbsp;:&nbsp;</strong>{this.state.msr.msr_guid}</p>
                    <p><strong>输入数据&nbsp;:&nbsp;</strong><br />{}</p>
                    <p><strong>输出数据&nbsp;:&nbsp;</strong><br />{}</p>
                    <p><strong>模型运行描述信息&nbsp;:&nbsp;</strong><br />{descript}</p>
                    <p><strong>运行时间&nbsp;:&nbsp;</strong>{this.state.msr.msr_time}&nbsp;s&nbsp;</p>
                    <p><strong>当前进度&nbsp;:&nbsp;</strong></p>
                    <div className="progress progress-striped active progress-sm">
                        <div id="bar_pro" style={ { width: "100%" } } aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                            <span className="sr-only">40% 完成</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerRunInfo;