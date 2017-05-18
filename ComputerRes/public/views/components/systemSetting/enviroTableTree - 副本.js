//用于生成软硬件环境的table tree的模板类
//考虑到两者甚至多者使用该类的兼容性，不依赖具体的表头
//表操作：添加行、编辑行、删除行等

var React = require('react');
var Axios = require('axios');

var enviroTableTree = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            tabletreeJSON : null
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source).then(
            data => {
                this.setState({ loading : false, err : null, tabletreeJSON : data.data.enviro });
            },
            err => {
                this.setState({ loading : false, err : err, tabletreeJSON : null });
            }
        );
    },

    componentDidUpdate:function () {
        var tabletreeJOSN = this.state.tabletreeJSON;
        if(tabletreeJOSN){
            $('#' + this.props.tableID).fancytree({
                extensions:['table','wide'],
                checkbox:false,
                table:{
                    indentation:30
                },
                toggleEffect: { effect: "blind", options: {direction: "vertical", scale: "box"}, duration: 200 },
                source:tabletreeJOSN,
                renderColumns:function (event, data) {
                    var node = data.node,
                        $tdList = $(node.tr).find('>td');
                    // $tdList.eq(0).text(node.title);
                    if( node.isFolder() ) {
                        $tdList.eq(0)
                            .prop("colspan", 3)
                            .nextAll().remove();
                    }

                    $tdList.eq(1).text(node.data.value);
                    $tdList.eq(2).text(node.data.type);
                }
            })
        }
    },

    saveTR : function (trID,thsID,callback) {
        var item = {};
        var url = this.props.source;
        var acType;
        if(trID.indexOf('new-') == -1){
            acType = '更新';
            url += '&ac=update';
            item._id = trID;
        }
        else {
            acType = '添加';
            url += '&ac=new';
        }
        var ths = $('#' + thsID + ' th');
        var tds = $('#' + trID + ' td');
        for(var i=0;i<tds.length-2;i++){
            var itemKey = ths[i].textContent.toLowerCase();
            if(itemKey == 'alias(separator : \';\')')
                itemKey = 'alias';
            item[itemKey] = tds[i].textContent;
        }
        var type = (url.indexOf('software') == -1) ? '硬件' : '软件';
        Axios.post(url,item).then(
            data => {
                var status = data.data.status;
                if(status == 0){
                    $.gritter.add({
                        title: '警告：',
                        text: acType+type+'环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    callback(false);
                }
                else if(status == 1){
                    if(acType == '添加'){
                        $('#' + trID).attr('id',data.data._id);
                    }
                    $.gritter.add({
                        title: '提示：',
                        text: acType+type+'环境成功！',
                        sticky: false,
                        time: 2000
                    });
                    callback(true);
                }
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: acType+type+'环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                callback(false);
            }
        )
    },

    delTR : function (trID,thsID,callback) {
        var url = this.props.source;
        var type = (url.indexOf('software') == -1) ? '硬件' : '软件';
        Axios.post(this.props.source + '&ac=del',{_id:trID}).then(
            data => {
                var status = data.data.status;
                if(status == 0){
                    $.gritter.add({
                        title: '警告：',
                        text: '删除'+type+'环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    callback(false);
                }
                else if(status == 1){
                    $.gritter.add({
                        title: '提示：',
                        text: '删除'+type+'环境成功！',
                        sticky: false,
                        time: 2000
                    });
                    callback(true);
                }
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: '删除'+type+'环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                callback(false);
            }
        )
    },

    autoDetect : function (e) {
        var tableID = this.props.tableID;
        var url = this.props.source + '&isAuto=true';
        if(tableID == 'swe-table'){
            Axios.get(url).then(

            )
        }
        else if(tableID == 'hwe-table'){
            Axios.get(url).then(

            )
        }
    },

    render : function()
    {
        //init state
        {
            if(this.state.loading)
            {
                return (<span>Loading...</span>);
            }
            if(this.state.err)
            {
                return (<span>Server err: {JSON.stringify(this.state.err)}</span>);
            }
        }

        return (
            <section className="panel">
                <div className="panel-body">
                    <div className="editable-table ">
                        <div className="clearfix">
                            <div className="btn-group">
                                <button id={this.props.tableID + '-select-btn'} className="btn btn-primary">
                                    选择添加 <i className="fa fa-plus"></i>
                                </button>
                            </div>
                            <div style={{margin:'0 0 0 20px'}} className="btn-group">
                                <button id={this.props.tableID + '-autoDetect-btn'} onClick={e => {this.autoDetect(e)}} className="btn btn-primary">
                                    自动检测 <i className="fa fa-plus"></i>
                                </button>
                            </div>
                            <div style={{margin:'0 0 0 20px'}} className="btn-group">
                                <button id={this.props.tableID + '-btn'} className="btn btn-primary">
                                    手动添加 <i className="fa fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div className="space15"></div>

                        <table id={this.props.tableID} style={{width:'100%'}} className="">
                            <colgroup>
                                <col width="*"></col>
                                <col width="*"></col>
                                <col width="60px"></col>
                            </colgroup>
                            <thead>
                            <tr>
                                <th>Key</th>
                                <th>Value</th>
                                <th>Type</th>
                                <th>Edit</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>

                    </div>
                </div>
            </section>
        );
    }
});

module.exports = enviroTableTree;