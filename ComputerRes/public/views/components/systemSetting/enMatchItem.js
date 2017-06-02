/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');

var EnMatchItem = React.createClass({
    getInitialState:function () {
        return {
            loading:true,
            err:null
        }
    },
    componentDidMount:function () {
        var url =
        Axios.get(url).then(
            data=>{

            },
            err=>{

            }
        )
    },
    render:function () {
        if(this.state.loading)
            return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        if(this.state.err)
            return (<span>Server error: {JSON.stringify(this.state.err)}</span>);

    }
});

module.exports = EnMatchItem;