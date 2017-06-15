/**
 * Created by Franklin on 2017/3/21.
 */

var React = require('react');
var Axios = require('axios');

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
                <a style="more" href={ms.ms_model.m_url} >更多信息</a>
            );
        }
        var img = (<img src="/images/modelImg/default.png" alt=""  />);
        if(this.state.ms.ms_img.trim() != '' && this.state.ms.ms_img != null){
            img = (<img height="128px" width="128px" src={ '/images/modelImg/' + this.state.ms.ms_img } alt=""  />)
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
                            <p style={{"fontSize" : "14px", "color" : "#aaa"}}  >
                                <strong>模型名称&nbsp;:&nbsp;</strong>{this.state.ms.ms_model.m_name}
                                <br />
                                <strong>模型类型&nbsp;:&nbsp;</strong>{this.state.ms.ms_model.m_type}
                                <br />
                                <strong>版本号&nbsp;:&nbsp;</strong>{this.state.ms.mv_num}
                                <br />
                                <strong>所在平台&nbsp;:&nbsp;</strong>{platform}
                                <br />
                                <strong>部署时间&nbsp;:&nbsp;</strong>{this.state.ms.ms_update}
                                <br />
                                <strong>状态&nbsp;:&nbsp;</strong>{status}
                                <br />
                                <strong>描述&nbsp;:&nbsp;</strong>{this.state.ms.ms_des}
                                <br />{detail}
                                <br />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ModelSerInfo;