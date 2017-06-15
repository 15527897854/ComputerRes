//用于生成软硬件环境的table的模板类
//考虑到两者甚至多者使用该类的兼容性，不依赖具体的表头
//表操作：添加行、编辑行、删除行等

var React = require('react');
var Axios = require('axios');

var enviroTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            tr : null,
            updateNum : 0
        };
    },

    componentDidMount : function () {
        Axios.get(this.props.source + '&method=get').then(
            data => {
                this.setState({ loading : false, err : null, tr : data.data.enviro });
            },
            err => {
                this.setState({ loading : false, err : err, tr : null });
            }
        );
    },

    componentDidUpdate:function () {
        this.init(this.props.tableID,this.props.th.length,this);
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

    init : function (tableID,length,enviroTable) {
        var saveTR = enviroTable.saveTR;
        var delTR = enviroTable.delTR;

        function restoreRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);

            for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                oTable.fnUpdate(aData[i], nRow, i, false);
            }

            oTable.fnDraw();
        }

        function editRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);
            for(var i=0;i<length;i++){
                jqTds[i].innerHTML = '<input type="text" class="form-control small" value="' + aData[i] + '">';
            }
            jqTds[length].innerHTML = '<a class="edit" href="">Save</a>';
            jqTds[length+1].innerHTML = '<a class="cancel" href="">Cancel</a>';
        }

        function saveRow(oTable, nRow) {
            var jqInputs = $('input', nRow);
            for(var i=0;i<length;i++){
                oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
            }
            oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, length, false);
            oTable.fnUpdate('<a class="delete" href="">Delete</a>', nRow, length+1, false);
            oTable.fnDraw();
        }

        function cancelEditRow(oTable, nRow) {
            var jqInputs = $('input', nRow);
            for(var i=0;i<length;i++){
                oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
            }
            oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, length, false);
            oTable.fnDraw();
        }

        var oTable = $('#' + tableID).dataTable({
            fixedColumns: {
                rightColumns: 2
            },
            "columns" : [
                {"width":'10%'}
            ],
            // "sScrollX":"100%",
            "resizable":true,
            "searching" : true,
            "processing" : true,
            "paging" : true,
            "ordering" : true,
            "autoWidth": false,
            "aLengthMenu": [
                [10, 20, 50, -1],
                [10, 20, 50, "All"] // change per page values here
            ],
            // set the initial value
            "iDisplayLength": 10,
            "sDom": "R<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": {
                "sLengthMenu": "_MENU_ records per page",
                "oPaginate": {
                    "sPrevious": "Prev",
                    "sNext": "Next"
                }
            }
        });

        jQuery('#'+tableID+'_wrapper .dataTables_filter input').addClass("form-control medium"); // modify table search input
        jQuery('#'+tableID+'_wrapper .dataTables_length select').addClass("form-control xsmall"); // modify table per page dropdown

        var nEditing = null;

        $('#' + tableID + '-btn').click(function (e) {
            e.preventDefault();
            var newData = [];
            for(var i=0;i<length;i++){
                newData.push('');
            }
            newData.push('<a class="edit" href="">Edit</a>');
            newData.push('<a class="cancel" data-mode="new" href="">Cancel</a>');
            var aiNew = oTable.fnAddData(newData);
            var nRow = oTable.fnGetNodes(aiNew[0]);
            editRow(oTable, nRow);
            nEditing = nRow;
        });

        $('#'+tableID+' a.delete').live('click', function (e) {
            e.preventDefault();

            if (confirm("Are you sure to delete this row ?") == false) {
                return;
            }

            var url = enviroTable.props.source;
            var type = (url.indexOf('software') == -1) ? '硬件' : '软件';
            var trID = e.currentTarget.parentElement.parentElement.id;
            var nRow = $(this).parents('tr')[0];
            if(trID){
                if(trID.indexOf('new-') != -1){
                    oTable.fnDeleteRow(nRow);
                    $.gritter.add({
                        title: '提示：',
                        text: '删除'+type+'环境成功！',
                        sticky: false,
                        time: 2000
                    });
                    callback(true);
                }
                else{
                    delTR(trID,tableID + '-ths',function (status) {
                        if(status){
                            oTable.fnDeleteRow(nRow);
                        }
                        else{

                        }
                    });
                }
            }
            // alert("Deleted! Do not forget to do some ajax to sync with backend :)");
        });

        $('#'+tableID+' a.cancel').live('click', function (e) {
            e.preventDefault();
            if ($(this).attr("data-mode") == "new") {
                var nRow = $(this).parents('tr')[0];
                oTable.fnDeleteRow(nRow);
            } else {
                restoreRow(oTable, nEditing);
                nEditing = null;
            }
        });

        $('#'+tableID+' a.edit').live('click', function (e) {
            e.preventDefault();

            /* Get the row as a parent of the link that was clicked on */
            var nRow = $(this).parents('tr')[0];

            if (nEditing !== null && nEditing != nRow) {
                /* Currently editing - but not this row - restore the old before continuing to edit mode */
                restoreRow(oTable, nEditing);
                editRow(oTable, nRow);
                nEditing = nRow;
            } else if (nEditing == nRow && this.innerHTML == "Save") {
                /* Editing this row and want to save it */
                var trID = e.currentTarget.parentElement.parentElement.id;
                if(!trID){
                    trID = 'new-' + (new Date() - 0);
                    e.currentTarget.parentElement.parentElement.id = trID;
                }
                saveTR(trID,tableID + '-ths',function (status) {
                    if(status){
                        saveRow(oTable, nEditing);
                        nEditing = null;
                    }
                    else{
                        
                    }
                });
                // alert("Updated! Do not forget to do some ajax to sync with backend :)");
            } else {
                /* No edit in progress - let's start one */
                editRow(oTable, nRow);
                nEditing = nRow;
            }
        });
    },

    render : function()
    {
        if(this.state.loading)
        {
            return (<span>Loading...</span>);
        }
        if(this.state.err)
        {
            return (<span>Server err: {JSON.stringify(this.state.err)}</span>);
        }
        var th = [];
        var headers = this.props.th;
        if(headers){
            for(var i=0;i<headers.length;i++){
                th.push((<th className="sorting" key={headers[i].toLowerCase()} role="columnheader" tabIndex="0" aria-controls="editable-sample">{headers[i]}</th>));
            }
            th.push((<th className="sorting" key="edit" style={{width:'30px'}} role="columnheader" tabIndex="0" aria-controls="editable-sample">Edit</th>));
            th.push((<th className="sorting" key="delete" style={{width:'30px'}} role="columnheader" tabIndex="0" aria-controls="editable-sample">Delete</th>));
        }
        //加载数据
        var trs = [];
        var enviroItems = this.state.tr;
        if(enviroItems){
            for(var i=0;i<enviroItems.length;i++){
                var tds = [];
                for(var j=0;j<headers.length;j++){
                    var colName = headers[j].toLowerCase();
                    if(colName == 'alias(separator : \';\')')
                        colName = 'alias';
                    var colVal = enviroItems[i][colName];
                    if(!colVal)
                        colVal = '';
                    tds.push(React.createElement('td',{key:headers[j].toLowerCase()},colVal));
                }
                tds.push(React.createElement('td',{key:'edit'},React.createElement('a',{className:'edit'},'Edit')));
                tds.push(React.createElement('td',{key:'delete'},React.createElement('a',{className:'delete'},'Delete')));
                var tr = React.createElement('tr',{id: enviroItems[i]._id,key:enviroItems[i]._id, className: "sorting", role: "columnheader", tabIndex: "0", "aria-controls": "editable-sample"},tds);
                trs.push(tr);
            }
        }
        return (
            <section className="panel">
                <div className="panel-body">
                    <div className="adv-table editable-table ">
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
                        <table id={this.props.tableID} className="table table-striped table-hover table-bordered">
                            <thead>
                                <tr id={this.props.tableID + '-ths'} role="row">
                                    {th}
                                </tr>
                            </thead>
                            <tbody>
                                {trs}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        );
    }
});

module.exports = enviroTable;