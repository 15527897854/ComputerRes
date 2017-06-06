/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');
var EnMatchTable = require('./enMatchTable');

var EnMatchPanel = React.createClass({
    getInitialState:function () {
        return {
        };
    },

    componentDidMount:function () {

    },

    componentDidUpdate:function () {

    },

    render:function () {
        // if(this.state.loading)
        //     return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        // if(this.state.err)
        //     return (<span>Server error: {JSON.stringify(this.state.err)}</span>);
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
                                tableID="swe-table"
                                type="swe"
                                pid={this.props.pid}
                                place={this.props.place}
                                css={this.props.css}
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
                            {/*<EnMatchTable*/}
                                {/*tableID="hwe-table"*/}
                                {/*type="hwe"*/}
                                {/*pid={this.props.pid}*/}
                                {/*place={this.props.place}*/}
                                {/*css={this.props.css}*/}
                            {/*/>*/}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EnMatchPanel;