/**
 * Created by Franklin on 2017/7/17.
 */

var React = require('react');
var Axios = require('axios');

var ModelSerRunStatisitc = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : []
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function(){
        Axios.get(this.props['data-source'] + '&days=' + $('#day_lengh').val()).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({ loading : false});
                    $.plot($("#records_statistic"), [{
                        data: data.data.data.data,
                        label: "Number of invoking",
                        lines: {
                            fill: true
                        }
                    }],
                    {
                        series: {
                            lines: {
                                show: true,
                                fill: true
                            },
                            points: {
                                show: true,
                                lineWidth: 2,
                                fill: true,
                                fillColor: "#ffffff",
                                symbol: "circle",
                                radius: 5
                            },
                            shadowSize: 0
                        },
                        grid: {
                            hoverable: true,
                            clickable: true,
                            tickColor: "#f9f9f9",
                            borderWidth: 1,
                            borderColor: "#eeeeee"
                        },
                        colors: ["#65CEA7", "#424F63"],
                        tooltip: true,
                        tooltipOpts: {
                            defaultTheme: false
                        },
                        xaxis: {
                            ticks: data.data.data.ticks
                        },
                        yaxes: {
                            position: "left",
                        }
                    });
                }
                else{
                    this.setState({err : data.data.message, loading : false});
                }
             },
            err => {  }
        );
    },

    render : function () {
        // if(this.state.loading){
        //     return (<span>loading...</span>);
        // }
        // if(this.state.error){
        //     return (<span>Error:{JSON.stringify(this.state.error)}</span>);
        // }
        return (
            <div>
                <div className="form-group">
                    <label className="col-md-1 col-sm-1 control-label" style={{"paddingTop" : "8px"}}>Length:</label>
                    <div className="col-md-2 col-sm-2">
                        <select id="day_lengh" name="day_lengh" className="form-control" onChange={this.refresh} >
                            <option value="7">a week</option>
                            <option value="30">30 days</option>
                            <option value="100">100 days</option>
                        </select>
                    </div>
                </div>
                <br />
                <br />
                <br />
                <div id="records_statistic" style={{ "width" : "100%", "height" : "300px", "text-align" : "center", "margin":"0 auto"}}></div>
            </div>
        );
    }
});

module.exports = ModelSerRunStatisitc;