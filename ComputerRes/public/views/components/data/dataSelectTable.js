/**
 * Created by Franklin on 2017/4/5.
 */
var React = require('react');
var Axios = require('axios');

var DataSelectTable = React.createClass({
    getInitialState : function () {
        var id = '';
        if(this.props['data-id'])
        {
            id = this.props['data-id'];
        }
        return {
            id : id,
            loading : true,
            err : null,
            data : null,
            gdid : ''
        };
    },

    componentDidMount : function () {
        //this.refresh();
    },

    getSelectedGDID : function(){
        return $("input[name='rd_GDID']:checked").val();
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
                        $('#dataSelect-table' + this.state.id).dataTable(
                            {
                                //数据URL
                                "data": "/geodata/json/all",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": false,
                                //初始化显示条目数
                                "iDisplayLength" : 5,
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

            return(
                <tr key={item.gd_id}>
                    <td><input className="radio " name="rd_GDID" type="radio" value={item.gd_id} /></td>
                    <td>{item.gd_id}</td>
                    <td>{item.gd_datetime}</td>
                    <td>{item.gd_tag}</td>
                </tr>
            );
        }.bind(this));
        return (
            <div>
                <table className="display table table-bordered table-striped" id={'dataSelect-table' + this.state.id}>

                    <thead>
                    <tr>
                        <th> </th>
                        <th>数据ID</th>
                        <th>生成时间</th>
                        <th>标签</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dataItems}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = DataSelectTable;