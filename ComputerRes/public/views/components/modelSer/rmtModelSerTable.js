/**
 * Created by Franklin on 2017/3/22.
 */
var React = require('react');
var Axios = require('axios');

var RmtModelSerTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            ms : null,
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
                                "data": "/modelser/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": false,
                                //排序配置
                                "aaSorting": [[5, "dsc"]],
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

    startRmtModelSerHandle : function (e, host, msid) {
        if(confirm('确定开启模型?') == true)
        {
            Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=start').then(
                data => {
                    this.refresh();
                }
            );
        }
    },

    stopRmtModelSerHandle : function (e, host, msid) {
        if(confirm('确定开启模型?') == true)
        {
            Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=stop').then(
                data => {
                    this.refresh();
                }
            );
        }
    },

    deleteRmtModelSerHandle : function(e, host, msid) {
        if(confirm('确定删除模型?') == true)
        {
            Axios.delete('/modelser/rmt/' + host + '/' + msid ).then(
                data => {
                    this.refresh();
                }
            );
        }
    },

    openModelSerInfoHandle : function (e, host, msid) {
        window.location = '/modelser/rmt/' + host + '/' + msid;
    },

    openModelSerProHandle : function (e, host, msid) {
        window.open('/modelser/rmt/preparation/' + host + '/' + msid + '');
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
        var MsItems = this.state.data.map(function(host){
            if(host.ping == 'err')
            {
                return;
            }
            var mss = host.ms.map(function (item) {
                var platform;
                if(item.ms_platform == 1)
                {
                    platform = (<span className="label label-info"><i className="fa fa-windows"></i>windows</span>);
                }
                else if(item.ms_platform == 2)
                {
                    platform = (<span className="label label-info"><i className="fa fa-linux"></i>linux</span>);
                }
                else
                {
                    platform = (<span className="label label-info">Unknown</span>);
                }
                var status;
                var button;
                var button2;
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success">可用</span>);
                    button = (
                        <button className="btn btn-default btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, host.host, item._id) }} >
                            <i className="fa fa-retweet"> </i>调用
                        </button>);
                    button2 = (
                        <button className="btn btn-danger btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title="" data-original-title="停止服务"
                                onClick={(e)=>{this.stopRmtModelSerHandle(e, host.host, item._id)}} >
                            <i className="fa fa-stop"> </i>
                        </button>
                    );
                }
                else
                {
                    status = (<span className="badge badge-defult">不可用</span>);
                    button = (
                        <button className="btn btn-success btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title="" data-original-title="启动服务"
                                onClick={(e)=>{this.startRmtModelSerHandle(e, host.host, item._id)}} >
                            <i className="fa fa-play"> </i>
                        </button>
                    );
                    button2 = (
                        <button className="btn btn-warning btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title="" data-original-title="删除服务"
                            onClick={(e) => { this.deleteRmtModelSerHandle(e, host.host, item._id) }} >
                            <i className="fa fa-trash-o"> </i>
                        </button>
                    );
                }
                return (
                    <tr>
                        <td>{item.ms_model.m_name}</td>
                        <td>{item.mv_num}</td>
                        <td>{platform}</td>
                        <td>{status}</td>
                        <td>0/1</td>
                        <td>{host.host}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, host.host, item._id ) } }  ><i className="fa fa-book"></i>详情</button>&nbsp;
                            {button}&nbsp;{button2}
                        </td>
                    </tr>
                );
            }.bind(this));
            return mss;
        }.bind(this));
        return (
            <table className="display table table-bordered table-striped" id="dynamic-table">
                <thead>
                <tr>
                    <th>模型服务名称</th>
                    <th>版本</th>
                    <th>平台</th>
                    <th>状态</th>
                    <th>应用池</th>
                    <th>地址</th>
                    <th>操作</th>
                </tr>
                </thead>
                <tbody>
                {MsItems}
                </tbody>
            </table>
        );
    }
});

module.exports = RmtModelSerTable;