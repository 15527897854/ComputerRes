/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var DataUploader = require('./dataUploader');

var DataCollectionTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : null,
            init : false
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
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(!this.state.init)
                    {
                        $('#dataCollection-table').dataTable(
                            {
                                //数据URL
                                "data": "/modelser/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": true,
                                //排序配置
                                "aaSorting": [[2, "desc"]],
                                //自适应宽度
                                "bAutoWidth": true,
                                //多语言配置
                                "oLanguage": {
                                    "sLengthMenu": "每页显示 _MENU_ 条记录",
                                    "sZeroRecords": "对不起，查询不到任何相关数据",
                                    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                                    "sInfoEmtpy": "找不到相关数据",
                                    "sInfoFiltered": "数据表中共为 _MAX_ 条记录)",
                                    "sProcessing": "正在加载中...",
                                    "sSearch": "搜索",
                                    //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
                                    "sUrl": "",
                                    "oPaginate": {
                                        "sFirst":    "第一页",
                                        "sPrevious": " 上一页 ",
                                        "sNext":     " 下一页 ",
                                        "sLast":     " 最后一页 "
                                    }
                                }
                            }
                        );
                        this.setState({init : true});
                    }
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    displayData : function(e, gdid){
        window.open('/geodata/json/' + gdid);
    },

    downloadData : function(e, gdid){
        window.open('/geodata/' + gdid);
    },

    deleteData : function(e, gdid, gdtag){
        if(confirm('确认删除此数据 - ' + gdid + ' - ' + gdtag))
        {
            Axios.delete('/geodata/' + gdid).then(
                data => {
                    if(data.data.result == 'suc'){
                        alert('删除成功！');
                        this.refresh();
                    } },
                err => {  }
            );
        }
    },

    render : function() {
        if(this.state.loading)
        {
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        var dataItems = this.state.data.map(function(item){
            var format = null;
            if(item.gd_type == 'FILE')
            {
                format = (<span className="label label-info" ><i className="fa fa-file"></i> 文件</span>);
            }
            else if(item.gd_type == 'STREAM')
            {
                format = (<span className="label label-info" ><i className="fa fa-ellipsis-v"></i> 数据流</span>);
            }
            return(
                <tr key={item.gd_id}>
                    <td>{item.gd_id}</td>
                    <td>{format}</td>
                    <td>{item.gd_datetime}</td>
                    <td>{item.gd_tag}</td>
                    <td>
                        <button className="btn btn-info btn-xs" onClick={(e) => {this.displayData(e, item.gd_id)} } ><i className="fa fa-book"> </i> 查看</button>&nbsp;
                        <button className="btn btn-success btn-xs" onClick={(e) => {this.displayData(e, item.gd_id)} } ><i className="fa fa-picture-o"> </i> 渲染</button>&nbsp;
                        <button className="btn btn-default btn-xs" onClick={(e) => {this.downloadData(e, item.gd_id)} } ><i className="fa fa-download"> </i> 下载</button>&nbsp;
                        <button className="btn btn-warning btn-xs" onClick={(e) => {this.deleteData(e, item.gd_id, item.gd_tag)} } ><i className="fa fa-trash-o"> </i></button>
                    </td>
                </tr>
            );
        }.bind(this));
        return (
            <div>
                <div>
                    <DataUploader onFinish={this.refresh} />
                </div>
                <table className="display table table-bordered table-striped" id="dataCollection-table">
                    <thead>
                        <tr>
                            <th>数据ID</th>
                            <th>存储方式</th>
                            <th>生成时间</th>
                            <th>标签</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataItems}
                    </tbody>
                </table>
                <div aria-hidden="true" aria-labelledby="gateGateModelDetail" role="dialog" tabIndex="-1" id="diaDetail" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">服务</h4>
                            </div>
                            <div className="modal-body">

                            </div>
                            <div className="modal-footer">
                                <button id="btn_ok" type="button" className="btn btn-default" data-dismiss="modal" >关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DataCollectionTable;