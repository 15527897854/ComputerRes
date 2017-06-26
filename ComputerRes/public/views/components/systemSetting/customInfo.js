/**
 * Created by Franklin on 2017/6/25.
 */

var React = require('react');
var Axios = require('axios');

var CustomInfoPanel = React.createClass({
    getInitialState : function(){
        return {};
    },

    componentDidMount : function(){
        
    },

    render : function(){
        return (
            <div className="wrapper">
                <p><strong>计算机名&nbsp;:&nbsp;</strong><span>{"123"}</span> </p>
                <p><strong>是否注册&nbsp;:&nbsp;</strong><span>{"否"}</span> </p>
            </div>
        );
    }
});

module.exports = CustomInfoPanel;