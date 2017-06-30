/**
 * Created by Franklin on 2017/6/14.
 */

var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

var TestifyDataPanel = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : null,
            index : 0
        };
    },

    componentDidMount : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.status == 1){
                    this.setState({
                        loading : false,
                        err : null,
                        data : data.data.testifies
                    });
                }
                else if(data.data.status == 0){
                    this.setState({
                        loading : false,
                        err : null,
                        data : []
                    });
                }
                else if(data.data.status == -1){
                    this.setState({
                        loading : false,
                        err : null,
                        data : []
                    });
                    NoteDialog.openNoteDia('警告', '测试数据加载错误!');
                }
            },err => {
                if(err){
                    this.setState({
                        loading : false,
                        err : err
                    });
                }
            }
        );
    },

    onSelectChange : function(e){
        this.setState({index : e.target.selectedIndex})
    },

    loadTestData : function(e){
        var testData = this.state.data[this.state.index].inputs;
        if(testData == undefined || testData == null){
            return NoteDialog.openNoteDia('警告', '测试数据 : ' + this.state.data[this.state.index].tag + ' 加载失败!');
        }
        for(var i = 0; i < testData.length; i++){
            window.addGeoData(testData[i].StateId, testData[i].Event, testData[i].DataId);
        }
        NoteDialog.openNoteDia('提示', '测试数据 : ' + this.state.data[this.state.index].tag + ' 加载成功!');
    },

    deleteTestData : function(e){
        var testData = this.state.data[this.state.index].inputs;
        Axios.delete(this.props['data-source']).then(
            data => {},
            err => {}
        );
        NoteDialog.openNoteDia('提示', '测试数据 : ' + this.state.data[this.state.index].tag + ' 删除成功!');
    },
    
    render : function(){
        var body = null;
        if(this.state.loading){
            body = (
                <div className="panel-body">
                    <div id="testify-body" className="panel-body" >
                        加载中...
                    </div>
                </div>
            );
        }
        else if(this.state.err){
            body = (
                <div className="panel-body">
                    <div id="testify-body" className="panel-body" >
                        出现异常 : {JSON.stringify(this.state.err)}
                    </div>
                </div>
            );
        }
        else{
            if(this.state.data.length == 0){
                body = (
                    <div id="testify-body" className="panel-body" >
                        <h4>没有测试数据！</h4>
                    </div>
                );
            }
            else{
                var selectOptions = null;
                selectOptions = this.state.data.map(function(element) {
                    return (<option key={element.tag} >{element.tag}</option>);
                });

                var delButton = null;
                if(this.props["data-type"] != 'custom'){
                    delButton = (<input id="btn_testify_del" type="button" className="btn btn-danger" value="删除测试数据" onClick={this.deleteTestData} />);
                }

                body = (
                    <div id="testify-body" className="panel-body" >
                        <div className="form-horizontal adminex-form" >
                            <div className="form-group" >
                                <label className="col-sm-2 col-sm-2 control-label" htmlFor="testifies">标签:</label>
                                <div className="col-sm-6" >
                                    <select id="testifies" className="form-control m-bot15" onChange={this.onSelectChange} >
                                        { selectOptions }
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" >
                                <label className="col-sm-2 col-sm-2 control-label" >描述:</label>
                                <div className="col-sm-6" >
                                    <p>{ this.state.data[this.state.index].detail }</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <input id="btn_testify_load" type="button" className="btn btn-warning" value="加载测试数据" onClick={this.loadTestData} /> &nbsp;&nbsp;&nbsp;
                                {delButton}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        return (
        <div className="panel panel-info" id="testify-panel">
            <div className="panel-heading" style={ { "backgroundColor" :"#46B8DA" , "bordeColor" : "#46B8DA" } }>
                测试数据
                <span className="tools pull-right">
                    <a href="javascript:;" className="fa fa-chevron-down"></a>
                 </span>
            </div>
            {body}
        </div>
        );
    }
});

module.exports = TestifyDataPanel;