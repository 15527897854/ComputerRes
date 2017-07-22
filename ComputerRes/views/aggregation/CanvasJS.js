/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var ObjectID = require('bson-objectid');

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
        __mode: 'view',     // view edit run

        // solution
        __solution: null,
        __task: null,

        // solutionCfg
        __serviceList: [],
        __relationList: [],
        // taskCfg
        __dataList: [],             // gdid MSID stateID eventName TODO 应该加上 host port 两个字段，表示数据是以服务的形式接入进来的

        // canvas role
        __nodeList: [],
        __linkList: [],
        __containerList: [],

        // temp
        __currentNode: null,
        __isValid: true,

        init: function(mode) {
            var self = this;
            this.__mode = mode;
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
        },

        __bindToolbarEvent: function () {
            var self = this;
            $('#toolbar button').click(function () {
                if(typeof ($(this).attr('data-toggle')) !== 'undefined' && $(this).attr('data-toggle') == 'button')
                    if(!$(this).hasClass('active')){
                        $('#toolbar button').removeClass('active');
                    }
                    else{
                        $('#hand-tool').addClass('active');
                    }

                switch ($(this).attr('id')){
                    //清空场景
                    case 'del-all-tool':
                        self.__serviceList = [];
                        self.__relationList = [];
                        self.__dataList = [];
                        self.__scene.clear();

                        self.__toolMode = 'normal';
                        self.__scene.mode = 'normal';
                        break;
                    //回到初始位置
                    case 'back-pos-tool':
                        // self.__stage.centerAndZoom(1);
                        // self.__stage.setCenter(0,0);
                        // self.__stage.zoom(1);
                        // TODO 缩放恢复
                        self.__scene.translateX = 0;
                        self.__scene.translateY = 0;
                        self.__stage.paint();

                        self.__toolMode = 'normal';
                        self.__scene.mode = 'normal';
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
                        }
                        break;
                    case 'run-tool':
                        self.run();
                        break;
                    case 'save-solution-tool':
                        $('#save-aggre-solution-modal').modal('show');
                        self.__bindSaveSolutionEvent();
                        break;
                    case 'save-task-tool':
                        $('#save-aggre-task-modal').modal('show');
                        self.__bindSaveTaskEvent();
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
                    __hideContextMenu();
                }
            });
        },

        __bindSceneEvent: function (scene) {
            var self = this;
            scene.addEventListener('mouseup',function (e) {
                if(e.button == 0){

                }
                else if(e.button == 2){
                    var target = e.target;
                    if( self.__mode == 'edit' && target && target.elementType == 'link' && target.__linkType == 'CUSTOM'){
                        self.removeRelationByJTopoID(self.__scene, e.target._id);
                        self.__removeJTopoElementByID(self.__scene, e.target._id);
                    }
                }
            });
        },

        __bindContainerEvent: function (container) {

        },

        __bindNodeEvent: function (node) {
            var self = this;
            var type = node.__nodeType;

            if(self.__mode != 'view'){
                node.addEventListener('mouseup',function (e) {
                    if(e.button == 2){
                        __hideContextMenu();
                        __showContextMenu(node.__nodeType);
                        self.__currentNode = node;
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
                    self.__currentNode = node;
                    self.__buildEventDetail();
                });
            }
        },

        __bindSaveSolutionEvent: function () {
            var self = this;
            $('#save-aggre-form').validate({
                onfocusout:true,
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
                        url: '/aggregation/solution/save',
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

        __bindSaveTaskEvent: function () {
            var self = this;
            $('#save-aggre-form').validate({
                onfocusout:true,
                focusInvalid:true,
                submitHandler:function (form) {
                    var data = self.exportTask();
                    $('#loading-div').show();
                    $('#submit-form-btn').attr('disabled',true);
                    $.ajax( {
                        url: '/aggregation/task/save',
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
                node.borderWidth = 1;
                node.borderColor = '0,0,0';
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
                node.borderRadius = __DATA_RADIUS;
                node.borderWidth = 1;
                node.borderColor = '0,0,0';
            }
            if(x && y)
                node.setCenterLocation(x,y);
            node.fillColor = '255,255,255';
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
            link.lineWidth = 1;
            link.bundleOffset = 60;
            link.bundleGap = 15;
            link.strokeColor = '0,0,0';
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

        __addJTopoElementByJSON: function (roleJSON) {
            var role = null;
            if(roleJSON.elementType == 'link'){
                var nodeA = __getRoleByID(this.__nodeList,roleJSON.nodeAID);
                var nodeZ = __getRoleByID(this.__nodeList,roleJSON.nodeZID);
                role  = new JTopo.Link(nodeA,nodeZ);
                for(var key in roleJSON){
                    role[key] = roleJSON[key];
                }
                // if(this.__mode == 'edit'){
                //     this.__bindNodeEvent(role);
                // }
                this.__linkList.push(role);
            }
            else if(roleJSON.elementType == 'container'){
                role = new JTopo.Container();
                for(let key in roleJSON){
                    role[key] = roleJSON[key];
                }
                if(roleJSON.childsID && roleJSON.childsID != undefined){
                    for(var i=0;i<roleJSON.childsID.length;i++){
                        var child = __getRoleByID(this.__nodeList, roleJSON.childsID[i]);
                        if(child && child != undefined)
                            role.add(child);
                    }
                }
                this.__containerList.push(role);
            }
            else if(roleJSON.elementType == 'node'){
                role = new JTopo.Node();
                for(let key in roleJSON){
                    role[key] = roleJSON[key];
                }
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

        __getServiceByID: function (id) {
            for(var i=0;i<this.__serviceList.length;i++){
                if(this.__serviceList[i]._id == id){
                    return this.__serviceList[i];
                }
            }
            return null;
        },

        // TODO 数据不一定必须要上传，也有可能是以服务的形式接入进来
        // 上传数据，会添加到 __dataList 中
        __buildEventDetail: function () {
            var node = this.__currentNode;
            var self = this;
            var type = node.__nodeType;
            var id = node.__MSID + '___' + node.__stateID + '___' + node.__eventName;
            if($('#'+id).length){
                $('#'+id).parent().show();
                $('#'+id).parent().css('z-index',__getMaxZIndex()+1);
            }
            else{
                var eventDetail = __getEventDetail(node.__stateID,node.__eventName,node.__MSID, self.__serviceList);
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
                $dataInfoDialog.dialog({});
                $('#'+id).parent().addClass('dataInfo-ui-dialog');

                if(this.__mode == 'configure'){
                    if(node.__nodeType == 'INPUT' || node.__nodeType == 'CONTROL'){
                        $(
                            '<p><b>Upload data: </b></p>' +
                            '<input id="' + id + '-upload-data" name="myfile" type="file" class="file" data-show-preview="false">'
                        ).appendTo($dataInfoDialog);

                        if(node.__gdid && node.__gdid != undefined){
                            $('<button id="' + id + '-download-data " onclick="window.open(\'/geodata/'+node.__gdid+'\')"  class="btn btn-default btn-xs down-event-btn" style="margin-top: 20px;">Download data</button>')
                                .appendTo($dataInfoDialog);
                        }

                        // TODO 验证数据合法性
                        $('#'+id+'-upload-data').fileinput({
                            uploadUrl:'/geodata/file',
                            allowedFileExtensions:['xml','zip'],
                            // showUpload:true,
                            // showRemove:true,
                            showUploadedThumbs:false,
                            autoReplace:true,
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
                                    state: 'READY'
                                };
                                var hasInserted = false;
                                for(var i=0;i<self.__dataList.length;i++){
                                    // 已经上传过，重新上传替换
                                    if(self.__dataList[i].MSID == node.__MSID &&
                                    self.__dataList[i].stateID == node.__stateID &&
                                    self.__dataList[i].eventName == node.__eventName){
                                        self.__dataList[i] = inputData;
                                        hasInserted = true;
                                        break;
                                    }
                                }
                                if(!hasInserted){
                                    self.__dataList.push(inputData);
                                }
                                node.__gdid = gdid;
                                node.shadow = true;
                                node.shadowColor = 'rgba(0,0,0,1)';

                                // 添加数据下载链接
                                // TODO 下载链接不对，有可能会跨域请求别的节点上的数据
                                $('#'+ id +' .down-event-btn').remove();
                                $('<button id="' + id + '-download-data " onclick="window.open(\'/geodata/'+node.__gdid+'\')"  class="btn btn-default btn-xs down-event-btn" style="margin-top: 20px;">Download data</button>')
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
            this.__relationList.push(relation);
            return relation;
        },

        // 手动添加link，此处会添加到私有变量 __relationList 中，附加信息有
        // {
        //     __linkType: 'CUSTOM',
        //     __relationID: String
        // }
        addLinkRoleManuel: function () {
            var self = this;
            var scene = this.__scene;
            var beginNode = null;
            var tempNodeA = new JTopo.Node('tempA');
            tempNodeA.setSize(1, 1);

            var tempNodeZ = new JTopo.Node('tempZ');
            tempNodeZ.setSize(1, 1);

            var link = new JTopo.Link(tempNodeA, tempNodeZ);
            link.lineWidth = 1;

            scene.mouseup(function(e){
                if(self.__toolMode != 'link')
                    return;
                if(e.button == 2){
                    beginNode = null;
                    scene.remove(link);
                    return;
                }
                if(e.target != null && e.target instanceof JTopo.Node){
                    if(beginNode == null){
                        // TODO 验证添加规则
                        if(e.target.__nodeType == 'STATES'){
                            beginNode = null;
                            scene.remove(link);
                            return;
                        }

                        beginNode = e.target;
                        scene.add(link);
                        tempNodeA.setLocation(e.x, e.y);
                        tempNodeZ.setLocation(e.x, e.y);
                    }
                    else if(beginNode !== e.target){
                        var endNode = e.target;
                        //  region 验证添加规则
                        if(e.target.__nodeType == 'STATES'){
                            $.gritter.add({
                                title: '警告：',
                                text: '不能连接到服务！',
                                sticky: false,
                                time: 2000
                            });
                            beginNode = null;
                            scene.remove(link);
                            return;
                        }
                        if(!self.validateLink(beginNode,endNode)){
                            beginNode = null;
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Invalid link between node with different schema!',
                                sticky: false,
                                time: 2000
                            });
                            return ;
                        }
                        // endregion
                        var relation = self.__addRelation(beginNode,endNode);
                        var l = new JTopo.Link(beginNode, endNode);
                        l.arrowsRadius = 7;
                        l.lineWidth = 1;
                        l.bundleOffset = 60;
                        l.bundleGap = 15;
                        l.strokeColor = '72,152,255';
                        l._id = beginNode._id + '__' + endNode._id;
                        l.__linkType = 'CUSTOM';
                        l.__relationID = relation._id;


                        scene.add(l);
                        beginNode = null;
                        scene.remove(link);
                    }
                    else{
                        beginNode = null;
                    }
                }else{
                    scene.remove(link);
                }
            });

            scene.mousedown(function(e){
                if(self.__toolMode != 'link')
                    return;
                if(e.target == null || e.target === beginNode || e.target === link){
                    scene.remove(link);
                }
            });
            scene.mousemove(function(e){
                if(self.__toolMode != 'link')
                    return;
                tempNodeZ.setLocation(e.x, e.y);
            });
        },

        removeRelationByJTopoID: function (scene,id) {
            for(var i=0;i<scene.childs.length;i++){
                if(scene.childs[i]._id == id){
                    var link = scene.childs[i];
                    var relationID = link.nodeA.__MSID + '__' + link.nodeZ.__MSID;
                    for(var j=0;j<this.__relationList.length;j++){
                        if(this.__relationList[j]._id == relationID){
                            this.__relationList.splice(j,1);
                            return;
                        }
                    }
                    break;
                }
            }
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
            var stateNodeX = window.event.layerX  - this.__scene.translateX;
            var stateNodeY = window.event.layerY  - this.__scene.translateY;
            // var stateNodeX = (window.event.layerX - this.__scene.getCenterLocation().x) * this.__scene.scaleX - this.__scene.translateX;
            // var stateNodeY = (window.event.layerY - this.__scene.getCenterLocation().y) * this.__scene.scaleY - this.__scene.translateY;
            var stateNode = this.__addJTopoNode(stateNodeX, stateNodeY, SADLService.MS.ms_model.m_name, 'STATES', scale);
            // 有可能会出现一个服务使用多次的情况，所以_id得在前台生成
            var __service = JSON.parse(JSON.stringify(SADLService));
            __service._id = ObjectID().str;
            this.__serviceList.push(__service);

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
            var dx = __DATA_RADIUS*4*linkScale;
            var dy = __DATA_RADIUS*2*linkScale;
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
                    x = window.event.layerX - dx - this.__scene.translateX;
                    y = window.event.layerY - ((inputCount + controlCount - 1) / 2 - k) * dy - this.__scene.translateY;
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
            for(var j=0;j<self.__serviceList.length;j++){
                if(self.__serviceList[j]._id == serviceNode.__MSID){
                    self.__serviceList.splice(j,1);
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
                serviceList: this.__serviceList,
                relationList: this.__relationList
            };
        },

        __importRoleByJSON: function (roleList) {
            for(var i = 0;i<roleList.length;i++){
                this.__addJTopoElementByJSON(roleList[i]);
            }
        },

        __importDataList: function () {
            var dataList = this.__dataList;
            var roleList = this.__scene.childs;
            for(let i=0;i<roleList.length;i++){
                let role = roleList[i];
                if(role.elementType == 'node'){
                    for(let j=0;j<dataList.length;j++){
                        var data = dataList[j];
                        if(role.__MSID == data.MSID && role.__stateID == data.stateID && role.__eventName == data.eventName){
                            role.shadow = true;
                            role.shadowColor = 'rgba(0,0,0,1)';
                            role.__gdid = data.gdid;
                            // 设置上传按钮的显示，添加下载链接
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
            this.__serviceList = solution.solutionCfg.serviceList;
            this.__relationList = solution.solutionCfg.relationList;

            var sceneJSON = solution.layoutCfg.scene;
            this.__addJTopoElementByJSON(sceneJSON);
            var containerList = solution.layoutCfg.containerList;
            var nodeList = solution.layoutCfg.nodeList;
            var linkList = solution.layoutCfg.linkList;
            this.__importRoleByJSON(nodeList);
            this.__importRoleByJSON(linkList);
            this.__importRoleByJSON(containerList);
            self.__stage.paint();
        },

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
                this.__dataList = data.taskCfg.dataList;
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
            }
        },

        exportTask: function () {
            var taskInfo = {};
            var saveTag = $('#save-aggre-form').serializeArray();
            for(var i=0;i<saveTag.length;i++){
                taskInfo[saveTag[i].name] = saveTag[i].value;
            }

            // var MSState = [];
            // for(let i=0;i<this.__serviceList.length;i++){
            //     MSState.push({
            //         MSID: this.__serviceList[i]._id,
            //         state: 'READY'
            //     });
            // }

            var task = {
                taskCfg:{
                    dataList: this.__dataList,
                    solutionID: this.__solution._id,
                    driver: 'DataDriver'
                },
                taskState:'CONFIGURED',
                taskInfo: taskInfo
                // MSState: MSState
            };
            if($('#taskID-input').length && $('#taskID-input').attr('value') && $('#taskID-input').attr('value') != undefined){
                task._id = $('#taskID-input').attr('value');
            }
            return task;
        },

        importTask: function () {
            this.importSolution();
            this.__importDataList();
        },

        run: function () {
            // TODO 再点击运行前要有一些其他交互

            if(!this.__isValid){
                $.gritter.add({
                    title: 'Warning:',
                    text: 'Start aggregation task failed! <br><pre>'+JSON.stringify(res.error,null,4)+'</pre>',
                    sticky: false,
                    time: 2000
                });
            }
            $.ajax({
                url:'/aggregation/task/run',
                data: JSON.stringify(this.exportTask()),
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
        },

        // TODO 当上传数据时调用，更新所有服务的准备状态，显示在界面上
        updateServiceState: function () {

        },

        // TODO 当上传数据时调用，验证上传数据与schema 是否匹配
        validateEvent: function () {

        },

        // TODO 当在不同模型之间建立连接时，验证link 是否合法
        validateLink: function (nodeA, nodeZ) {
            return true;
        }
    };
})();

module.exports = CanvasJS;