/**
 * Created by Franklin on 2017/3/14.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerRunInfo = React.createClass({
    getInitialState : function () {
        return {
            msrid : "",
            ms_id : "",
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {  },
            err => {  }
        );
    },

    render : function () {
        return (
            <div className="panel panel-info">
                <div className="panel-heading">
                    模型运行信息
                    <span className="tools pull-right">
                    <a href="javascript:;" className="fa fa-chevron-down"> </a>
                 </span>
                </div>
                <div className="panel-body">
                    <p><strong>模型开始时间&nbsp;:&nbsp;</strong>{}</p>
                    <p><strong>模型调用者&nbsp;:&nbsp;</strong>{}</p>
                    <p><strong>运行实例GUID&nbsp;:&nbsp;</strong>{}</p>
                    <p><strong>输入数据&nbsp;:&nbsp;</strong><br />{}</p>
                    <p><strong>输出数据&nbsp;:&nbsp;</strong><br />{}</p>
                    <p><strong>模型运行描述信息&nbsp;:&nbsp;</strong><br />{}</p>
                    <p><strong>运行时间&nbsp;:&nbsp;</strong>{}&nbsp;s&nbsp;</p>
                    <p><strong>当前进度&nbsp;:&nbsp;</strong></p>
                    <div className="progress progress-striped active progress-sm">
                        <div id="bar_pro" style="width: 100%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                            <span className="sr-only">40% 完成</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerRunInfo;