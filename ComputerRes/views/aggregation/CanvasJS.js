/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var ObjectID = require('bson-objectid');
var io = require('socket.io-client');

var CanvasJS = (()=> {
    var __STATES_WIDTH = 80;
    var __STATES_HEIGHT = 60;
    var __DATA_RADIUS = 25;

    var __translateX = null;
    var __translateY = null;

    var __tempNodeA = null;
    var __tempNodeZ = null;
    var __beginNode = null;
    var __tempLink = null;

    const StatesColor = {
        unready: '#60A7FF',
        pending: '#A3D39B',
        pause: '#78F5DD',
        running: '#ffee58',
        collapsed: '#e0412b',
        finished: '#41EB4A'
    };

    // 包括角色和状态
    const EventColor = {
        ready: '#ffee58',
        pending: '#A3D39B',
        received: '#41EB4A',
        failed: '#e0412b',
        // mid: '#3AEB7C',
        origin: '#60A7FF',
        input: '#FF8034'
        // output: '#3AEB7C'
    };

    const SolutionColor = {
        link:StatesColor.unready,
        manualLink: '#0949ff',
        event: EventColor.origin,
        states: StatesColor.unready
    };

    // 数据角色和状态
    const DataState = {
        // unready: 'UNREADY',      // DataState表示的是已经上传过的数据的状态，没有 unready这一种
        ready: 'READY',             // 准备好，表示初始状态，将要分发的状态，before dispatch
        pending: 'PENDING',         // 正在传输 dispatching
        received: 'RECEIVED',       // 计算节点接受成功 after dispatch
        failed: 'FAILED'            // 计算节点接受失败 failed
        // mid: 'MID',                 // 计算中间产物
        // result: 'RESULT'            // 输出数据的状态，是最终计算结果数据（没有流向下个模型） is result
        // used: 'USED'                // 模型已经跑完，使用过该数据 is used
    };

    const TaskState = {
        configured: 'CONFIGURED',
        collapsed: 'COLLAPSED',
        end: 'END',
        finished: 'FINISHED',
        running: 'RUNNING',
        pause: 'PAUSE'
    };

    const MSState = {
        unready: 'UNREADY',         // 初始状态，前台创建task时默认是这种
        pending: 'PENDING',         // 正在发送运行指令
        pause: 'PAUSE',             // 允许用户给准备好的模型打断点
        running: 'RUNNING',         // 现在默认准备好数据就开始运行
        collapsed: 'COLLAPSED',     // 运行失败，两种情况：调用出错；运行失败
        finished: 'FINISHED'        // 运行成功且结束
    };

    var __getRGB = function (color) {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var hex2RGB = function(hexStr){
            var sColor = hexStr.toLowerCase();
            if(sColor && reg.test(sColor)){
                if(sColor.length === 4){
                    var sColorNew = "#";
                    for(var i=1; i<4; i+=1){
                        sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                    }
                    sColor = sColorNew;
                }
                //处理六位的颜色值
                var sColorChange = [];
                for(var i=1; i<7; i+=2){
                    sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
                }
                return "RGB(" + sColorChange.join(",") + ")";
            }else{
                return sColor;
            }
        };
        var rgbStr = hex2RGB(color);
        var group = rgbStr.match(/RGB\((.+)\)/);
        return group[1];
    };

    var __showContextMenu = function (type) {
        var id = null;
        if(type == 'STATES'){
            id = 'stateContextMenu';
        }
        else if(type == 'INPUT' ||
            type == 'OUTPUT'||
            type == 'CONTROL') {
            id = 'eventContextMenu';
        }
        $('#' + id).css({
            top:event.layerY + (+$(event.target).parent().css('padding-left').replace('px','')),
            left:event.layerX + (+$(event.target).parent().css('padding-top').replace('px',''))
        }).show();
    };

    var __hideContextMenu = function () {
        $('#stateContextMenu').hide();
        $('#eventContextMenu').hide();
    };

    var __getEventDetail = function (__stateID, __eventName, __MSID, serviceList) {
        var service = null;
        for(var i=0;i<serviceList.length;i++){
            if(serviceList[i]._id == __MSID){
                service = serviceList[i];
                break;
            }
        }
        if(!service)
            return null;
        var mdl = service.MDL;
        var datasetItemList = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
        var states = mdl.ModelClass.Behavior.StateGroup.States.State;
        var state = null;
        var event = null;
        if(states instanceof Array){
            for(let m=0;m<states.length;m++){
                if(states[m]._$.id == __stateID){
                    state = states[m];
                }
            }
        }
        else{
            if(states._$.id == __stateID){
                state = states;
            }
        }
        var events = state.Event;
        if(events instanceof Array){
            for(var j=0;j<events.length;j++){
                if(events[j]._$.name == __eventName){
                    event = events[j];
                    break;
                }
            }
        }
        else{
            if(events._$.name == __eventName){
                event = events;
            }
        }
        var datasetReference = null;
        if(event._$.type == 'response'){
            if(typeof event.ResponseParameter != 'undefined'){
                datasetReference = event.ResponseParameter._$.datasetReference;
            }
            else if(typeof event.ControlParameter != 'undefined'){
                datasetReference = event.ControlParameter._$.datasetReference;
            }
        }
        else if(event._$.type == 'noresponse'){
            datasetReference = event.DispatchParameter._$.datasetReference;
        }

        var schema = null;
        if(datasetItemList instanceof Array){
            for(var k=0;k<datasetItemList.length;k++){
                if(datasetItemList[k]._$.name == datasetReference){
                    schema = datasetItemList[k];
                    break;
                }

            }
        }
        else {
            if(datasetItemList._$.name == datasetReference){
                schema = datasetItemList;
            }
        }
        if(schema){
            return {
                schema:schema,
                event:event
            };
        }
        else{
            return null;
        }
    };

    // 返回states的信息和attributeset信息
    var __getServiceDetail = function (__MSID,serviceList) {
        var service = null;
        for(var i=0;i<serviceList.length;i++){
            if(serviceList[i]._id == __MSID){
                service = serviceList[i];
                break;
            }
        }
        if(!service)
            return null;

        var states = [];
        var mdl = service.MDL;
        var statesNode = mdl.ModelClass.Behavior.StateGroup.States.State;
        var attributeSetNode = mdl.ModelClass.AttributeSet;
        if(statesNode){
            if(statesNode instanceof Array){
                for(let i=0;i<statesNode.length;i++){
                    states.push(statesNode[i]._$);
                }
            }
            else{
                states.push(statesNode._$);
            }
        }
        var categoriesNode = attributeSetNode.Categories.Category;
        var categories = {
            principle: categoriesNode._$.principle,
            path: categoriesNode._$.path
        };
        var LocalAttributesNode = attributeSetNode.LocalAttributes.LocalAttribute;
        var localAttributes = null;
        if(LocalAttributesNode){
            if(LocalAttributesNode instanceof Array){
                localAttributes = LocalAttributesNode;
                // for(let i=0;i<LocalAttributesNode.length;i++){
                //     var localAttributeNode = LocalAttributesNode[i];
                //     localAttributes.push(localAttributeNode[i]);
                // }
            }
            else{
                localAttributes = [LocalAttributesNode];
                // localAttributes.push(LocalAttributesNode)
            }
        }
        // TODO 添加runtime
        var runtimeNode = mdl.ModelClass.Runtime;

        return {
            attributeSet: {
                categories: categories,
                localAttributes: localAttributes
            },
            states:states
        };
    };

    var __getRoleByID = function (roleList, _id) {
        for(var i=0;i<roleList.length;i++){
            if(roleList[i]._id == _id){
                return roleList[i];
            }
        }
        return null;
    };

    // JTopo自带的toJson函数出错（可能是因为circle object的原因）
    // 自己写一个导出函数，将必要的属性导出
    var __myLayout = function (role) {
        var rst = {};
        if(role.elementType == 'container'){
            for(var key1 in role){
                if(typeof role[key1] != 'function' &&
                    key1 != 'childs' &&
                    key1 != 'messageBus'){
                    rst[key1] = role[key1];
                }
            }
            rst.childsID = [];
            if(role.childs && role.childs != undefined){
                for(var i=0;i<role.childs.length;i++){
                    rst.childsID.push(role.childs[i]._id);
                }
            }
        }
        else if(role.elementType == 'link'){
            for(var key2 in role){
                if(typeof role[key2] != 'function' &&
                    key2 != 'messageBus'){
                    if(key2 == 'nodeA'){
                        rst.nodeAID = role[key2]._id;
                    }
                    else if(key2 == 'nodeZ'){
                        rst.nodeZID = role[key2]._id;
                    }
                    else{
                        rst[key2] = role[key2];
                    }
                }
            }
        }
        else if(role.elementType == 'node'){
            for(var key3 in role){
                if(typeof role[key3] != 'function' &&
                    key3 != 'messageBus' &&
                    key3 != 'inLinks' &&
                    key3 != 'outLinks'){
                    rst[key3] = role[key3];
                }
                if(key3 == 'paint'){
                    rst[key3] = role[key3];
                }
            }
        }
        else if(role.elementType == 'scene'){
            for(var key4 in role){
                if(typeof role[key4] != 'function' &&
                    key4 != 'stage' &&
                    key4 != 'childs' &&
                    key4 != 'currentElement' &&
                    key4 != 'selectedElements' &&
                    key4 != 'messageBus' &&
                    key4 != 'mouseOverelement' &&
                    key4 != 'mousecoord' &&
                    key4 != 'operations' &&
                    key4 != 'propertiesStack' &&
                    key4 != 'serializedProperties' &&
                    key4 != 'zIndexArray' &&
                    key4 != 'mouseDownEvent' &&
                    key4 != 'zIndexMap'){
                    rst[key4] = role[key4];
                }
            }
        }
        return rst;
    };

    var __createGUID = function () {
        function _p8(s) {
            var p = (Math.random().toString(16)+"000000000").substr(2,8);
            return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    };

    var __getMaxZIndex = function (){
        var maxZ = Math.max.apply(null, $.map($('body > *'), function (e, n) {
            if ($(e).css('position') == 'absolute'||$(e).css('position') == 'relative'||$(e).css('position') == 'fixed')
                return parseInt($(e).css('z-index')) || 1;
            })
        );
        return maxZ;
    };

    return {
        // canvas element
        __stage: null,
        __scene: null,
        __toolMode: null,   // normal zoomIn zoomOut delete
        __mode: 'view',     // view edit configure
        __type: null,

        // solution
        __solution: {
            layoutCfg: {
                scene: null,
                nodeList: [],
                containerList: [],
                linkList: []
            },
            solutionCfg: {
                relationList: [],
                serviceList: []
            },
            solutionInfo: {
                solutionAuthor: null,
                solutionDesc: null,
                solutionName: null
            },
            time: null
        },
        __task: {
            taskCfg: {
                dataList:[],
                solutionID: null,
                driver: null
            },
            taskState: null,
            taskInfo: {
                taskName: null,
                taskDesc: null,
                taskAuthor: null
            },
            time: null,
            MSState: [],
        },

        // canvas role 和 solution中的不一样！
        __nodeList: [],
        __linkList: [],
        __containerList: [],

        // region deprecated 同一个数据存了两次（__task中）会导致内存混乱
        // solutionCfg
        // __serviceList: [],
        // __relationList: [],
        // taskCfg
        // __dataList: [],                   // gdid MSID stateID eventName isInput isOutput TODO 接入数据服务时应该加上 host port 两个字段
        // __inputDataList: [],
        // endregion

        // temp
        __currentNode: null,
        __isValid: true,

        init: function(mode, type) {
            var self = this;
            this.__mode = mode;
            this.__type = type;
            $('#canvas').attr('height',$('#canvas-div').height());
            $('#canvas').attr('width',$('#canvas-div').width());
            this.__stage = new JTopo.Stage($('#canvas')[0]);
            this.__scene = new JTopo.Scene();
            this.__stage.add(this.__scene);
            this.__stage.setCenter(0,0);
            this.__stage.wheelZoom = 0.85;
            this.__scene.mode = 'normal';

            this.__bindStageEvent(this.__stage);
            this.__bindSceneEvent(this.__scene);
            this.__bindToolbarEvent();
            this.__bindMenuEvent();
            this.addLinkRoleManuel();

            if(mode == 'view'){
                $('#edit-mode-toolbar').remove();
                $('#configure-mode-toolbar').remove();
            }
            else if(mode == 'edit'){
                $('#configure-mode-toolbar').remove();
            }
            else if(mode == 'configure'){
                $('#edit-mode-toolbar').remove();
            }

            if(type == 'task'){
                $('#task-legend').show();
            }
            else if(type == 'solution'){
                $('#solution-legend').show();
            }
            this.initLegend();
        },

        // region bind event
        __bindToolbarEvent: function () {
            var self = this;
            $('#toolbar button').click(function () {
                if(typeof ($(this).attr('data-toggle')) !== 'undefined' && $(this).attr('data-toggle') == 'button'){
                    if(!$(this).hasClass('active')){
                        $('#toolbar button').removeClass('active');
                    }
                    else{
                        $('#hand-tool').addClass('active');
                    }
                }

                switch ($(this).attr('id')){
                    //清空场景
                    case 'del-all-tool':
                        if(self.__type == 'solution' && self.__mode == 'edit'){
                            // self.__serviceList = [];
                            // self.__relationList = [];
                            // self.__dataList = [];
                            self.__scene.clear();

                            self.__toolMode = 'normal';
                            self.__scene.mode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //回到初始位置
                    case 'back-pos-tool':
                        // self.__stage.centerAndZoom(1);
                        // self.__stage.setCenter(0,0);
                        // self.__stage.zoom(1);

                        self.__scene.scaleX = 1;
                        self.__scene.scaleY = 1;

                        self.__scene.translateX = $('#canvas-div').width()/2;
                        self.__scene.translateY = $('#canvas-div').height()/2;
                        self.__stage.paint();

                        self.__toolMode = 'normal';
                        self.__scene.mode = 'normal';
                        $('#toolbar button').removeClass('active');
                        $('#hand-tool').addClass('active');
                        break;
                    case 'display-toggle-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'select';
                            self.__toolMode = 'normal';
                        }
                        else {
                            self.__scene.mode = 'normal';
                            self.__toolMode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //放大
                    case 'zoomIn-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'zoomIn';
                            self.__scene.mode = 'normal';
                        }
                        else {
                            self.__toolMode = 'normal';
                            self.__scene.mode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //缩小
                    case 'zoomOut-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'zoomOut';
                            self.__scene.mode = 'normal';
                        }
                        else {
                            self.__toolMode = 'normal';
                            self.__scene.mode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //拖动模式
                    case 'hand-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'normal';
                            self.__toolMode = 'normal';
                        }
                        else {
                            self.__scene.mode = 'select';
                            self.__toolMode = 'normal';
                        }
                        break;
                    //框选模式
                    case 'select-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'select';
                            self.__toolMode = 'normal';
                        }
                        else {
                            self.__scene.mode = 'normal';
                            self.__toolMode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //编辑模式
                    case 'edit-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'edit';
                            self.__toolMode = 'normal';
                        }
                        else {
                            self.__scene.mode = 'normal';
                            self.__toolMode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //删除模式
                    case 'del-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'delete';
                            self.__scene.mode = 'normal';
                        }
                        else {
                            self.__toolMode = 'normal';
                            self.__scene.mode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    //创建连接线模式
                    case 'link-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'link';
                            self.__scene.mode = 'normal';
                        }
                        else {
                            self.__toolMode = 'normal';
                            self.__scene.mode = 'normal';
                            $('#toolbar button').removeClass('active');
                            $('#hand-tool').addClass('active');
                        }
                        break;
                    case 'run-tool':
                        self.run();
                        break;
                    case 'saveas-solution-tool':
                        $('#save-aggre-solution-modal').modal('show');
                        self.__bindSaveSolutionEvent(true);
                        break;
                    case 'save-solution-tool':
                        $('#save-aggre-solution-modal').modal('show');
                        self.__bindSaveSolutionEvent(false);
                        break;
                    case 'saveas-task-tool':
                        $('#save-aggre-task-modal').modal('show');
                        self.__bindSaveTaskEvent(true);
                    case 'save-task-tool':
                        $('#save-aggre-task-modal').modal('show');
                        self.__bindSaveTaskEvent(false);
                }
            });

            $('#hand-tool').click();
        },

        __bindMenuEvent: function () {
            var self = this;

            $('#del-ms-menu').on('click',function (e) {
                self.removeServiceRole(self.__currentNode);
                __hideContextMenu();
            });

            $('#upload-data-menu').on('click',function (e) {
                self.__buildEventDetail();
                __hideContextMenu();
            });
        },

        __bindStageEvent: function (stage) {
            var self = this;
            stage.click(function (e) {
                if(e.button == 0){
                    __hideContextMenu();
                    if(typeof self.__toolMode !== 'undefined'){
                        if(self.__toolMode == 'zoomIn'){
                            self.__stage.zoomOut(0.85);
                        }
                        else if(self.__toolMode == 'zoomOut'){
                            self.__stage.zoomIn(0.85);
                        }
                    }
                }
                else if(e.button == 2){
                    if(!e.target && !__beginNode){
                        $('#hand-tool').click();
                    }
                    __hideContextMenu();
                }
            });
        },

        __bindSceneEvent: function (scene) {
            var self = this;
            scene.addEventListener('mouseup',function (e) {
                var target = e.target;
                if(!e.target){
                    __beginNode = null;
                }
                if(e.button == 0){

                }
                else if(e.button == 2){
                    if( self.__type == 'solution' && self.__mode == 'edit' && target && target.elementType == 'link' && target.__linkType == 'CUSTOM'){
                        self.removeRelationByJTopoID(self.__scene, target._id);
                        self.__removeJTopoElementByID(self.__scene, target._id);
                    }
                }
            });
        },

        __bindContainerEvent: function (container) {

        },

        __bindNodeEvent: function (node) {
            var self = this;
            var type = node.__nodeType;

            if(self.__mode == 'configure'){
                $('#del-ms-menu').hide();
                node.addEventListener('mouseup',function (e) {
                    if(e.button == 2){
                        __hideContextMenu();
                        __showContextMenu(node.__nodeType);
                        self.__currentNode = node;
                    }
                    else if(e.button == 0){

                    }
                });
            }

            if(self.__mode == 'edit' && self.__type == 'solution'){
                node.addEventListener('mouseup',function (e) {
                    if(e.button == 2){

                    }
                    else if(e.button == 0){
                        if(node.__nodeType == 'STATES'){
                            if(self.__toolMode == 'delete')
                                self.removeServiceRole(e.target);
                        }
                    }
                });
            }

            if(type == 'INPUT' || type == 'OUTPUT' || type == 'CONTROL'){
                // 双击上传数据
                node.addEventListener('dbclick',function (e) {
                    __beginNode = null;
                    self.__currentNode = node;
                    self.__buildEventDetail();
                });
            }
            else if(type == 'STATES'){
                node.addEventListener('dbclick',function (e) {
                    __beginNode = null;
                    self.__currentNode = node;
                    self.__buildStatesDetail();
                });
            }

        },

        __bindSaveSolutionEvent: function (isSaveAs) {
            var self = this;
            $('#save-aggre-form').validate({
                onfocusout:function(element) {
                    $(element).valid();
                },
                focusInvalid:true,
                submitHandler:function (form) {
                    var data = self.exportSolution();
                    var solutionInfo = {};
                    var saveTag = $(form).serializeArray();
                    for(var i=0;i<saveTag.length;i++){
                        solutionInfo[saveTag[i].name] = saveTag[i].value;
                    }
                    data.solutionInfo = solutionInfo;
                    if($('#solutionID-input').length && $('#solutionID-input').attr('value') && $('#solutionID-input').attr('value') != undefined){
                        data._id = $('#solutionID-input').attr('value');
                    }
                    $('#loading-div').show();
                    $('#submit-form-btn').attr('disabled',true);
                    $.ajax( {
                        url: '/aggregation/solution/save?isSaveAs=' + isSaveAs,
                        data: JSON.stringify(data),
                        contentType: "application/json;charset=utf-8",
                        type: 'POST',
                        dataType: 'json'
                    })
                        .done(function (res) {
                            if (res.error) {
                                $('#loading-div').hide();
                                $('#submit-form-btn').attr('disabled',false);
                                $.gritter.add({
                                    title: 'Warning：',
                                    text: 'Save solution failed!<br><pre>' + JSON.stringify(res.error, null, 4) + '</pre>',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                            else {
                                $('#loading-div').hide();
                                $('#submit-form-btn').attr('disabled',false);
                                $('#save-aggre-solution-modal').modal('hide');

                                $('#solutionID-input').attr('value',res._id);
                                $('#solution-name').empty();
                                $('#solution-author').empty();
                                $('#solution-name').append(solutionInfo.solutionName);
                                $('#solution-author').append(solutionInfo.solutionAuthor);
                                $('#solution-info').css('display','block');

                                $.gritter.add({
                                    title: 'Notice:',
                                    text: 'Save solution success!',
                                    sticky: false,
                                    time: 2000
                                });

                                if(isSaveAs){
                                    window.location.search= '?_id=' + res._id;
                                }
                            }
                        })
                        .fail(function (err) {
                            $('#loading-div').hide();
                            $('#submit-form-btn').attr('disabled',false);
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Save solution failed!<br><pre>' + JSON.stringify(err, null, 4) + '</pre>',
                                sticky: false,
                                time: 2000
                            });
                        });
                }
            });
        },

        // task 的保存和solution不是一个套路，只用保存最新的datalist就行，其他状态由后台维护
        __bindSaveTaskEvent: function (isSaveAs, isRunNow) {
            var self = this;
            $('#save-aggre-form').validate({
                onfocusout:function(element) {
                    $(element).valid();
                },
                focusInvalid:true,
                submitHandler:function (form) {
                    var data = self.exportTask();
                    $('#loading-div').show();
                    $('#submit-form-btn').attr('disabled',true);
                    $.ajax( {
                        url: '/aggregation/task/save?isSaveAs=' + isSaveAs,
                        data: JSON.stringify(data),
                        contentType: "application/json;charset=utf-8",
                        type: 'POST',
                        dataType: 'json'
                    })
                        .done(function (res) {
                            if (res.error) {
                                $('#loading-div').hide();
                                $('#submit-form-btn').attr('disabled',false);
                                $.gritter.add({
                                    title: 'Warning：',
                                    text: 'Save task failed!<br><pre>' + JSON.stringify(res.error, null, 4) + '</pre>',
                                    sticky: false,
                                    time: 2000
                                });
                            }
                            else {
                                $('#loading-div').hide();
                                $('#submit-form-btn').attr('disabled',false);
                                $('#save-aggre-task-modal').modal('hide');

                                $('#taskID-input').attr('value',res._id);
                                $('#task-name').empty();
                                $('#task-author').empty();
                                $('#task-name').append(data.taskInfo.taskName);
                                $('#task-author').append(data.taskInfo.taskAuthor);
                                $('#task-info').css('display','block');

                                $.gritter.add({
                                    title: 'Notice:',
                                    text: 'Save task success!',
                                    sticky: false,
                                    time: 2000
                                });

                                if(isRunNow){
                                    return self.run();
                                }
                                if(window.location.pathname == '/aggregation/task/new'){
                                    window.location.href = '/aggregation/task/edit?_id=' + res._id;
                                }
                                if(isSaveAs){
                                    window.location.search = '?_id=' + res._id;
                                }
                            }
                        })
                        .fail(function (err) {
                            $('#loading-div').hide();
                            $('#submit-form-btn').attr('disabled',false);
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Save task failed!<br><pre>' + JSON.stringify(err, null, 4) + '</pre>',
                                sticky: false,
                                time: 2000
                            });
                        });
                }
            });
        },
        // endregion

        // region add remove role

        // 两种node，附加信息有：
        // {
        //     __nodeType:'STATES',
        //     __MSID:String,
        //     __containerID:String
        // }
        // {
        //     __nodeType:'INPUT',      // 'OUTPUT' 'CONTROL'
        //     __MSID:String,
        //     __stateID:String,
        //     __eventName:String
        // }
        // 创建时只添加jTopo自带的属性，额外属性在调用端添加
        __addJTopoNode: function(x, y, text, type, scale) {
            var node = null;
            var linkScale = scale == 1?1:(2-scale);
            if(type == 'STATES'){
                node = new JTopo.Node(text);
                node.setSize(__STATES_WIDTH,__STATES_HEIGHT);
                node.borderRadius = 5;
                node.borderWidth = 0;
                node.borderColor = '0,0,0';
                node.fillColor = __getRGB(SolutionColor.states);
                node.layout = {
                    type:'tree',
                    direction:'right',
                    width:linkScale*__DATA_RADIUS*2,
                    height:linkScale*__DATA_RADIUS*4
                };
            }
            else{
                node = new JTopo.CircleNode(text);
                node.radius = __DATA_RADIUS;
                // node.borderRadius = __DATA_RADIUS;
                node.borderWidth = 0;
                node.borderColor = '0,0,0';
                node.fillColor = __getRGB(SolutionColor.event);

                // node = new JTopo.Node(text);
                // node.beginDegree = 0;
                // node.percent = 1;
                // node.setCenterLocation(x,y);
                // node.width = node.height = __DATA_RADIUS*2;
                // node.paint = function (g) {
                //     g.beginPath();
                //     g.moveTo(0,0);
                //     g.fillStyle = 'rgba(0,0,0,1)';
                //     g.arc(0, 0, this.width/2, this.beginDegree, this.beginDegree + 2*Math.PI*this.percent);
                //     g.fill();
                //     g.closePath();
                //
                //     g.save();
                //     g.beginPath();
                //     g.fillStyle = 'rgba(255,255,255,1)';
                //     g.moveTo(0,0);
                //     var radius =  this.width/2;
                //     radius = radius>20?radius:20;
                //     g.arc(0, 0, radius-1, this.beginDegree, this.beginDegree + 2*Math.PI);
                //     g.fill();
                //     g.closePath();
                //     g.restore();
                //
                //     this.paintText(g);
                // };
            }
            if(x && y)
                node.setCenterLocation(x,y);
            node.alpha = 1;
            node.textPosition = 'Middle_Center';
            node.font = '微软雅黑';
            node.fontColor = '0,0,0';
            node.showSelected = true;
            node.dragable = true;
            node.editAble = false;
            node.scaleX = scale;
            node.scaleY = scale;
            node._id = __createGUID();

            this.__scene.add(node);
            return node;
        },

        // 增加属性：
        // __linkType:'CUSTOM'          // 'IN' 'OUT'
        // _id:nodeA._id + '__' + nodeZ._id
        __addJTopoLink: function (nodeA, nodeZ) {
            // var link = new JTopo.FoldLink(nodeA, nodeZ);
            var link = new JTopo.Link(nodeA, nodeZ);
            // link.direction = direction || 'horizontal';
            link.arrowsRadius = 7;
            link.lineWidth = 2;
            link.bundleOffset = 60;
            link.bundleGap = 15;
            link.strokeColor = '96, 168, 255';
            link._id = nodeA._id + '__' + nodeZ._id;
            this.__scene.add(link);
            return link;
        },

        __addJTopoContainer: function () {
            var container = new JTopo.Container();
            container._id = __createGUID();
            container.alpha = 0;
            this.__scene.add(container);
            return container;
        },

        // 手动添加link，此处会添加到私有变量 __relationList 中，附加信息有
        // {
        //     __linkType: 'CUSTOM',
        //     __relationID: String
        // }
        addLinkRoleManuel: function () {
            var self = this;
            var scene = this.__scene;
            // var __beginNode = null;
            var tempNodeA = new JTopo.Node('tempA');
            tempNodeA.setSize(1, 1);

            var tempNodeZ = new JTopo.Node('tempZ');
            tempNodeZ.setSize(1, 1);

            var link = new JTopo.Link(tempNodeA, tempNodeZ);
            link.lineWidth = 2;

            scene.mouseup(function(e){
                if(self.__toolMode != 'link')
                    return;
                if(e.button == 2){
                    __beginNode = null;
                    scene.remove(link);
                    return;
                }
                if(e.target != null && e.target instanceof JTopo.Node){
                    if(__beginNode == null){
                        // TODO 验证添加规则
                        if(e.target.__nodeType == 'STATES'){
                            __beginNode = null;
                            scene.remove(link);
                            return;
                        }

                        __beginNode = e.target;
                        scene.add(link);
                        tempNodeA.setLocation(e.x, e.y);
                        tempNodeZ.setLocation(e.x, e.y);
                    }
                    else if(__beginNode !== e.target){
                        var endNode = e.target;
                        if(!self.validateLink(__beginNode,endNode)){
                            __beginNode = null;
                            scene.remove(link);
                            return ;
                        }
                        // endregion
                        var relation = self.__addRelation(__beginNode,endNode);
                        var l = new JTopo.Link(__beginNode, endNode);
                        l.arrowsRadius = 7;
                        l.lineWidth = 2;
                        l.bundleOffset = 60;
                        l.bundleGap = 15;
                        l.strokeColor = __getRGB(SolutionColor.manualLink);
                        l._id = __beginNode._id + '__' + endNode._id;
                        l.__linkType = 'CUSTOM';
                        l.__relationID = relation._id;


                        scene.add(l);
                        __beginNode = null;
                        scene.remove(link);
                    }
                    else{
                        __beginNode = null;
                    }
                }else{
                    __beginNode = null;
                    scene.remove(link);
                }
            });

            scene.mousedown(function(e){
                if(self.__toolMode != 'link')
                    return;
                if(e.target == null || e.target === __beginNode || e.target === link){
                    scene.remove(link);
                }
            });
            scene.mousemove(function(e){
                if(self.__toolMode != 'link')
                    return;
                tempNodeZ.setLocation(e.x, e.y);
            });
        },

        __addRelation: function (nodeA, nodeZ) {
            var relation = {
                _id: nodeA.__MSID + '__' + nodeZ.__MSID,
                from:{
                    MSID: nodeA.__MSID,
                    stateID: nodeA.__stateID,
                    eventName: nodeA.__eventName
                },
                to:{
                    MSID: nodeZ.__MSID,
                    stateID: nodeZ.__stateID,
                    eventName: nodeZ.__eventName
                }
            };
            this.__solution.solutionCfg.relationList.push(relation);
            return relation;
        },

        __addJTopoElementByJSON: function (roleJSON) {
            var role = null;
            var nodeList = this.__nodeList;
            if(roleJSON.elementType == 'link'){
                var nodeA = __getRoleByID(nodeList,roleJSON.nodeAID);
                var nodeZ = __getRoleByID(nodeList,roleJSON.nodeZID);
                role  = new JTopo.Link(nodeA,nodeZ);
                for(var key in roleJSON){
                    if(key == 'strokeColor'){
                        if(roleJSON.__linkType == 'CUSTOM'){
                            role.strokeColor = __getRGB(SolutionColor.manualLink);
                        }
                        else{
                            role.strokeColor = __getRGB(SolutionColor.link);
                        }
                        continue;
                    }
                    role[key] = roleJSON[key];
                }
                this.__linkList.push(role);
            }
            else if(roleJSON.elementType == 'container'){
                role = new JTopo.Container();
                for(let key in roleJSON){
                    role[key] = roleJSON[key];
                }
                if(roleJSON.childsID && roleJSON.childsID != undefined){
                    for(var i=0;i<roleJSON.childsID.length;i++){
                        var child = __getRoleByID(nodeList, roleJSON.childsID[i]);
                        if(child && child != undefined)
                            role.add(child);
                    }
                }
                this.__bindContainerEvent(role);
                this.__containerList.push(role);
            }
            else if(roleJSON.elementType == 'node'){
                if(roleJSON.__nodeType == 'STATES'){
                    role = new JTopo.Node();
                }
                else{
                    role = new JTopo.CircleNode();
                }
                for(let key in roleJSON){
                    role[key] = roleJSON[key];
                }
                // if(role.__nodeType != 'STATES'){
                //     role.paint = function (g) {
                //         g.beginPath();
                //         g.moveTo(0,0);
                //         g.fillStyle = 'rgba(0,0,0,1)';
                //         g.arc(0, 0, this.width/2, this.beginDegree, this.beginDegree + 2*Math.PI*this.percent);
                //         g.fill();
                //         g.closePath();
                //
                //         g.save();
                //         g.beginPath();
                //         g.fillStyle = 'rgba(255,255,255,1)';
                //         g.moveTo(0,0);
                //         var radius =  this.width/2;
                //         radius = radius>20?radius:20;
                //         g.arc(0, 0, radius-1, this.beginDegree, this.beginDegree + 2*Math.PI);
                //         g.fill();
                //         g.closePath();
                //         g.restore();
                //
                //         this.paintText(g);
                //     };
                // }
                this.__bindNodeEvent(role);
                this.__nodeList.push(role);
            }
            else if(roleJSON.elementType == 'scene'){
                for(let key in roleJSON){
                    this.__scene[key] = roleJSON[key];
                }
                return ;
            }
            this.__scene.add(role);
        },

        // TODO 数据不一定必须要上传，也有可能是以服务的形式接入进来
        // 上传数据，会添加到 __dataList 中
        __buildEventDetail: function () {
            var node = this.__currentNode;
            var self = this;
            var type = node.__nodeType;
            var id = node.__MSID + '___' + node.__stateID + '___' + node.__eventName;
            if($('#'+id).length){
                // update download link
                if(node.__gdid){
                    var dataURL = '/aggregation/data?gdid='+node.__gdid+'&msid='+node.__MSID +'&stateID=' + node.__stateID + '&eventName=' + node.__eventName;
                    if($('#' + id + '-download-data').length){
                        $('#' + id + '-download-data').attr('onclick','window.open(\''+dataURL+'\')');
                    }
                    else{
                        $('#'+ id +'-download-div').remove();
                        $(  '<p><b>Download data: </b></p>' +
                            '<button id="' + id + '-download-data" onclick="window.open(\''+dataURL+'\')"  class="btn btn-default btn-xs down-event-btn" style="margin-top: 20px;">Download</button>')
                            .appendTo($('#' + id));
                    }
                }

                $('#'+id).parent().show();
                $('#'+id).parent().css('z-index',__getMaxZIndex()+1);
            }
            else{
                var eventDetail = __getEventDetail(node.__stateID,node.__eventName,node.__MSID, self.__solution.solutionCfg.serviceList);
                var $dataInfoDialog = null;
                if(eventDetail == null){
                    $dataInfoDialog = $(
                        '<div id="'+id+'" class="data-info-dialog" title="Data Information">' +
                        'Unknown data schema'+
                        '</div>'
                    );
                }
                else{
                    var eventName = eventDetail.event._$.name;
                    var eventType = eventDetail.event._$.type=='response'?'Input':'Output';
                    var eventDesc = eventDetail.event._$.description;
                    $dataInfoDialog = $(
                        '<div id="'+id+'" class="data-info-dialog" title="Data Information">' +
                        '<p><b>Name: </b><span>' + eventName + '</span></p>' +
                        '<p><b>Type: </b><span>' + eventType + '</span></p>' +
                        '<p><b>Description: </b><span>' + eventDesc + '</span></p>' +
                        '<p><b>UDX Schema: </b></p>' +
                        '<pre style="width:100%;height:300px">' + JSON.stringify(eventDetail.schema,null,4) + '</pre>' +
                        '</div>'
                    );
                }

                $dataInfoDialog.appendTo($('#aggreDIV'));
                $dataInfoDialog.dialog({
                    width: 350,
                    // maxHeight: 550,
                    modal: false,
                    create: function () {
                        $(this).css('maxHeight',500);
                    }
                });
                $('#'+id).parent().addClass('dataInfo-ui-dialog');

                if(this.__mode == 'configure'){
                    if(node.__nodeType == 'INPUT' || node.__nodeType == 'CONTROL'){
                        $(
                            '<p><b>Upload data: </b></p>' +
                            '<input id="' + id + '-upload-data" name="myfile" type="file" class="file">'
                        ).appendTo($dataInfoDialog);

                        if(node.__gdid && node.__gdid != undefined){
                            let dataURL = '/aggregation/data?gdid='+node.__gdid+'&msid='+node.__MSID +'&stateID=' + node.__stateID + '&eventName=' + node.__eventName;
                            $('<button id="' + id + '-download-data " onclick="window.open(\''+dataURL+'\')"  class="btn btn-default btn-xs down-event-btn" style="margin-top: 20px;">Download data</button>')
                                .appendTo($dataInfoDialog);
                        }

                        // TODO 验证数据合法性
                        $('#'+id+'-upload-data').fileinput({
                            uploadUrl: '/geodata/file',
                            allowedFileExtensions: ['xml','zip'],
                            aploadAsync: true,
                            showPreview: false,
                            showUpload: true,
                            showRemove: true,
                            showClose: false,
                            showUploadedThumbs: false,
                            autoReplace: true,
                            maxFileCount: 1,
                            uploadLabel: '',
                            removeLabel: '',
                            cancelLabel: '',
                            browseLabel: '',
                            removeIcon: '<i class="glyphicon glyphicon-trash text-danger"></i>',
                            uploadIcon: '<i class="glyphicon glyphicon-upload text-info"></i>'
                        })
                            .on('fileselect',function (event) {
                                // if($('#'+id+' .fileinput-remove-button')[0].tagName == 'BUTTON'){
                                //     var tmpDIV = $('<div>');
                                //     tmpDIV.append($('#'+id+' .fileinput-remove-button'));
                                //     var buttonStr = tmpDIV.html();
                                //     var str = buttonStr.match(/<button(.+)<\/button>/i);
                                //     if(str.length>=2){
                                //         str = '<a '+ str[1] + '</a>';
                                //         $(str).prependTo($('#' + id + ' .input-group-btn'));
                                //     }
                                //
                                // }
                            })
                            .on('fileuploaded',function (e, data, previewId, index) {
                                if(data.response.res != 'suc'){
                                    $.gritter.add({
                                        title: 'Warning:',
                                        text: 'Upload data failed!',
                                        sticky: false,
                                        time: 2000
                                    });
                                    return ;
                                }
                                var gdid = data.response.gd_id;
                                var inputData = {
                                    gdid: gdid,
                                    MSID: node.__MSID,
                                    stateID: node.__stateID,
                                    eventName: node.__eventName,
                                    state: DataState.ready,
                                    isInput: true,
                                    isMid: false
                                };
                                var hasInserted = false;
                                var dataList = self.__task.taskCfg.dataList;
                                for(var i=0;i<dataList.length;i++){
                                    // 已经上传过，重新上传替换
                                    if(dataList[i].MSID == node.__MSID &&
                                        dataList[i].stateID == node.__stateID &&
                                        dataList[i].eventName == node.__eventName){
                                        dataList[i].gdid = gdid;
                                        hasInserted = true;
                                        break;
                                    }
                                }
                                if(!hasInserted){
                                    dataList.push(inputData);
                                    // self.__inputDataList.push(inputData);
                                }
                                node.__gdid = gdid;
                                node.fillColor = __getRGB(EventColor.input);
                                // node.shadow = true;
                                // node.shadowColor = 'rgba(0,0,0,1)';

                                // 添加数据下载链接
                                // 不能通过原来的链接下载，有可能会跨域请求别的节点上的数据
                                let dataURL = '/aggregation/data?gdid='+node.__gdid+'&msid='+node.__MSID +'&stateID=' + node.__stateID + '&eventName=' + node.__eventName;
                                $('#'+ id +'-download-div').remove();
                                $(  '<div id="'+id +'-download-div">' +
                                    '<p><b>Download data: </b></p>' +
                                    '<button id="' + id + '-download-data" onclick="window.open(\''+dataURL+'\')"  class="btn btn-default btn-xs down-event-btn" style="margin-top: 20px;">Download</button>' +
                                    '</div>')
                                    .appendTo($dataInfoDialog);

                                $.gritter.add({
                                    title: 'Notice:',
                                    text: 'Upload data success!' ,
                                    sticky: false,
                                    time: 2000
                                });
                                return ;
                            })
                            .on('fileerror',function (e, data) {
                                $.gritter.add({
                                    title: 'Warning:',
                                    text: '<pre>'+JSON.stringify(error, null, 4)+'</pre>',
                                    sticky: false,
                                    time: 2000
                                });
                            });
                    }
                }

                $('.ui-dialog-titlebar-close').click(function (e) {
                    $(this).parent().parent().hide();
                });
            }

            this.updateServiceState();
        },

        __buildStatesDetail: function () {
            var node = this.__currentNode;
            var self = this;
            var type = node.__nodeType;
            var id = node.__MSID + '-states-dialog';
            if($('#'+id).length){
                $('#'+id).parent().show();
                $('#'+id).parent().css('z-index',__getMaxZIndex()+1);
            }
            else{
                var serviceDetail = __getServiceDetail(node.__MSID, self.__solution.solutionCfg.serviceList);
                var $serviceInfoDialog = null;
                if(serviceDetail == null){
                    $serviceInfoDialog = $(
                        '<div id="'+id+'" class="service-info-dialog" title="Service Information">' +
                        'Parse model service language failed!'+
                        '</div>'
                    );
                }
                else{
                    var category = serviceDetail.attributeSet.categories;
                    var localAttributes = serviceDetail.attributeSet.localAttributes;
                    var states = serviceDetail.states;

                    $serviceInfoDialog = $(
                        '<div id="'+id+'" class="service-info-dialog" title="Service Information">' +
                        '<div id="'+id +'-Categories">' +
                        '<h4>Categories:</h4>' +
                        '<p><b>Principle: </b><span>' + category.principle + '</span></p>' +
                        '<p><b>Path: </b><span>' + category.path + '</span></p>' +
                        '</div>' +
                        '<hr>' +
                        '<div id="'+id +'-LocalAttributes"><h4>LocalAttributes:</h4>' +
                        '<ul id="'+id+'-tab" class="nav nav-tabs"></ul>' +
                        '<div id="'+id+'-tab-content" class="tab-content"></div>' +
                        '</div>' +
                        '<hr>' +
                        '<div id="'+id +'-States"><h4>State list:</h4>' +
                        '<div id="'+ id + '-states-div"></div>' +
                        '</div>' +
                        '</div>'
                    );
                    $serviceInfoDialog.appendTo($('#aggreDIV'));
                    for(let i=0;i<localAttributes.length;i++){
                        if(localAttributes[i].Keywords && localAttributes[i].Abstract){
                            var tabTitle = localAttributes[i]._$.localName == ''?'Undefined':localAttributes[i]._$.localName;
                            $('#'+id + '-tab').append($(
                                '<li>' +
                                '<a href="'+localAttributes[i]._$.local+'" data-toggle="tab">' + tabTitle + '</a>' +
                                '</li>'
                            ));
                            $('#' + id + '-tab-content').append($(
                                '<div class="tab-pane fade" id="'+localAttributes[i]._$.local+'"></div>'
                            ));
                            if(localAttributes[i].Keywords){
                                $('#'+localAttributes[i]._$.local).append('<p style="padding-top: 10px"><b>Keywords: </b><span>'+localAttributes[i].Keywords+'</span></p>');
                            }
                            if(localAttributes[i].Abstract){
                                $('#'+localAttributes[i]._$.local).append('<p><b>Abstract: </b><span>'+localAttributes[i].Abstract+'</span></p>');
                            }
                        }
                    }
                    var $a = $('#' + id + '-tab li a');
                    for(let i=0;i<$a.length;i++){
                        $a[i].blur();
                    }
                    if($('#'+id + '-tab').children().length == 0){
                        $('#' + '-LocalAttributes').empty();
                    }
                    $($('#' + id + '-tab').children()[0]).addClass('active');
                    $($('#' + id + '-tab-content').children()[0]).addClass('in active');
                    for(let i=0;i<states.length;i++){
                        $('#' + id + '-states-div').append($(
                            '<p><b>State name: </b>'+states[i].name+'</p>' +
                            '<p><b>State type: </b>'+states[i].type+'</p>' +
                            '<p><b>State description: </b>'+states[i].description+'</p>'
                        ));
                        // if(i!=states.length-1){
                        //     $('#' + id + '-states-div').append($('<hr>'));
                        // }
                    }
                }
                $serviceInfoDialog.dialog({
                    width: 350,
                    modal: false,
                    create: function () {
                        $(this).css('maxHeight',500);
                    }
                });
                $('#' + id).parent().find('.ui-dialog-title').css('font-size','18px');
                $('#'+id).parent().addClass('dataInfo-ui-dialog');
                $('.ui-dialog-titlebar-close').click(function (e) {
                    $(this).parent().parent().hide();
                });
            }
        },

        // 用于删除自定义的线
        __removeJTopoElementByID: function (scene, _id) {
            if(scene.childs.length == 0)
                return -1;
            for(var i=0;i<scene.childs.length;i++){
                if(scene.childs[i]._id == _id){
                    scene.remove(scene.childs[i]);
                    return 1;
                }
            }
            return 0;
        },

        // remove container and childs
        __removeJTopoContainer: function (scene, containerNode) {
            for(var j=0;j<containerNode.childs.length;j++){
                if(containerNode.childs[j].elementType == 'node')
                    scene.remove(containerNode.childs[j]);
            }
            scene.remove(containerNode);
        },

        removeRelationByJTopoID: function (scene,id) {
            for(var i=0;i<scene.childs.length;i++){
                if(scene.childs[i]._id == id){
                    var link = scene.childs[i];
                    var relationID = link.nodeA.__MSID + '__' + link.nodeZ.__MSID;
                    var relationList = this.__solution.solutionCfg.relationList;
                    for(var j=0;j<relationList.length;j++){
                        if(relationList[j]._id == relationID){
                            relationList.splice(j,1);
                            return;
                        }
                    }
                    break;
                }
            }
        },

        // 不支持container元素
        __getJTopoElementByID: function (scene, _id) {
            var roleList = scene.childs;
            if(roleList.length == 0)
                return null;
            for(var i=0;i<roleList.length;i++){
                if(roleList[i]._id == _id && roleList[i].elementType != 'container'){
                    return roleList[i];
                }
            }
            return null;
        },

        __getServiceByID: function (id) {
            var serviceList = this.__solution.solutionCfg.serviceList;
            for(var i=0;i<serviceList.length;i++){
                if(serviceList[i]._id == id){
                    return serviceList[i];
                }
            }
            return null;
        },

        // SADLService 结构
        // {
        //     _id: ObjectId,
        //     host:String,
        //     port:String,
        //     MS:Object,
        //     MDL:Object
        // }
        addServiceRole: function(SADLService) {
            //暂时只有一个state
            var container = this.__addJTopoContainer();
            var state = SADLService.MDL.ModelClass.Behavior.StateGroup.States.State;
            var event = state.Event;
            var eventCount = event.length;
            var scale = eventCount<=4?1:Math.pow(0.99,eventCount);
            var linkScale = (scale === 1)?1:(2-scale);
            var canvasW = $('#canvas-div').width()/2;
            var canvasH = $('#canvas-div').height()/2;
            var stateNodeX = (window.event.layerX  - canvasW)/this.__scene.scaleX - this.__scene.translateX + canvasW;
            var stateNodeY = (window.event.layerY  - canvasH)/this.__scene.scaleY - this.__scene.translateY + canvasH;

            // this.__addJTopoNode(0,0,'aaa','INPUT',1);
            var stateNode = this.__addJTopoNode(stateNodeX, stateNodeY, SADLService.MS.ms_model.m_name, 'STATES', scale);
            // 有可能会出现一个服务使用多次的情况，所以_id得在前台生成
            var __service = JSON.parse(JSON.stringify(SADLService));
            __service._id = ObjectID().str;
            this.__solution.solutionCfg.serviceList.push(__service);

            stateNode.__MSID = __service._id;
            stateNode.__nodeType = 'STATES';
            stateNode.__containerID = container._id;
            this.__bindNodeEvent(stateNode);
            container.add(stateNode);
            var inputCount = 0;
            var outputCount = 0;
            var controlCount = 0;
            for(var j=0;j<eventCount;j++){
                if(typeof event[j].ResponseParameter !== 'undefined'){
                    inputCount++;
                }
                else if(typeof event[j].DispatchParameter !== 'undefined'){
                    outputCount++;
                }
                else if(typeof event[j].ControlParameter !== 'undefined'){
                    controlCount++;
                }
            }
            var dx = __DATA_RADIUS*4*linkScale*this.__scene.scaleX;
            var dy = __DATA_RADIUS*2*linkScale*this.__scene.scaleY;
            var k = 0;
            for(var i=0;i<eventCount;i++){
                var nodeA = null;
                var x = null;
                var y = null;
                var type = null;
                var link = null;
                if(typeof event[i].DispatchParameter !== 'undefined'){
                    type = 'OUTPUT';
                }
                else {
                    x = (window.event.layerX - dx  - canvasW)/this.__scene.scaleX - this.__scene.translateX + canvasW;
                    y = (window.event.layerY - ((inputCount + controlCount - 1) / 2 - k) * dy  - canvasH)/this.__scene.scaleY - this.__scene.translateY + canvasH;
                    if(typeof event[i].ResponseParameter !== 'undefined'){
                        type = 'INPUT';
                    }
                    else if(typeof event[i].ControlParameter !== 'undefined'){
                        type = 'CONTROL';
                    }
                    k++;
                }
                nodeA = this.__addJTopoNode(x, y, event[i]._$.name, type, scale);
                nodeA.__nodeType = type;
                nodeA.__MSID = __service._id;
                nodeA.__stateID = state._$.id;
                nodeA.__eventName = event[i]._$.name;
                this.__bindNodeEvent(nodeA);
                container.add(nodeA);

                if(typeof event[i].DispatchParameter !== 'undefined'){
                    link = this.__addJTopoLink(stateNode, nodeA);
                    link.__linkType = 'OUT';
                }
                else {
                    link = this.__addJTopoLink(nodeA, stateNode);
                    link.__linkType = 'IN';
                }
            }
            JTopo.layout.layoutNode(this.__scene, stateNode, true);
        },

        removeServiceRole: function (serviceNode) {
            var self = this;
            var roleList = self.__scene.childs;
            var serviceList = this.__solution.solutionCfg.serviceList;
            for(var j=0;j<serviceList.length;j++){
                if(serviceList[j]._id == serviceNode.__MSID){
                    serviceList.splice(j,1);
                    break;
                }
            }
            for(var i=0;i<roleList.length;i++){
                if(roleList[i].elementType == 'container' && roleList[i]._id == serviceNode.__containerID){
                    self.__removeJTopoContainer(self.__scene, roleList[i]);
                    break;
                }
            }
            self.__stage.paint();
        },
        // endregion

        // region import and export
        // TODO 优化，添加 role 时直接放在 __solution 中
        __getLayoutCfg: function () {
            var self = this;
            var layout = {
                linkList: [],
                containerList: [],
                nodeList: [],
                scene: __myLayout(this.__scene)
            };
            for(var i=0;i<self.__scene.childs.length;i++){
                var role = self.__scene.childs[i];
                var roleJSON = __myLayout(role);
                if(role.elementType == 'container'){
                    layout.containerList.push(roleJSON);
                }
                else if(role.elementType == 'link'){
                    layout.linkList.push(roleJSON);
                }
                else if(role.elementType == 'node'){
                    layout.nodeList.push(roleJSON);
                }
            }
            return layout;
        },

        __getSolutionCfg: function () {
            return {
                serviceList: this.__solution.solutionCfg.serviceList,
                relationList: this.__solution.solutionCfg.relationList
            };
        },

        __importRoleByJSON: function (roleList) {
            for(var i = 0;i<roleList.length;i++){
                this.__addJTopoElementByJSON(roleList[i]);
            }
        },

        __importDataList: function () {
            var dataList = this.__task.taskCfg.dataList;
            var roleList = this.__scene.childs;
            for(let i=0;i<roleList.length;i++){
                let role = roleList[i];
                if(role.elementType == 'node'){
                    for(let j=0;j<dataList.length;j++){
                        var data = dataList[j];
                        if(role.__MSID == data.MSID && role.__stateID == data.stateID && role.__eventName == data.eventName){
                            // role.shadow = true;
                            // role.shadowColor = 'rgba(0,0,0,1)';
                            if(data.state){
                                if(data.isInput){
                                    role.fillColor = __getRGB(EventColor.input);
                                }
                                else{
                                    role.fillColor = __getRGB(EventColor[data.state.toLowerCase()]);
                                }
                            }
                            role.__gdid = data.gdid;
                            // 设置上传按钮的显示，添加下载链接
                        }
                    }
                }
            }
            this.__stage.paint();
        },

        __importStatesState: function () {
            var MSState = this.__task.MSState;
            var roleList = this.__scene.childs;
            for(let i=0;i<roleList.length;i++){
                let role = roleList[i];
                if(role.elementType == 'node' && role.__nodeType == 'STATES'){
                    for(let j=0;j<MSState.length;j++){
                        var service = MSState[j];
                        if(role.__MSID == service.MSID){
                            if(service.state){
                                role.fillColor = __getRGB(StatesColor[service.state.toLowerCase()]);
                            }
                        }
                    }
                }
            }
            this.__stage.paint();
        },

        exportSolution: function () {
            return {
                layoutCfg: this.__getLayoutCfg(),
                solutionCfg: this.__getSolutionCfg()
            };
        },

        importSolution: function () {
            var solution = this.__solution;
            var self = this;
            // this.__serviceList = solution.solutionCfg.serviceList;
            // this.__relationList = solution.solutionCfg.relationList;

            var sceneJSON = solution.layoutCfg.scene;
            this.__addJTopoElementByJSON(sceneJSON);
            var containerList = solution.layoutCfg.containerList;
            var nodeList = solution.layoutCfg.nodeList;
            var linkList = solution.layoutCfg.linkList;
            this.__importRoleByJSON(nodeList);
            this.__importRoleByJSON(containerList);
            this.__importRoleByJSON(linkList);
            self.__stage.paint();
        },

        importTask: function () {
            this.importSolution();
            this.__importDataList();
            this.__importStatesState();
        },

        initLegend: function () {
            if(this.__type == 'solution'){
                let trList = $('#solution-table tr');
                for(let i=0;i<trList.length;i++){
                    let $pic = $(trList[i]).find('td:nth-child(1) div');
                    let className = $pic.attr('class');
                    if(className){
                        $pic.css('background',SolutionColor[className]);
                    }
                }
            }
            else if(this.__type == 'task'){
                let eventTrList = $('#event-table tr');
                for(let i=0;i<eventTrList.length;i++){
                    let $pic = $(eventTrList[i]).find('td:nth-child(1) div');
                    let className = $pic.attr('class');
                    $pic.css('background',EventColor[className]);
                }

                let statesTrList = $('#states-table tr');
                for(let i=0;i<statesTrList.length;i++){
                    let $pic = $(statesTrList[i]).find('td:nth-child(1) div');
                    let className = $pic.attr('class');
                    $pic.css('background',StatesColor[className]);
                }
            }
        },

        // 给私有变量赋值，添加solution或task的基本信息到modal和input中
        initImport: function (type, data) {
            if(type == 'SOLUTION'){
                this.__solution = data;
                let solution = this.__solution;

                // bottom label
                $('#config-tag').css('display','block');
                if($('#task-info').length){
                    $('#task-info').css('display','none');
                }

                $('#solution-name').empty();
                $('#solution-author').empty();
                $('#solution-name').append(solution.solutionInfo.solutionName);
                $('#solution-author').append(solution.solutionInfo.solutionAuthor);
                $('#solutionID-input').attr('value',solution._id);
                // modal input text
                $('#solutionName').attr('value',solution.solutionInfo.solutionName);
                $('#solutionDesc').attr('value',solution.solutionInfo.solutionDesc);
                $('#solutionAuthor').attr('value',solution.solutionInfo.solutionAuthor);
            }
            else if(type == 'TASK'){
                this.__task = data;
                this.__solution = data.solutionDetail;
                // this.__dataList = data.taskCfg.dataList;
                let task = this.__task;
                let solution = this.__solution;

                // bottom label
                $('#config-tag').css('display','block');

                $('#solution-name').empty();
                $('#solution-author').empty();
                $('#solution-name').append(solution.solutionInfo.solutionName);
                $('#solution-author').append(solution.solutionInfo.solutionAuthor);
                $('#solutionID-input').attr('value',solution._id);
                $('#taskID-info').css('display','block');

                $('#task-name').empty();
                $('#task-author').empty();
                $('#task-name').append(task.taskInfo.taskName);
                $('#task-author').append(task.taskInfo.taskAuthor);
                $('#taskID-input').attr('value',task._id);
                // modal input text
                $('#taskName').attr('value',task.taskInfo.taskName);
                $('#taskDesc').attr('value',task.taskInfo.taskDesc);
                $('#taskAuthor').attr('value',task.taskInfo.taskAuthor);

                this.registerSocket();
            }
        },

        exportTask: function () {
            var taskInfo = {};
            var saveTag = $('#save-aggre-form').serializeArray();
            for(let i=0;i<saveTag.length;i++){
                taskInfo[saveTag[i].name] = saveTag[i].value;
            }
            var inputDataList = [];
            var dataList = this.__task.taskCfg.dataList;
            for(let i=0;i<dataList.length;i++){
                if(dataList[i].isInput){
                    inputDataList.push(dataList[i]);
                }
            }

            __task = {
                taskCfg:{
                    dataList: inputDataList,
                    solutionID: this.__solution._id,
                    driver: 'DataDriver'
                },
                taskState:'CONFIGURED',
                taskInfo: taskInfo
            };
            if($('#taskID-input').length && $('#taskID-input').attr('value') && $('#taskID-input').attr('value') != undefined){
                __task._id = $('#taskID-input').attr('value');
            }
            else{
                var MSState = [];
                var serviceList = this.__solution.solutionCfg.serviceList;
                for(let i=0;i<serviceList.length;i++){
                    MSState.push({
                        MSID: serviceList[i]._id,
                        state: 'UNREADY'
                    });
                }
                __task.MSState = MSState;
            }

            return __task;
        },
        // endregion

        run: function () {
            var self = this;
            var postRun = function () {
                if(!self.__isValid){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Start aggregation task failed! <br><pre>'+JSON.stringify(res.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                $.ajax({
                    url:'/aggregation/task/run',
                    data: JSON.stringify(self.exportTask()),
                    contentType:"application/json;charset=utf-8",
                    type:'POST',
                    dataType:'json',
                })
                    .done(function (res) {
                        if(res.error){
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Start aggregation task failed! <br><pre>'+JSON.stringify(res.error,null,4)+'</pre>',
                                sticky: false,
                                time: 2000
                            });
                        }
                        else {
                            $.gritter.add({
                                title: 'Notice:',
                                text: 'Start aggregation task successed, please check the run state at times!',
                                sticky: false,
                                time: 2000
                            });

                            if(window.location.pathname != '/aggregation/task/edit' && window.location.query != '?_id=' + res._id){
                                window.location.href = '/aggregation/task/edit?_id=' + res._id;
                            }
                        }
                    })
                    .fail(function (err) {
                        $.gritter.add({
                            title: 'Warning:',
                            text: 'Start aggregation task failed! <br><pre>'+JSON.stringify(err,null,4)+'</pre>',
                            sticky: false,
                            time: 2000
                        });
                    });
            };
            // 在点击运行前要有一些其他交互，如果没保存要先保存
            if($('#taskID-input').length && $('#taskID-input').attr('value') && $('#taskID-input').attr('value') != undefined){
                postRun();
            }
            else{
                $('#save-aggre-task-modal').modal('show');
                self.__bindSaveTaskEvent(false, true);
            }
        },

        // TODO 当上传数据时调用，更新所有服务的准备状态，显示在界面上
        updateServiceState: function () {

        },

        // TODO 当上传数据时调用，验证上传数据与schema 是否匹配，先不做
        validateEvent: function () {

        },

        // TODO 当在不同模型之间建立连接时，验证link 是否合法
        validateLink: function (nodeA, nodeZ) {
            // 只能由输出连向输入
            if(nodeZ.__nodeType == 'OUTPUT'){
                $.gritter.add({
                    title: 'Warning:',
                    text: 'To node must be input!',
                    sticky: false,
                    time: 2000
                });
                return false;
            }
            if(nodeA.__nodeType != 'OUTPUT'){
                $.gritter.add({
                    title: 'Warning:',
                    text: 'From node must be output!',
                    sticky: false,
                    time: 2000
                });
                return false;
            }

            // 在不同模型之间添加连线时，检查他的schema是否相同

            return true;
        },

        // region socket
        // 其他信息也都复制到node里了
        __updateNodeState: function (node) {
            if(node.__nodeType == 'STATES'){
                node.fillColor = __getRGB(StatesColor[node.__state.toLowerCase()]);
            }
            else{
                // update ui, and download link(update when db click)
                if(node.__isInput == true && node.__state == DataState.received){
                    node.fillColor = __getRGB(EventColor.input);
                }
                else{
                    node.fillColor = __getRGB(EventColor[node.__state.toLowerCase()]);
                }
                if(node.__state == DataState.ready){
                    node;
                }
            }
            this.__stage.paint();
        },

        __getEventNode: function (__MSID, __stateID, __eventName) {
            var nodeList = this.__nodeList;
            for(let i=0;i<nodeList.length;i++){
                let node = nodeList[i];
                if(node.__MSID == __MSID && node.__stateID == __stateID && node.__eventName == __eventName){
                    return node;
                }
            }
            return null;
        },

        __getStatesNode: function (MSinsID) {
            var nodeList = this.__nodeList;
            for(let i=0;i<nodeList.length;i++){
                let node = nodeList[i];
                if(node.__MSID == MSinsID && node.__nodeType == 'STATES'){
                    return node;
                }
            }
            return null;
        },

        __updateDataListState: function (dispatchRst) {
            for(let i=0;i<dispatchRst.length;i++){
                for(let j=0;j<this.__task.taskCfg.dataList.length;j++){
                    var data = this.__task.taskCfg.dataList[j];
                    if(data.gdid == dispatchRst[i].gdid && data.MSID == dispatchRst[i].MSID){
                        if(dispatchRst[i].error){
                            data.state = DataState.failed;
                            let node = this.__getEventNode(data.MSID,data.stateID,data.eventName);
                            node.__state = data.state;
                            node.__gdid = null;
                            // node.__host = null;  // 不要也行，后台查找可以得到
                            // node.__port = null;
                            this.__updateNodeState(node);
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Dispatch data failed!<br><pre>'+JSON.stringify(dispatchRst[i].error,null,4)+'</pre>',
                                sticky: false,
                                time: 2000
                            });
                        }
                        else{
                            // if(data.state == DataState.ready)
                            data.state = DataState.pending;
                            let node = this.__getEventNode(data.MSID,data.stateID,data.eventName);
                            node.__state = data.state;
                            node.__gdid = data.gdid;
                            // node.__host = data.host;
                            // node.__port = data.port;
                            this.__updateNodeState(node);
                        }
                        break;
                    }
                }
            }
        },

        // 更新下载完成的数据 或者 模型运行结果数据
        __updateDataState: function (downloadRst, newData) {
            if(!newData){
                for(let j=0;j<this.__task.taskCfg.dataList.length;j++){
                    var data = this.__task.taskCfg.dataList[j];
                    if(data.MSID == downloadRst.MSID && downloadRst.stateID == data.stateID && downloadRst.eventName == data.eventName){
                        data.state = downloadRst.err?DataState.failed:DataState.received;
                        let node = this.__getEventNode(data.MSID,data.stateID,data.eventName);
                        node.__state = data.state;
                        node.__gdid = data.gdid;
                        node.__isInput = data.isInput;
                        this.__updateNodeState(node);
                        break;
                    }
                }
            }
            else{
                let node = this.__getEventNode(newData.MSID,newData.stateID,newData.eventName);
                node.__state = newData.state;
                node.__gdid = newData.gdid;
                node.__isInput = newData.isInput;
                this.__updateNodeState(node);
            }
        },

        __updateByDispatchedRst: function (dispatchRst) {

        },

        __updateByDownloadedRst: function (downloadRst) {

        },

        registerSocket: function () {
            var self = this;
            socket = io('/integrate/task');

            socket.on('connect', function(){
                console.log('socket connected to server');
                // 按照taskID 给room命名，后台有状态更新时，更新所有该task对应的client
                socket.emit('dispatch room',self.__task._id);
            });

            socket.on('disconnect', function(){
                console.log('disconnected');
            });

            socket.on('message',function (msg) {
                console.log(msg);
            });

            socket.on('error',function (msg) {
                console.log(JSON.parse(msg));
            });
            ////////////////////////////////////////////////////////////////////////////////

            // {
            //     error:err,
            //     dispatchRst:dispatchRst      // gdid, MSID, stateID, eventName, error
            // }
            socket.on('data dispatched',function (msg) {
                msg = JSON.parse(msg);
                console.log('data dispatched', msg);
                if(msg.error){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Dispatch data failed!<br><pre>'+JSON.stringify(msg.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                else{
                    self.__updateDataListState(msg.dispatchRst);
                }
            });

            // {
            //     error:err,
            //     downloadRst:replyData
            // }
            // downloadRst:
            // {
            //     taskID: dataPosition.taskID,
            //     gdid: dataPosition.gdid,
            //     MSID: dataPosition.MSID,
            //     stateID: dataPosition.stateID,
            //     eventName: dataPosition.eventName,
            //     err: err
            // }
            socket.on('data downloaded',function (msg) {
                msg = JSON.parse(msg);
                console.log('data downloaded', msg);
                if(msg.error){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Download data failed!<br><pre>'+JSON.stringify(msg.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                else{
                    self.__updateDataState(msg.downloadRst);
                }
            });

            // {
            //     error:null,
            //     MSinsID: MSinsID
            // }
            socket.on('service starting',function (msg) {
                msg = JSON.parse(msg);
                console.log('service starting', msg);
                if(msg.error){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Start service failed!<br><pre>'+JSON.stringify(msg.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                else{
                    var statesNode = self.__getStatesNode(msg.MSinsID);
                    statesNode.__state = MSState.pending;
                    self.__updateNodeState(statesNode);
                }
            });

            // {
            //     error:res.error,
            //     MSinsID: MSinsID
            // }
            socket.on('service started',function (msg) {
                msg = JSON.parse(msg);
                console.log('service started', msg);
                let statesNode = self.__getStatesNode(msg.MSinsID);
                if(msg.error){
                    statesNode.__state = MSState.collapsed;
                    self.__updateNodeState(statesNode);
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Dispatch data failed!<br><pre>'+JSON.stringify(msg.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                else{
                    statesNode.__state = MSState.running;
                    self.__updateNodeState(statesNode);
                }
            });

            // {
            //     error:null,
            //     MSinsID: MSinsID,
            //     MSState: finishedInfo.MSState,
            //     newDataList: newDataList
            // }
            socket.on('service stoped',function (msg) {
                msg = JSON.parse(msg);
                console.log('service stoped', msg);
                if(msg.error){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Dispatch data failed!<br><pre>'+JSON.stringify(msg.error,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                }
                else{
                    var statesNode = self.__getStatesNode(msg.MSinsID);
                    statesNode.__state = msg.MSState;
                    self.__updateNodeState(statesNode);
                    // self.__dataList = self.__dataList.concat(msg.newDataList);
                    self.__task.taskCfg.dataList = self.__task.taskCfg.dataList.concat(msg.newDataList);
                    for(let i=0;i<msg.newDataList.length;i++){
                        self.__updateDataState(null, msg.newDataList[i]);
                    }
                }
            });

            socket.on('update task state',function (msg) {
                var state = msg.taskState;
                if(state == TaskState.finished){
                    $.gritter.add({
                        title: 'Notice:',
                        text: 'Task finished!',
                        sticky: false,
                        time: 2000
                    });
                }
                else if(state == TaskState.end){
                    $.gritter.add({
                        title: 'Notice:',
                        text: 'Task run to the end, please upload the essential input data to continue!',
                        sticky: false,
                        time: 2000
                    });
                }
                else if(state == TaskState.collapsed){
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Task collapsed. Maybe caused by unsuited input data or model error!',
                        sticky: false,
                        time: 2000
                    });
                }
                else if(state == TaskState.pause){
                    $.gritter.add({
                        title: 'Notice:',
                        text: 'Task paused, please cancel the break points to continue!',
                        sticky: false,
                        time: 2000
                    });
                }
            })
        }
        // endregion
    };
})();

module.exports = CanvasJS;