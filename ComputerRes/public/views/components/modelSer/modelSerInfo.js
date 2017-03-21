/**
 * Created by Franklin on 2017/3/21.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerInfo = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            msr : null,
        };
    },
    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {
                this.setState({loading : false, msr : data.data});
            },
            err => {  }
        );
    },
    render : function () {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    模型服务信息
                    <span className="tools pull-right">
                        <a href="javascript:;" className="fa fa-chevron-down"> </a>
                    </span>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="blog-img">
                                <img src="/images/modelImg/default.png" alt=""  />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <p style="font-size: 14px; color:#aaa" >
                                <strong>模型名称&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>模型类型&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>版本号&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>所在平台&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>部署时间&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>状态&nbsp;:&nbsp;</strong>
                                <br />
                                <strong>描述&nbsp;:&nbsp;</strong>
                                <br />
                                <br />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});