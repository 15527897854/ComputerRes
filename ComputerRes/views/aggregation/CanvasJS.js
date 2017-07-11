CanvasJS = (()=> {
    var __STATES_WIDTH = 80;
    var __STATES_HEIGHT = 60;
    var __DATA_RADIUS = 25;
    var __currentNode = null;

    var __showContextMenu = function (event) {
        if(event.button == 2){
            $('#contextMenu').css({
                top:event.layerY,
                left:event.layerX
            }).show();
        }
    };
    var __hideContextMenu = function () {
            $('#contextMenu').hide();
    };

    var __uploadData = function (serviceInfo) {

    };

    return {
        __stage:null,
        __scene:null,

        init: function() {
            $('#canvas').attr('height',$('#canvas-div').height());
            $('#canvas').attr('width',$('#canvas-div').width());
            this.__stage = new JTopo.Stage($('#canvas')[0]);
            this.__scene = new JTopo.Scene();
            this.__stage.add(this.__scene);
            this.__stage.wheelZoom = 0.85;
            this.__scene.mode = 'normal';
            this.__stage.click(function (e) {
                if(e.button == 2)
                    __hideContextMenu();
            })
        },

        addNode: function(x, y, text, type, scale) {
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
                node.addEventListener('mouseup', function (e) {
                    __currentNode = this;
                    __showContextMenu(e);
                });
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

            this.__scene.add(node);
            return node;
        },

        addLink: function (nodeA, nodeZ) {
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

        addServiceRole: function(service) {
            var self = this;
            //暂时只有一个state
            var state = service.states[0];
            var event = state.Event;
            var eventCount = event.length;
            var scale = eventCount<=4?1:Math.pow(0.99,eventCount);
            var linkScale = (scale === 1)?1:(2-scale);
            var stateNode = this.addNode(window.event.layerX, window.event.layerY, service.ms_model.m_name, 'STATES', scale);
            stateNode.service = service;
            var inputCount = 0;
            var outputCount = 0;
            var controlCount = 0;
            for(var i=0;i<eventCount;i++){
                if(typeof event[i].ResponseParameter !== 'undefined'){
                    inputCount++;
                }
                else if(typeof event[i].DispatchParameter !== 'undefined'){
                    outputCount++;
                }
                else if(typeof event[i].ControlParameter !== 'undefined'){
                    controlCount++;
                }
            }
            var dx = __DATA_RADIUS*4*linkScale;
            var dy = __DATA_RADIUS*2*linkScale;
            var j = 0;
            for(var i=0;i<eventCount;i++){
                if(typeof event[i].DispatchParameter !== 'undefined'){
                    var nodeZ = this.addNode(null,null, event[i].$.name, 'OUTPUT', scale);
                    nodeZ.serviceNodeID = stateNode._id;
                    nodeZ.Event = event[i];
                    this.addLink(stateNode, nodeZ);
                }
                else {
                    var x = window.event.layerX - dx;
                    var y = window.event.layerY - ((inputCount + controlCount - 1) / 2 - j) * dy;
                    var type = null;
                    if(typeof event[i].ResponseParameter !== 'undefined'){
                        type = 'INPUT';
                    }
                    else if(typeof event[i].ControlParameter !== 'undefined'){
                        type = 'OUTPUT';
                    }
                    var nodeA = this.addNode(x, y, event[i].$.name, type, scale);
                    nodeA.serviceNodeID = stateNode._id;
                    nodeA.Event = event[i];
                    this.addLink(nodeA, stateNode);
                    j++;

                    // TODO 右键菜单
                    $('#contextMenu li:eq(0)').click(function () {
                        var serviceInfo = {
                            service
                        };
                    })
                }
            }
            JTopo.layout.layoutNode(this.__scene, stateNode, true);
            //布局跟随移动
            this.__scene.addEventListener('mouseup', function(e){
                if(e.target && e.target.layout){
                    JTopo.layout.layoutNode(self.__scene, e.target, true);
                }
            });
        },

        delServiceRole: function (service) {

        }


    };
})();

module.exports = CanvasJS;