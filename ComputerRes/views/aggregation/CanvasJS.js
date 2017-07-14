/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
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

    var __getEventDetail = function (node,serviceNode) {
        var mdl = serviceNode.__service.MDL;
        var datasetItemList = mdl.ModelClass.Behavior.RelatedDatasets.DatasetItem;
        var states = mdl.ModelClass.Behavior.StateGroup.States.State;
        var state = null;
        var event = null;
        if(states instanceof Array){
            for(var i=0;i<states.length;i++){
                if(states[i].$.id == node.__stateID){
                    state = states[i];
                }
            }
        }
        else{
            if(states.$.id == node.__stateID){
                state = states;
            }
        }
        var events = state.Event;
        if(events instanceof Array){
            for(var j=0;j<events.length;j++){
                if(events[j].$.name == node.__eventName){
                    event = events[j];
                    break;
                }
            }
        }
        else{
            if(events.$.name == node.__eventName){
                event = events;
            }
        }
        var datasetReference = null;
        if(event.$.type == 'response'){
            if(typeof event.ResponseParameter != 'undefined'){
                datasetReference = event.ResponseParameter.$.datasetReference;
            }
            else if(typeof event.ControlParameter != 'undefined'){
                datasetReference = event.ControlParameter.$.datasetReference;
            }
        }
        else if(event.$.type == 'noresponse'){
            datasetReference = event.DispatchParameter.$.datasetReference;
        }

        var schema = null;
        if(datasetItemList instanceof Array){
            for(var k=0;k<datasetItemList.length;k++){
                if(datasetItemList[k].$.name == datasetReference){
                    schema = datasetItemList[k];
                    break;
                }

            }
        }
        else {
            if(datasetItemList.$.name == datasetReference){
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

    return {
        __stage: null,
        __scene: null,
        __toolMode: null,   // normal zoomIn zoomOut delete
        __currentNode: null,

        __serviceList: [],
        __relationList: [],
        __dataList: [],

        init: function() {
            var self = this;
            $('#canvas').attr('height',$('#canvas-div').height());
            $('#canvas').attr('width',$('#canvas-div').width());
            this.__stage = new JTopo.Stage($('#canvas')[0]);
            this.__scene = new JTopo.Scene();
            this.__stage.add(this.__scene);
            this.__stage.wheelZoom = 0.85;
            this.__scene.mode = 'normal';

            this.__bindStageEvent(this.__stage);
            this.__bindSceneEvent(this.__scene);
            this.__bindToolbarEvent();
            this.addLinkRoleManuel();
        },

        __bindToolbarEvent: function () {
            var self = this;
            $('#toolbar button').click(function () {
                if(typeof ($(this).attr('data-toggle')) !== 'undefined' && $(this).attr('data-toggle') == 'button')
                    if(!$(this).hasClass('active')){
                        $('#toolbar button').removeClass('active');
                    }
                    else{
                        $('#hand-tool').click();
                    }

                switch ($(this).attr('id')){
                    //清空场景
                    case 'del-all-tool':
                        self.__serviceList = [];
                        self.__relationList = [];
                        self.__dataList = [];
                        self.__scene.clear();
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
                        break;
                    //放大
                    case 'zoomIn-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'zoomIn';
                        }
                        else {
                            self.__toolMode = 'normal';
                        }
                        break;
                    //缩小
                    case 'zoomOut-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'zoomOut';
                        }
                        else {
                            self.__toolMode = 'normal';
                        }
                        break;
                    //拖动模式
                    case 'hand-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'normal';
                        }
                        else {
                            self.__scene.mode = 'select';
                        }
                        break;
                    //框选模式
                    case 'select-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'select';
                        }
                        else {
                            self.__scene.mode = 'normal';
                        }
                        break;
                    //编辑模式
                    case 'edit-tool':
                        if(!$(this).hasClass('active')){
                            self.__scene.mode = 'edit';
                        }
                        else {
                            self.__scene.mode = 'normal';
                        }
                        break;
                    //删除模式
                    case 'del-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'delete';
                        }
                        else {
                            self.__toolMode = 'normal';
                        }
                        break;
                    //创建连接线模式
                    case 'link-tool':
                        if(!$(this).hasClass('active')){
                            self.__toolMode = 'link';
                        }
                        else {
                            self.__toolMode = 'normal';
                        }
                        break;
                    case 'run-tool':
                        self.run();
                        break;
                    case 'save-tool':
                        self.saveAggreCfg();
                        break;
                }
            });

            $('#hand-tool').click();
        },

        __bindMenuEvent: function (node) {
            var self = this;
            var type = node.__nodeType;
            if(type == 'STATES'){
                $('#del-ms-menu').on('click',function (e) {
                    self.removeServiceRole(node);
                    __hideContextMenu();
                });
            }
            else{
                $('#upload-data-menu');
            }
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
            });
        },

        __bindSceneEvent: function (scene) {
            var self = this;
            scene.addEventListener('mouseup',function (e) {
                if(e.button == 0){

                }
                else if(e.button == 2){
                    var target = e.target;
                    if(target && target.elementType == 'link' && target.__linkType == 'CUSTOM'){
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

            node.addEventListener('mouseup',function (e) {
                if(e.button == 2){
                    __hideContextMenu();
                    __showContextMenu(node.__nodeType);
                    self.__bindMenuEvent(node);

                    if(node.__nodeType == 'STATES'){
                        if(self.__toolMode == 'delete')
                            self.removeServiceRole(e.target);
                    }
                }
                else if(e.button == 0){

                }
            });

            if(type != 'STATES'){
                // 双击上传数据
                node.addEventListener('dbclick',function (e) {
                    self.__uploadData(node);
                });
            }
        },

        // 两种node，附加信息有：
        // {
        //     __nodeType:'STATES',
        //     __eventNodeIDList:Array,
        //     __service:Object
        // }
        // {
        //     __nodeType:'INPUT',      // 'OUTPUT' 'CONTROL'
        //     __serviceNodeID:String,
        //     __MSID:String,
        //     __stateID:String,
        //     __eventName:String
        // }
        __addJTopoNode: function(layerX, layerY, text, type, scale) {
            var x = layerX - this.__scene.translateX;
            var y = layerY - this.__scene.translateY;
            var self = this;
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
            this.__bindNodeEvent(node);

            this.__scene.add(node);
            return node;
        },

        // 增加属性：__linkType:'CUSTOM'
        __addJTopoLink: function (nodeA, nodeZ) {
            // var link = new JTopo.FoldLink(nodeA, nodeZ);
            var link = new JTopo.Link(nodeA, nodeZ);
            // link.direction = direction || 'horizontal';
            link.arrowsRadius = 7;
            link.lineWidth = 1;
            link.bundleOffset = 60;
            link.bundleGap = 15;
            link.strokeColor = '0,0,0';
            this.__scene.add(link);
            return link;
        },

        __addJTopoContainer: function () {
            var container = new JTopo.Container();
            container.alpha = 0;
            this.__scene.add(container);
            return container;
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

        __removeJTopoContainerById: function (scene, _id) {
            if(scene.childs.length == 0)
                return -1;
            for(var i=0;i<scene.childs.length;i++){
                if(scene.childs[i]._id == _id){
                    var containerNode = scene.childs[i];
                    for(var j=0;j<containerNode.childs.length;j++){
                        scene.remove(containerNode.childs[j]);
                    }
                    return 1;
                }
            }
            return 0;
        },

        // 上传数据，会添加到 __dataList 中
        __uploadData: function (node) {
            var self = this;
            var type = node.__nodeType;
            var id = node.__MSID + '___' + node.__stateID + '___' + node.__eventName;
            if($('#'+id).length){
                $('#'+id).parent().show();
            }
            else{
                var eventDetail = __getEventDetail(node,self.__getJTopoElementByID(self.__scene,node.__serviceNodeID));
                var $dataInfoDialog = null;
                if(eventDetail == null){
                    $dataInfoDialog = $(
                        '<div id="'+id+'" class="data-info-dialog" title="Data Information">' +
                        'Unknown data schema'+
                        '</div>'
                    );
                }
                else{
                    var eventName = eventDetail.event.$.name;
                    var eventType = eventDetail.event.$.type=='response'?'Input':'Output';
                    var eventDesc = eventDetail.event.$.description;
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

                if(node.__nodeType == 'INPUT' || node.__nodeType == 'CONTROL'){
                    $(
                        '<p><b>Upload data: </b></p>' +
                        '<input id="' + id + '-upload-data" name="myfile" type="file" class="file" data-show-preview="false">'
                    ).appendTo($dataInfoDialog);
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
                                    title: '警告：',
                                    text: '上传数据失败！',
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
                                eventName: node.__eventName
                            };
                            var hasInserted = false;
                            for(var i=0;i<self.__dataList.length;i++){
                                if(self.__dataList[i].gdid == gdid){
                                    self.__dataList[i] = inputData;
                                    hasInserted = true;
                                    break;
                                }
                            }
                            if(!hasInserted){
                                self.__dataList.push(inputData);
                            }
                            node.shadow = true;
                        })
                        .on('fileerror',function (e, data) {
                            $.gritter.add({
                                title: '警告：',
                                text: '<pre>'+JSON.stringify(error, null, 4)+'</pre>',
                                sticky: false,
                                time: 2000
                            });
                        });
                }

                $('.ui-dialog-titlebar-close').click(function (e) {
                    $(this).parent().parent().hide();
                });
            }

            this.updateServiceState();
        },

        __addRelation: function (nodeA, nodeZ) {
            this.__relationList.push({
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
            });
        },

        __getAllService: function () {
            this.__serviceList = [];
            var roleList = this.__scene.childs;
            for(var i=0;i<roleList.length;i++){
                var role = roleList[i];
                if(role.__nodeType == 'STATES'){
                    this.__serviceList.push(role.__service);
                }
            }
            return this.__serviceList;
        },

        //手动添加link，此处会添加到私有变量 __relationList 中
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
                    }else if(beginNode !== e.target){
                        // TODO 验证添加规则
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

                        var endNode = e.target;
                        self.__addRelation(beginNode,endNode);
                        var l = new JTopo.Link(beginNode, endNode);
                        l.arrowsRadius = 7;
                        l.lineWidth = 1;
                        l.bundleOffset = 60;
                        l.bundleGap = 15;
                        l.strokeColor = '72,152,255';
                        l.__linkType = 'CUSTOM';

                        scene.add(l);
                        beginNode = null;
                        scene.remove(link);
                    }else{
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
            var self = this;
            //暂时只有一个state

            var container = this.__addJTopoContainer();
            var state = SADLService.MDL.ModelClass.Behavior.StateGroup.States.State;
            var event = state.Event;
            var eventCount = event.length;
            var scale = eventCount<=4?1:Math.pow(0.99,eventCount);
            var linkScale = (scale === 1)?1:(2-scale);
            var stateNode = this.__addJTopoNode(window.event.layerX, window.event.layerY, SADLService.MS.ms_model.m_name, 'STATES', scale);
            stateNode.__service = SADLService;
            stateNode.__nodeType = 'STATES';
            stateNode.__eventNodeIDList = [];
            stateNode.__containerID = container._id;
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
                if(typeof event[i].DispatchParameter !== 'undefined'){
                    var nodeZ = this.__addJTopoNode(null,null, event[i].$.name, 'OUTPUT', scale);
                    nodeZ.__serviceNodeID = stateNode._id;
                    nodeZ.__MSID = SADLService._id;
                    nodeZ.__nodeType = 'OUTPUT';
                    nodeZ.__stateID = state.$.id;
                    nodeZ.__eventName = event[i].$.name;
                    stateNode.__eventNodeIDList.push(nodeZ._id);
                    this.__addJTopoLink(stateNode, nodeZ);
                    container.add(nodeZ);
                }
                else {
                    var x = window.event.layerX - dx;
                    var y = window.event.layerY - ((inputCount + controlCount - 1) / 2 - k) * dy;
                    var type = null;
                    if(typeof event[i].ResponseParameter !== 'undefined'){
                        type = 'INPUT';
                    }
                    else if(typeof event[i].ControlParameter !== 'undefined'){
                        type = 'CONTROL';
                    }
                    var nodeA = this.__addJTopoNode(x, y, event[i].$.name, type, scale);
                    nodeA.__serviceNodeID = stateNode._id;
                    nodeA.__MSID = SADLService._id;
                    nodeA.__nodeType = type;
                    nodeA.__stateID = state.$.id;
                    nodeA.__eventName = event[i].$.name;
                    stateNode.__eventNodeIDList.push(nodeA._id);
                    this.__addJTopoLink(nodeA, stateNode);
                    k++;
                    container.add(nodeA);
                }
            }
            JTopo.layout.layoutNode(this.__scene, stateNode, true);
        },

        removeServiceRole: function (serviceNode) {
            var self = this;
            var __serviceNodeID = serviceNode._id;
            // for(var i=0;i<serviceNode.__eventNodeIDList.length;i++){
            //     self.removeNodeByID(self.__scene,serviceNode.__eventNodeIDList[i]);
            // }
            // self.removeNodeByID(self.__scene,__serviceNodeID);
            var roleList = self.__scene.childs;
            for(var i=0;i<roleList.length;i++){
                if(roleList[i].elementType == 'container' && roleList[i]._id == serviceNode.__containerID){
                    self.__removeJTopoContainerById(self.__scene, serviceNode.__containerID);
                }
            }
            self.__stage.paint();
        },

        export2JSON: function () {

        },

        // TODO 当有数据上传是调用，更新所有服务的准备状态
        updateServiceState: function () {

        },

        // TODO 验证数据配置状态和服务连接关系
        validateAggreCfg: function () {

        },

        getAggreCfg: function () {
            return {
                serviceList: this.__getAllService(),
                relationList: this.__relationList,
                dataList: this.__dataList
            };
        },

        run: function () {
            var self = this;
            $.ajax({
                url:'/aggregation/run',
                data: {aggreCfg: self.getAggreCfg()},
                contentType:"application/json;charset=utf-8",
                type:'POST',
                dataType:'json',
            })
                .done(function (res) {
                    if(res.error){
                        $.gritter.add({
                            title: '警告：',
                            text: '服务聚合失败！<br><pre>'+JSON.stringify(res.error,null,4)+'</pre>',
                            sticky: false,
                            time: 2000
                        });
                    }
                    else {

                    }
                })
                .fail(function (err) {
                    $.gritter.add({
                        title: '警告：',
                        text: '服务聚合失败！<br><pre>'+JSON.stringify(err,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                });
        },

        saveAggreCfg: function () {
            var self = this;
            var data = JSON.stringify({aggreCfg:self.getAggreCfg()});
            $.ajax({
                url: '/aggregation/save',
                data: data,
                contentType:"application/json;charset=utf-8",
                type: 'POST',
                dataType: 'json'
            })
                .done(function (res) {
                    if(res.error){
                        $.gritter.add({
                            title: '警告：',
                            text: '保存聚合配置失败！<br><pre>'+JSON.stringify(res.error,null,4)+'</pre>',
                            sticky: false,
                            time: 2000
                        });
                    }
                    else {

                    }
                })
                .fail(function (err) {
                    $.gritter.add({
                        title: '警告：',
                        text: '保存聚合配置失败！<br><pre>'+JSON.stringify(err,null,4)+'</pre>',
                        sticky: false,
                        time: 2000
                    });
                });
        }
    };
})();

module.exports = CanvasJS;