/**
 * Created by SCR on 2017/6/1.
 */
var React = require('react');
var Axios = require('axios');

var EnMatchTable = React.createClass({
    getInitialState:function () {
        return {
            loading:true,
            err:null,
            tabletreeJSON:null,
            tabletree:null,
            modalUI:null,
            matchTT:null,
            allTT:null,
            allEn:null,
            btnDisabled:true,
            hasBinded:false
        }
    },

    componentDidMount:function () {
        var url = '/modelser/tabledata/' + this.props.pid + '?place=' + this.props.place + '&type=' + this.props.type;
        Axios.get(url).then(
            data=>{
                if(data.data.err){
                    $.gritter.add({
                        title: '警告：',
                        text: '获取相匹配的环境失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({loading:false,err:{code:'获取相匹配的环境失败！'}});
                }
                else if(data.data.tabledata){
                    this.setState({loading:false,tabletreeJSON:data.data.tabledata});
                }
            },
            err=>{
                $.gritter.add({
                    title: '警告：',
                    text: '获取相匹配的环境失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                this.setState({loading:false,err:err});
            }
        );

        var url2 = '/setting/enviro?method=get&type=';
        var zhcnType;
        if(this.props.type == 'swe'){
            url2 += 'software';
            zhcnType = '软件';
        }
        else if(this.props.type == 'hwe'){
            url2 += 'hardware';
            zhcnType = '硬件'
        }
        Axios.get(url2).then(
            data => {
                if(data.data.status == 1){
                    this.setState({loading:false,allEn:data.data.enviro})
                }
                else{
                    $.gritter.add({
                        title: '警告：',
                        text: '获取'+zhcnType+'环境列表失败，请稍后重试！',
                        sticky: false,
                        time: 2000
                    });
                    this.setState({loading:false,err:{code:'获取'+zhcnType+'环境列表失败！'}});
                }
            },
            err => {
                $.gritter.add({
                    title: '警告：',
                    text: '获取'+zhcnType+'环境列表失败，请稍后重试！',
                    sticky: false,
                    time: 2000
                });
                this.setState({loading:false,err:err});
            }
        );
    },

    bindComponent:function (){
        var tabletreeJSON = this.state.tabletreeJSON;
        var self = this;
        var type = (self.props.type.indexOf('swe') == -1) ? '硬件' : '软件';
        if(tabletreeJSON){
            webix.ready(function (){
                var pagerID = "pager_"+self.props.tableID;
                var myjson = webix.DataDriver.myjson = webix.copy(webix.DataDriver.json);
                myjson.child = function (obj) {
                    return obj.children;
                };
                webix.locale.pager = {
                    first: "<<",
                    last: ">>",
                    next: ">",
                    prev: "<"
                };

                var columns = [{
                    id: 'title',
                    header: 'Key',
                    template: '{common.treetable()} #title#',
                    width: self.props.css.width.title,
                    fillspace:true
                }, {
                    id: 'value2',
                    header: 'Demand',
                    width: self.props.css.width.demand,
                    fillspace:true
                }, {
                    id: 'match',
                    header: 'Matched',
                    width: self.props.css.width.enviro,
                    fillspace:true
                }, {
                    id: 'select',
                    header: 'Select',
                    width: 70,
                    css: "tabletree-operate",
                    template: function (obj) {
                        if(obj.type == 'Object')
                            return "<button class='tt-select-btn tabletree-btn btn btn-info btn-xs' " +
                                "id='" + obj.id + "_select_btn' " +
                                "type='button'" +
                                "onclick='showModal(this)'" +
                                "data-toggle='modal' " +
                                "data-target='#'" + self.props.tableID + "'-select-modal'" +
                                "><i class='fa fa-search'></i></button>";
                        return '';
                    }
                }, {
                    id: 'evaluate',
                    header: 'Evaluate',
                    width: 120,
                    css: "tabletree-operate",
                    editor: 'select',
                    options: ['未知','匹配','半匹配','不匹配']
                }];

                tabletree = webix.ui({
                    container:self.props.tableID,
                    view:'treetable',
                    columns:columns,
                    pager:{
                        template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                        container:pagerID,
                        size:10,
                        group:5,
                        level:1,
                        width:500
                    },
                    editable:true,
                    autoheight:true,
                    autowidth:true,
                    width:self.props.css.width.tabletree,
                    select:'row',
                    resizeColumn:true,
                    datatype:'myjson',
                    data:tabletreeJSON
                });
                self.state.tabletree = tabletree;

                tabletree.openAll();

                self.addDefaultMatched();

                //改变result一列中的值
                // {
                //     var itemID = tabletree.getFirstId();
                //     while(itemID){
                //         var itemNode = tabletree.getItem(itemID);
                //         for(var i=0;i<itemNode.children.length;i++){
                //             var node = itemNode.children[i];
                //             while(node && node.type != 'Object'){
                //                 node.result = '';
                //                 tabletree.refresh();
                //                 node = node.children;
                //             }
                //         }
                //         itemID = tabletree.getNextSiblingId(itemID);
                //     }
                // }

                tabletree.attachEvent('onBeforeEditStart',function (cell) {
                    if(this.getItem(cell.row).type != 'Object'){
                        return false;
                    }
                });

                window.showModal = function (e) {
                    {
                        var id = e.id;
                        id = id.substring(0,id.indexOf('_select_btn'));
                        window.demandNodeID = id;
                        var modalData = self.state.tabletree.getItem(id).matched;
                        var width = $('#' + self.props.tableID + '-select-modal .modal-dialog').width();
                        width = (width-100)/2;

                        var myjson = webix.DataDriver.myjson = webix.copy(webix.DataDriver.json);
                        myjson.child = function (obj) {
                            return obj.children;
                        };
                        webix.locale.pager = {
                            first: "<<",
                            last: ">>",
                            next: ">",
                            prev: "<"
                        };
                        var modalColumns1 = [{
                            id: 'title',
                            header: 'Key',
                            template: '{common.space()}{common.treecheckbox()}{common.icon()}{common.folder()}#title#',
                            width: width,
                            fillspace:true
                        }, {
                            id: 'value2',
                            header: 'Value',
                            width: width,
                            fillspace:true
                        }];
                        var modalColumns2 = [{
                            id: 'title',
                            header: 'Key',
                            template: '{common.space()}{common.treecheckbox()}{common.icon()}{common.folder()}#title#',
                            width: width,
                            fillspace:true
                        }, {
                            id: 'value2',
                            header: 'Value',
                            width: width,
                            fillspace:true
                        }];
                        var pagerModal1 = {
                            paddingY:15,
                            rows:[{
                                view:'pager',
                                template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                id:self.props.tableID + '_modal_pager1',
                                size:10,
                                group:5,
                                width:500,
                                level:1
                            }]
                        };
                        var pagerModal2 = {
                            paddingY:15,
                            rows:[{
                                view:'pager',
                                template:"{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                                id:self.props.tableID + '_modal_pager2',
                                size:10,
                                group:5,
                                width:500,
                                level:1
                            }]
                        };
                        var modalTT1 = {
                            view:'treetable',
                            columns:modalColumns1,
                            pager:self.props.tableID + '_modal_pager1',
                            editable:false,
                            autoheight:true,
                            autowidth:true,
                            width:width*2,
                            select:'row',
                            resizeColumn:true,
                            datatype:'myjson',
                            data:modalData == null?[]:modalData,
                            on:{
                                //最多只能选中一个
                                'onItemCheck':function (id,state) {
                                    if(state){
                                        var checked = this.getChecked();
                                        for(var i=0;i<checked.length;i++){
                                            if(id == checked[i])
                                                continue;
                                            this.uncheckItem(checked[i]);
                                        }
                                    }
                                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                    if(this.getChecked().length != 0){
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:false});
                                    }
                                    else{
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:true});
                                    }
                                }
                            }
                        };

                        var modalTT2 = {
                            view:'treetable',
                            columns:modalColumns2,
                            pager:self.props.tableID + '_modal_pager2',
                            editable:false,
                            autoheight:true,
                            autowidth:true,
                            width:width*2,
                            select:'row',
                            resizeColumn:true,
                            datatype:'myjson',
                            data:self.state.allEn == null ? [] : self.state.allEn,
                            on:{
                                //最多只能选中一个
                                'onItemCheck':function (id,state) {
                                    if(state){
                                        var checked = this.getChecked();
                                        for(var i=0;i<checked.length;i++){
                                            if(id == checked[i])
                                                continue;
                                            this.uncheckItem(checked[i]);
                                        }
                                    }
                                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                    if(this.getChecked().length != 0){
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:false});
                                    }
                                    else{
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:true});
                                    }
                                }
                            }
                        }
                    }
                    self.state.modalUI = webix.ui({
                        type:'line',
                        container:$('#' + self.props.tableID + '-select-modal .modal-body').attr('id'),
                        rows:[{
                            view:'tabbar',
                            multiview:true,
                            options:[
                                {id:'1',value:'匹配环境',width:100},
                                {id:'2',value:'所有环境',width:100}
                            ],
                            on:{
                                'onChange':function () {
                                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                                    var tt;
                                    if(this.getValue() == '1'){
                                        tt = self.state.matchTT;
                                    }
                                    else if(this.getValue() == '2'){
                                        tt = self.state.allTT;
                                    }
                                    if(tt.getChecked().length != 0){
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:false});
                                    }
                                    else{
                                        self.state.hasBinded = true;
                                        self.setState({btnDisabled:true});
                                    }
                                }
                            }
                        },{
                            cells:[
                                {
                                    id:'1',
                                    rows:[
                                        pagerModal1,
                                        modalTT1
                                    ]
                                },
                                {
                                    id:'2',
                                    rows:[
                                        pagerModal2,
                                        modalTT2
                                    ]
                                }
                            ]
                        }]
                    });
                    self.state.matchTT = self.state.modalUI.getChildViews()[1].getChildViews()[0].getChildViews()[1];
                    self.state.allTT = self.state.modalUI.getChildViews()[1].getChildViews()[1].getChildViews()[1];

                    $('#' + self.props.tableID + '-select-modal').modal();
                };

                $('#' + self.props.tableID + '-select-modal').on('show.bs.modal',function () {
                    var submitBtn = $('#' + self.props.tableID + '-select-modal .btn-tt-submit');
                    var tt;
                    var tabUI = self.state.modalUI.getChildViews()[0];
                    if(tabUI.getValue() == '1'){
                        tt = self.state.matchTT;
                    }
                    else if(tabUI.getValue() == '2'){
                        tt = self.state.allTT;
                    }
                    if(tt.getChecked().length != 0){
                        self.state.hasBinded = true;
                        self.setState({btnDisabled:false});
                    }
                    else{
                        self.state.hasBinded = true;
                        self.setState({btnDisabled:true});
                    }
                });

                $('#' + self.props.tableID + '-select-modal').on("hidden.bs.modal", function() {
                    $(this).find('.modal-body').children().remove();
                    window.demandNodeID = '';
                });
            })
        }
    },

    addDefaultMatched:function () {
        var tt = this.state.tabletree;
        var itemID = tt.getFirstId();
        while(itemID){
            var itemNode = tt.getItem(itemID);
            var defaultMatched = itemNode.matched[0];
            if(defaultMatched){
                {
                    var score = 0;
                    for(var i=0;i<defaultMatched.children.length;i++){
                        if(defaultMatched.children[i].title == 'score'){
                            score = defaultMatched.children[i].value2;
                            break;
                        }
                    }
                    if(score > 2.5){
                        itemNode.evaluate = '匹配';
                    }
                    else if(score > 1.0){
                        itemNode.evaluate = '半匹配';
                    }
                    else if(score > 0.5){
                        itemNode.evaluate = '未知';
                    }
                    else{
                        itemNode.evaluate = '不匹配';
                        continue;
                    }
                }
                for(var i=0;i<itemNode.children.length;i++) {
                    // itemNode.children[i].evaluate = '';
                    // tt.refresh();
                    for (var j = 0; j < defaultMatched.children.length; j++) {
                        if(itemNode.children[i].title == defaultMatched.children[j].title){
                            if(itemNode.children[i].title == 'alias'){
                                for(var k=0;k<defaultMatched.children[j].children.length;k++){
                                    var tmp = defaultMatched.children[j].children[k];
                                    this.state.tabletree.add({
                                        title:itemNode.children[i].$count,
                                        match:tmp.value2,
                                        type:'string'
                                    },-1,itemNode.children[i].id);
                                    tt.refresh();
                                }
                            }
                            else{
                                itemNode.children[i].match = defaultMatched.children[j].value2;
                            }
                            tt.refresh();
                        }
                    }
                }
            }
            itemID = tt.getNextSiblingId(itemID);
        }
    },

    changeMatched:function (e) {
        var tt;
        var tabUI = this.state.modalUI.getChildViews()[0];
        var tabValue = tabUI.getValue();
        if(tabValue == '1'){
            tt = this.state.matchTT;
        }
        else if(tabValue == '2'){
            tt = this.state.allTT;
        }
        var checkedID = tt.getChecked();
        if(checkedID.length!=0)
            checkedID = checkedID[0];
        else
            checkedID = null;
        if(checkedID){
            var checkedNode = tt.getItem(checkedID);
            var originalNode = this.state.tabletree.getItem(window.demandNodeID);
            {
                var score = 0;
                for(var i=0;i<checkedNode.children.length;i++){
                    if(checkedNode.children[i].title == 'score'){
                        score = checkedNode.children[i].value2;
                        break;
                    }
                }
                if(score > 2.5){
                    originalNode.evaluate = '匹配';
                }
                else if(score > 1.0){
                    originalNode.evaluate = '半匹配';
                }
                else if(score > 0.5){
                    originalNode.evaluate = '未知';
                }
                else{
                    originalNode.evaluate = '不匹配';
                    this.state.tabletree.refresh();
                    return;
                }
            }
            for(var i=0;i<originalNode.children.length;i++){
                for(var j=0;j<checkedNode.children.length;j++){
                    if(originalNode.children[i].title == checkedNode.children[j].title){
                        if(originalNode.children[i].title == 'alias'){
                            for(var m=0;m<originalNode.children[i].children.length;m++){
                                this.state.tabletree.remove(originalNode.children[i].children[m]);
                            }
                            this.state.tabletree.refresh();
                            for(var k=0;k<checkedNode.children[j].children.length;k++){
                                var tmp = checkedNode.children[j].children[k];
                                this.state.tabletree.add({
                                    title:originalNode.children[i].$count,
                                    match:tmp.value2,
                                    type:'string'
                                },-1,originalNode.children[i].id);
                                this.state.tabletree.refresh();
                            }
                        }
                        else
                            originalNode.children[i].match = checkedNode.children[j].value2;
                    }
                }
            }
            this.state.tabletree.refresh();
            $('#' + this.props.tableID + '-select-modal').modal('hide');
        }
        else{
            alert('请先选择匹配环境！');
        }
    },

    render:function () {
        if(this.state.loading)
            return (<span><i className="fa fa-spinner fa-spin fa-3x fa-fw" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;Loading...</span>);
        if(this.state.err)
            return (<span>Server error: {JSON.stringify(this.state.err)}</span>);
        if(this.state.hasBinded == false){
            this.bindComponent();
        }
        if(this.state.tabletree){
            this.addDefaultMatched();
        }
        return (
            <div ref={this.props.tableID}>
                <div id={'pager_'+this.props.tableID}></div>
                <div id={this.props.tableID}></div>
                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id={this.props.tableID + '-select-modal'} className="modal fade">
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true">
                                    &times;
                                </button>
                                <h4 className="modal-title">
                                    选择匹配的环境
                                </h4>
                            </div>
                            <div id={this.props.tableID + '_modal-body'} className="modal-body">
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">关闭
                                </button>
                                <button type="button" className="btn-tt-submit btn btn-primary" disabled={this.state.btnDisabled}  onClick={(e) => {this.changeMatched(e)}}>
                                    提交
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EnMatchTable;