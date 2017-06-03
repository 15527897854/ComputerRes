/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');
var EnMatchTable = require('./enMatchTable');

var EnMatchPanel = React.createClass({
    getInitialState:function () {
        return {
            loading:true,
            err:null,
            demands:{}
        };
    },

    componentDidMount:function () {
        var url = '/modelser/demands/' + this.props.pid + '?place=' + this.props.place;
        Axios.get(url).then(
            data => {
                if(data.data.status == 1){
                    this.setState({loading:false,demands:data.data.demands})
                }
                else{
                    $.gritter.add({
                        title: '警告：',
                        text: '获取环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({loading:false,err:{code:'获取模型运行环境失败！'}});
                }
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: '获取环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                this.setState({loading:false,err:err});
            }
        );
    },

    componentDidUpdate:function () {

    },

    render:function () {
        if(this.state.err){
            return (<span>Server error: {JSON.stringify(this.state.err)}</span>);
        }
        if(this.state.loading){
            return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        }
        // var sweML=null,hweML=null;
        // if(this.state.demands.swe && this.state.demands.swe.length){
        //     sweML = [];
        //     var sweDemands = this.state.demands.swe;
        //     for(var i=0;i<sweDemands.length;i++){
        //         sweML.push((
        //             <EnMatchTable
        //                 demand={sweDemands[i]}
        //             />
        //         ))
        //     }
        // }
        // if(this.state.demands.hwe && this.state.demands.hwe.length){
        //     hweML = [];
        //     var hweDemands = this.state.demands.swe;
        //     for(var i=0;i<hweDemands.length;i++){
        //         hweML.push((
        //             <EnMatchTable
        //                 demand={hweDemands[i]}
        //             />
        //         ))
        //     }
        // }
        
        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">
                        软件环境
                        <span className="tools pull-right">
                            <a href="javascript:;" className="fa fa-chevron-down"></a>
                        </span>
                    </div>
                    <div className="panel-body">
                        <div className="editable-table ">
                            <EnMatchTable
                                demands={this.props.demands.swe}
                            />
                        </div>
                    </div>
                </div>

                <div className="panel panel-info">
                    <div className="panel-heading">
                        硬件环境
                        <span className="tools pull-right">
                            <a href="javascript:;" className="fa fa-chevron-down"></a>
                        </span>
                    </div>
                    <div className="panel-body">
                        <div className="editable-table ">
                            <EnMatchTable
                                demands={this.props.demands.hwe}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EnMatchPanel;