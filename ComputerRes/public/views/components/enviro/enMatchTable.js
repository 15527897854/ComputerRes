/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');

var EnMatchItem = React.createClass({
    getInitialState:function () {
        return {
            loading:true,
            err:null,
            enList:[],
            selected:0
        }
    },
    componentDidMount:function () {
        var url = '/modelser/enmatch?demand=' + JSON.stringify(this.props.demand);
        Axios.get(url).then(
            data=>{
                if(data.data.err){
                    $.gritter.add({
                        title: '警告：',
                        text: '获取相匹配的环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({loading:false,err:{code:'获取相匹配的环境失败！'}});
                }
                else if(data.data.enviro){

                }
            },
            err=>{
                $.gritter.add({
                    title: '警告：',
                    text: '获取相匹配的环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                this.setState({loading:false,err:err});
            }
        )
    },
    render:function () {
        if(this.state.loading)
            return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        if(this.state.err)
            return (<span>Server error: {JSON.stringify(this.state.err)}</span>);
        if(this.state.enList.length){

        }
        return (
            <div>

            </div>
        )
    }
});

module.exports = EnMatchItem;