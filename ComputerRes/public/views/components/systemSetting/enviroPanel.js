//环境字典面板
//包括：
//     展示信息的panel
//     添加操作的button
//     modal以及对应的操作

var React = require('react');
var Axios = require('axios');

var EnviroTableTree = require('./enviroTableTree');

var EnviroPanel = React.createClass({
    getInitialState : function () {
        return {
        };
    },

    componentDidMount : function () {

    },

    componentDidUpdate:function () {

    },

    addChecked:function (e,refname) {
        var method = refname.indexOf('auto')!=-1?'auto':'select';
        var type = refname.indexOf('swe')!=-1?'software':'hardware';
        var checkedItems = this.refs[refname].getChecked();
        if(checkedItems.length == 0){
            return $.gritter.add({
                title: '提示：',
                text: '请选择'+(type=='software'?'软件':'硬件')+'环境',
                sticky: false,
                time: 2000
            });
            // return $('#' + this.props.tableID + '-' + method + '-modal').trigger("click");
        }
        var addData = {
            itemsID:checkedItems
        };
        var url = '/setting/enviro?method=' + method + '&type=' + type;
        Axios.post(url,addData).then(
            data => {
                $('#' + this.props.tableID + '-' + method + '-modal').trigger("click");
                this.refs[this.props.tableID + '-ref'].refreshTree();
                $.gritter.add({
                    title: '提示：',
                    text: '添加'+(type=='software'?'软件':'硬件')+'环境成功！',
                    sticky: false,
                    time: 2000
                });
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: '添加'+(type=='software'?'软件':'硬件')+'环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
            }
        );
    },

    render : function() {
        var url = '/setting/enviro?type=' + this.props.type;
        var panelTitle,addBySelect,autoAddName;
        if(this.props.type == 'software'){
            autoAddName = '检测添加';
            panelTitle = '软件环境字典';
            addBySelect = (
                <div style={{margin:'0 20px 0 0px'}} className="btn-group">
                    <button id={this.props.tableID + '-select-btn'} data-toggle="modal" data-target={'#' + this.props.tableID + '-select-modal'} className="btn btn-primary">
                        选择添加 <i className="fa fa-plus"></i>
                    </button>
                </div>
            );
        }
        else if(this.props.type == 'hardware'){
            autoAddName = '自动检测';
            panelTitle = '硬件环境字典';
            addBySelect = null;
        }

        var autoTableTree = {
            editable:false,
            checkbox:true,
            operate:false,
            autowidth:false,
            css:{
                width:{
                    tabletree:700,
                    title:350,
                    value:350
                }
            }
        };
        var autoModalTT = null,selectModalTT = null;
        autoModalTT = (
            <EnviroTableTree
                tableID={this.props.tableID + '-auto'}
                tabletree={autoTableTree}
                source={url + '&method=auto'}
                ref={this.props.tableID + '-auto-ref'}
                fields={this.props.fields}
            />
        );
        if(this.props.type == 'software'){
            selectModalTT = (
                <EnviroTableTree
                    tableID={this.props.tableID + '-select'}
                    tabletree={autoTableTree}
                    source={url + '&method=select'}
                    ref={this.props.tableID + '-select-ref'}
                    fields={this.props.fields}
                />
            );
        }

        return (
            <div>
                <div className="panel panel-info">
                    <div className="panel-heading">
                        {panelTitle}
                            <span className="tools pull-right">
                            <a href="javascript:;" className="fa fa-chevron-down"></a>
                        </span>
                    </div>
                    <div className="panel-body">
                        <section className="panel">
                            <div className="panel-body">
                                <div className="editable-table ">
                                    <div className="clearfix" style={{margin:"0 0 20px 0px"}}>
                                        {addBySelect}
                                        <div style={{margin:'0 20px 0 0px'}} className="btn-group">
                                            <button id={this.props.tableID + '-auto-btn'} data-toggle="modal" data-target={'#' + this.props.tableID + '-auto-modal'} className="btn btn-primary">
                                                {autoAddName} <i className="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div className="btn-group">
                                            <button id={this.props.tableID + '-btn'} onClick={e => {this.refs[this.props.tableID + '-ref'].getTableTree().newItem()}} className="btn btn-primary">
                                                手动添加 <i className="fa fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space15"></div>

                                    <EnviroTableTree
                                        tableID={this.props.tableID}
                                        tabletree={this.props.tabletree}
                                        source={url + '&method=get'}
                                        ref={this.props.tableID + '-ref'}
                                        fields={this.props.fields}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id={this.props.tableID + '-auto-modal'} className="modal fade">
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    从自动检测结果中选择添加环境选项
                                </h4>
                            </div>
                            <div className="modal-body">
                                {autoModalTT}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">关闭
                                </button>
                                <button type="button" className="btn btn-primary" onClick={(e) => {this.addChecked(e,this.props.tableID + '-auto-ref')}}>
                                    添加所选项
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id={this.props.tableID + '-select-modal'} className="modal fade">
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    从汇总数据库中选择添加环境选项
                                </h4>
                            </div>
                            <div className="modal-body">
                                {selectModalTT}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">关闭
                                </button>
                                <button type="button" className="btn btn-primary" onClick={ (e) => {this.addChecked(e,this.props.tableID + '-select-ref')}}>
                                    添加所选项
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
});

module.exports = EnviroPanel;