/**
 * Created by Franklin on 2017/3/25.
 */

var React = require('react');
var Axios = require('axios');

var RmtModelSerRunTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            msr : null,
            init : true
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
                    if(this.state.init)
                    {
                        //初始化完成
                        $('#dynamic-table').dataTable(
                            {
                                //数据URL
                                "data": "/modelserrun/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": false,
                                //排序配置
                                "aaSorting": [[3, "dsc"]],
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
                        this.setState({init : false});
                    }

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openModelSerRunInfoHandle : function (e, host, msid) {
        window.location = '/modelserrun/rmt/' + host + '/' + msid;
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
        var MrsItems = this.state.data.map(function(host){
            if(host.ping == 'err')
            {
                return;
            }
            var msrs = host.msr.map(function (item) {
                var status = '';
                if(item.msr_status == 0)
                {
                    status = '未完成';
                }
                if(item.msr_status == -1)
                {
                    status = '出现异常';
                }
                if(item.msr_status == 1)
                {
                    status = '已完成';
                }
                return (
                    <tr>
                        <td>{host.host}</td>
                        <td>{item._id}</td>
                        <td>{item.msr_ms.ms_model.m_name}</td>
                        <td>{item.msr_guid}</td>
                        <td>{item.msr_date}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerRunInfoHandle(e, host.host, item._id ) } }  ><i className="fa fa-book"></i>详情</button>&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
            return msrs;
        }.bind(this));
        return (
            <table className="display table table-bordered table-striped" id="dynamic-table">
                <thead>
                <tr>
                    <th>地址</th>
                    <th>记录ID</th>
                    <th>名称</th>
                    <th>GUID</th>
                    <th>调用时间</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
                </thead>
                <tbody>
                {MrsItems}
                </tbody>
            </table>
        );
    }
});

module.exports = RmtModelSerRunTable;