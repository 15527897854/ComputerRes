/**
 * Created by Franklin on 2017/3/27.
 */
var React = require('react');
var Axios = require('axios');

var ParentPanel = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            parent : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if(data.data.res == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.parent});
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    render : function () {
        if(this.state.loading)
        {
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }
        return (
            <div>
                
            </div>
        );
    }
});

module.exports = ParentPanel;