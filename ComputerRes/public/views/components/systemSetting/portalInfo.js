/**
 * Created by Franklin on 2017/5/14.
 */

var React = require('react');

var PortalInfo = React.createClass({
    render : function(){
        return (
            <div>
                <p>门户用户名: {} &nbsp;&nbsp;&nbsp;<button className="btn btn-sm btn-info" >更改用户信息</button></p>
            </div>
        );
    }
});

module.exports = PortalInfo;