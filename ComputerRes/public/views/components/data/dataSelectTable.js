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
                if(data.data.result == 'err')
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
                                    "sLengthMenu": window.LanguageConfig.TablePaging.LengthMenu,
                                    "sZeroRecords": window.LanguageConfig.TablePaging.ZeroRecords,
                                    "sInfo": window.LanguageConfig.TablePaging.Info,
                                    "sInfoEmtpy": window.LanguageConfig.TablePaging.InfoEmtpy,
                                    "sInfoFiltered": window.LanguageConfig.TablePaging.InfoFiltered,
                                    "sProcessing": window.LanguageConfig.TablePaging.Processing,
                                    "sSearch": window.LanguageConfig.TablePaging.Search,
                                    //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
                                    "sUrl": "",
                                    "oPaginate": {
                                        "sFirst":    window.LanguageConfig.TablePaging.Paginate.First,
                                        "sPrevious": window.LanguageConfig.TablePaging.Paginate.Previous,
                                        "sNext":     window.LanguageConfig.TablePaging.Paginate.Next,
                                        "sLast":     window.LanguageConfig.TablePaging.Paginate.Last
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
                <span>Loading...</span>
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
                        <th>{window.LanguageConfig.DataTable.ID}</th>
                        <th>{window.LanguageConfig.DataTable.DateTime}</th>
                        <th>{window.LanguageConfig.DataTable.Tag}</th>
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