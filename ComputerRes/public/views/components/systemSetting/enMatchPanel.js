/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');

var EnMatchPanel = React.createClass({
    getInitialState:function () {
        return {
            loading:true,
            err:null,
            demands:[]
        };
    },

    componentDidMount:function () {
        let url = '/modelser/demands/' + this.props.pid + '?place=' + this.props.place;
        Axios.get(url).then(
            data => {
                if(data.data.status == 1){
                    this.setState({demands:data.data.demands})
                }
                else{
                    $.gritter.add({
                        title: '警告：',
                        text: '获取环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({err:{code:'获取模型运行环境失败！'}});
                }
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: '获取环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                this.setState({err:err});
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
    }
});

module.exports = EnMatchPanel;