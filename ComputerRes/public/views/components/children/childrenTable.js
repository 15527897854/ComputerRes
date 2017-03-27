/**
 * Created by Franklin on 2017/3/26.
 */
var React = require('react');
var Axios = require('axios');

var ChildrenTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            children : null
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
                    this.setState({loading : false, err : false, data : data.data.children});
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
                            "bSort": true,
                            //排序配置
                            "aaSorting": [[1, "dsc"]],
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

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openUploadModelSerHandle : function (e, host) {
        window.location.href = '/modelser/rmt/' + host + '/new';
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
        var Children = this.state.data.map(function(child) {
            var platform;
            if(child.platform == 1)
            {
                platform = (<span className="label label-info"><i className="fa fa-windows"></i>windows</span>);
            }
            else if(child.platform == 2)
            {
                platform = (<span className="label label-info"><i className="fa fa-linux"></i>linux</span>);
            }
            else
            {
                platform = (<span className="label label-info">Unknown</span>);
            }
            var status;
            var button;
            if(child.ping == 1)
            {
                status = (<span className="badge badge-success">可用</span>);
                button = (
                    <button className="btn btn-default btn-xs" type="button"  onClick={ (e)=>{this.openUploadModelSerHandle(e, child.host)} } >
                        <i className="fa fa-cloud-upload"> </i>上传模型
                    </button>);
            }
            else
            {
                status = (<span className="badge badge-defult">不可用</span>);
            }
            return (
                <tr>
                    <td>{child.host}</td>
                    <td>{child.port}</td>
                    <td>{platform}</td>
                    <td>{status}</td>
                    <td>
                        <button className="btn btn-info btn-xs" type="button"  ><i className="fa fa-book"></i>详情</button>&nbsp;
                        {button}
                    </td>
                </tr>
            );
        }.bind(this));
        return (
            <table className="display table table-bordered table-striped" id="dynamic-table">
                <thead>
                <tr>
                    <th>地址</th>
                    <th>端口</th>
                    <th>平台</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
                </thead>
                <tbody>
                {Children}
                </tbody>
            </table>
        );
    }
});

module.exports = ChildrenTable;