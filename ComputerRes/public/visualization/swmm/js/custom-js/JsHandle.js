//add String method : endwith,startWith, trim
String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
    return true;
}
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.ltrim = function () {
    return this.replace(/(^\s*)/g, "");
}
String.prototype.rtrim = function () {
    return this.replace(/(\s*$)/g, "");
}

//udx schema to tree
function schema_to_tree(_UdxSchemaDataset, _tree_id) {




    //在没有添加节点的时候，直接改根节点的名字无法更新（未找到相关方法），故这里先更新名字，再添加一个空的节点，后面删除。
    var m_nodes1 = $("#" + _tree_id).treeview('findNodes', ['0.0', 'nodeId']);
    m_nodes1[0].text = _UdxSchemaDataset.getNodeName();
    $('#' + _tree_id).treeview('addNode', [{ 'nodes': undefined, 'text': '_' }, m_nodes1[0], 0, { silent: true }]);

    //保留根节点
    var m_nodes = $("#" + _tree_id).treeview('findNodes', ['0.0', 'nodeId']);
    if (m_nodes !== undefined && m_nodes.length > 1) {
        var count = m_nodes.length;
        for (var j = 1; j < count; j++) {
            var _currentId = m_nodes[j].nodeId;
            var child_node = $("#" + _tree_id).treeview('findNodes', [_currentId, 'nodeId']);
            $("#" + _tree_id).treeview('removeNode', [child_node, { silent: true }]);
        }

    }

    //update schema root Name and description
    m_nodes[0].text = _UdxSchemaDataset.getNodeName();
    var ChildCount = _UdxSchemaDataset.getChildNodeCount();
    for (var k = 0; k < ChildCount; k++) {
        var rootNode = _UdxSchemaDataset.getChildNode(k); //获取Dataset的根节点
        TreeWalk(rootNode, m_nodes, _tree_id, k);
    }




    //private method
    function TreeWalk(_UdxSchemaNode, _parent_node, _tree_id, index) {
        //sub
        var _name = _UdxSchemaNode.getNodeName();
        if (_name === undefined || _name === "") {
            _name = "SchemaDataset";
        }
        var new_node = {};
        new_node.nodes = undefined;
        new_node.text = _name;
        $('#' + _tree_id).treeview('addNode', [new_node, _parent_node, index, { silent: true }]);

        var count = _UdxSchemaNode.getChildNodeCount();
        for (var i = 0; i < count; i++) {

            var ChildNode = _UdxSchemaNode.getChildNode(i);
            //console.log(_UdxSchemaNode.getNodeName());
            TreeWalk(ChildNode, new_node, _tree_id);
        }
    }


}

//find schema node
function find_schema_node(_UdxSchemaDataset, _NodeName) {

    var rslt = undefined;
    if (_UdxSchemaDataset.getNodeName() === _NodeName) {
        rslt = _UdxSchemaDataset;
    } else {
        var ChildCount = _UdxSchemaDataset.getChildNodeCount();
        for (var i = 0; i < ChildCount; i++) {
            var ChildNode = _UdxSchemaDataset.getChildNode(i); //获取Dataset的根节点
            if ((rslt = treewalk(ChildNode, _NodeName)) !== undefined) {
                return rslt;
            }
        }


    }

    return rslt;

    function treewalk(_udxSchemaDataset, _NodeName) {
        if (_udxSchemaDataset === undefined) return undefined;

        var currentName = _udxSchemaDataset.getNodeName();
        // console.log(currentName);
        if (_NodeName === currentName) {
            return _udxSchemaDataset;
        }
        var count = _udxSchemaDataset.getChildNodeCount();
        for (var i = 0; i < count; i++) {
            var find_node = undefined;
            if ((find_node = treewalk(_udxSchemaDataset.getChildNode(i), _NodeName)) !== null) {
                if (find_node !== undefined) {
                    return find_node;
                }
            }
        }
    }
}

//udx data to tree
function udx_data_to_tree(_UdxDataset, _tree_id) {

    //在没有添加节点的时候，直接改根节点的名字无法更新（未找到相关方法），故这里先更新名字，再添加一个空的节点，后面删除。
    var m_nodes1 = $("#" + _tree_id).treeview('findNodes', ['0.0', 'nodeId']);
    //m_nodes1[0].text = _UdxDataset.getName();
    $('#' + _tree_id).treeview('addNode', [{ 'nodes': undefined, 'text': '_' }, m_nodes1[0], 0, { silent: true }]);



    // var m_nodes = $("#" + _tree_id).treeview('findNodes', ['0.0', 'nodeId']);
    // if (m_nodes !== undefined && m_nodes.length > 1) {
    //     var count = m_nodes.length;
    //     for (var j = 1; j < count; j++) {
    //         var _currentId = m_nodes[j].nodeId;
    //         var child_node = $("#" + _tree_id).treeview('findNodes', [_currentId, 'nodeId']);
    //         $("#" + _tree_id).treeview('removeNode', [child_node, { silent: true }]);
    //     }
    // }

    // //update schema root Name and description
    // // m_nodes[0].text = _UdxDataset.getName();

    // var ChildCount = _UdxDataset.getChildNodeCount();
    // for (var k = 0; k < ChildCount; k++) {
    //     var rootNode = _UdxDataset.getChildNode(k); //获取Dataset的根节点
    //     TreeWalk(rootNode, m_nodes, _tree_id, k);
    // }




    // //private method
    // function TreeWalk(_UdxDTNode, _parent_node, _tree_id, index) {
    //     //sub
    //     var _name = _UdxDTNode.getName();
    //     if (_name === undefined || _name === "") {
    //         _name = "UDXNode";
    //     }
    //     var new_node = {};
    //     new_node.nodes = undefined;
    //     new_node.text = _name;
    //     $('#' + _tree_id).treeview('addNode', [new_node, _parent_node, index, { silent: true }]);

    //     var count = _UdxDTNode.getChildNodeCount();
    //     for (var i = 0; i < count; i++) {

    //         var ChildNode = _UdxDTNode.getChildNode(i);
    //         //console.log(_UdxDTNode.getName());
    //         TreeWalk(ChildNode, new_node, _tree_id);
    //     }
    // }

}

//udx data to tree
function udx_data_to_tree_data(_UdxDataset) {

    function m_Node(text) {
        this.text = text;
        this.nodes = new Array();
    }
    m_Node.prototype.addNodes = function (_node) {
        this.nodes.push(_node);
    }


    var tree = new Array();
    var rootNode = new m_Node(_UdxDataset.getName());
    tree.push(rootNode);
    //update schema root Name and description
    // m_nodes[0].text = _UdxDataset.getName();

    var ChildCount = _UdxDataset.getChildNodeCount();
    for (var k = 0; k < ChildCount; k++) {

        var rootDTNode = _UdxDataset.getChildNode(k); //获取Dataset的根节点
        TreeWalk(rootDTNode, rootNode, k);

    }

    return tree;



    //private method
    function TreeWalk(_UdxDTNode, _parent_node, index) {
        //sub
        var _name = _UdxDTNode.getName();
        if (_name === undefined || _name === "") {
            _name = "UDXNode";
        }

        var new_node = new m_Node(_name);
        _parent_node.addNodes(new_node);

        var count = _UdxDTNode.getChildNodeCount();
        for (var i = 0; i < count; i++) {
            var ChildNode = _UdxDTNode.getChildNode(i);
            //console.log(_UdxDTNode.getName());
            TreeWalk(ChildNode, new_node, i);

        }
    }




}

//udx schema to tree
function udx_Schema_to_tree_data(_UdxSchemaDataset) {
    function m_Node(text) {
        this.text = text;
        this.nodes = new Array();
    }
    m_Node.prototype.addNodes = function (_node) {
        this.nodes.push(_node);
    }


    var tree = new Array();
    var rootNode = new m_Node(_UdxSchemaDataset.getNodeName());
    tree.push(rootNode);
    //update schema root Name and description
    // m_nodes[0].text = _UdxDataset.getName();

    var ChildCount = _UdxSchemaDataset.getChildNodeCount();
    for (var k = 0; k < ChildCount; k++) {

        var rootDTNode = _UdxSchemaDataset.getChildNode(k); //获取Dataset的根节点
        TreeWalk(rootDTNode, rootNode, k);

    }

    return tree;



    //private method
    function TreeWalk(_UdxSNode, _parent_node, index) {
        //sub
        var _name = _UdxSNode.getNodeName();
        if (_name === undefined || _name === "") {
            _name = "UDXNode";
        }

        var new_node = new m_Node(_name);
        _parent_node.addNodes(new_node);

        var count = _UdxSNode.getChildNodeCount();
        for (var i = 0; i < count; i++) {
            var ChildNode = _UdxSNode.getChildNode(i);
            //console.log(_UdxDTNode.getName());
            TreeWalk(ChildNode, new_node, i);

        }
    }



}

//find udx node
function find_udx_data_node(_UdxDataset, _tree_node) {
    var rslt = undefined;

    if (_UdxDataset === undefined || _tree_node === undefined) {
        return rslt;
    }
    if (_tree_node.nodeId === '0.0') {
        return _UdxDataset;
    }
    var m_nodeId = _tree_node.nodeId;
    // var m_nodeId = '0.0.0.0';
    m_nodeId = m_nodeId.substring(4, m_nodeId.length);
    var indexArray = m_nodeId.split('.');
    var m_ChildNode = _UdxDataset;
    for (var i = 0; i < indexArray.length; i++) {
        var currentIndex = parseInt(indexArray[i]);

        if (m_ChildNode === undefined) {
            return rslt;
        }
        var currentNodeCount = m_ChildNode.getChildNodeCount();
        if (currentNodeCount === 0 || (currentIndex + 1 > currentNodeCount)) {
            return undefined;
        }
        m_ChildNode = m_ChildNode.getChildNode(currentIndex);
        // var a = m_ChildNode.getName();
        // console.log(a);

        if (i === indexArray.length - 1) {
            return m_ChildNode;
        }

    }
    return undefined;
}

//delete data by index
function array_delete_by_index(_array, _index) {
    if (_array === undefined || _index < 0 || _index >= _array.length) {
        return undefined;
    }
    var rslt = new Array();
    for (var i = 0; i < _array.length; i++) {
        if (_index !== i) {
            rslt.push(_array[i]);
        } else {
            continue;
        }
    }
    return rslt;
}

//update tree
function update_tree(_treeId, _text, _oldNode) {
    if (_text !== undefined && _text !== '') {
        var m_nodes = $('#' + _treeId).treeview('getNodes', '0.0');
        for (var i = 0; i < m_nodes.length; i++) {
            if (m_nodes[i]['nodeId'] === currentTreeNode['nodeId']) {
                var new_node = {
                    text: _text,
                    state: {
                        selected: true
                    }
                }
                $('#tree').treeview('updateNode', [m_nodes[i], new_node, { silent: true }]);
            }
        }
    }
}

//add node
function add_node(_treeId, _text, _parent_node) {
    if (_text !== undefined && _text !== "" && _parent_node !== undefined) {

        var new_node = {};
        new_node.nodes = undefined;
        new_node.text = _text;
        var m_nodeId = 0;
        _parent_node = $("#" + _treeId).treeview('findNodes', [_parent_node['nodeId'], 'nodeId']);
        m_nodeId = _parent_node.length;
        $('#' + _treeId).treeview('addNode', [new_node, _parent_node, parseInt(m_nodeId), { silent: true }]);



    }
}

//remove node
function remove_tree_node(_treeId, _remove_tree_node) {
    $('#' + _treeId).treeview('removeNode', [_remove_tree_node, { silent: true }]);
}

//addtional json to tree data
function addtional_desc_data_to_tree_data(_addtional_json) {
    function m_Node(text) {
        this.text = text;
        this.nodes = new Array();
    }
    m_Node.prototype.addNodes = function (_node) {
        this.nodes.push(_node);
    }

    if (_addtional_json !== undefined) {
        var tree = new Array();
        var desc_array = undefined;
        for (var Key in _addtional_json) {
            if (_addtional_json[Key] instanceof Array) {
                desc_array = _addtional_json[Key];
                break;
            }
        }
        if (desc_array != undefined) {
            for (var i = 0; i < desc_array.length; i++) {

                var newNode = new m_Node('_');

                for (var m_key in desc_array[i]) {
                    newNode[m_key] = desc_array[i][m_key];
                    if (m_key.endWith('name') && m_key !== "user_name") {
                        newNode.text = desc_array[i][m_key];
                    }
                }
                tree.push(newNode);
            }
            return tree;
        }

    }




}

//UDX Schema to Udx data
function schema_to_udx(_UdxSchemaDataset, _UdxDataset) {


    var ChildCount = _UdxSchemaDataset.getChildNodeCount();
    for (var k = 0; k < ChildCount; k++) {

        var rootSNode = _UdxSchemaDataset.getChildNode(k); //获取Dataset的根节点
        if (!TreeWalk(rootSNode, _UdxDataset, k)) {
            return false;
        }

    }

    return true;

    //private method
    function TreeWalk(_UdxSNode, _parentDTNode, index) {
        var NewNode = schemaNode_to_udxNode(_UdxSNode, _parentDTNode);
        if (NewNode !== undefined) {
            var count = _UdxSNode.getChildNodeCount();
            for (var i = 0; i < count; i++) {
                var ChildNode = _UdxSNode.getChildNode(i);
                TreeWalk(ChildNode, NewNode, i);
            }
        } else {
            return false;
        }
        return true;
    }

}

//schema to udx
function schemaNode_to_udxNode(_UdxSchemaNode, _parentUdxNode) {
    var NewNode = undefined;
    var _Name = _UdxSchemaNode.getNodeName();
    var _Type = _UdxSchemaNode.getNodeType();

    switch (_Type) {
        case Module.SchemaNodeType.EDTKT_INT:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_INT);
            break;
        case Module.SchemaNodeType.EDTKT_REAL:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_REAL);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR2:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR2);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR3:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR3);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR4:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR4);
            break;
        case Module.SchemaNodeType.EDTKT_STRING:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_STRING);
            break;
        case Module.SchemaNodeType.EDTKT_INT_LIST: RsltStr
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_INT_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_REAL_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_REAL_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR2_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR2_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR3_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR3_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_VECTOR4_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_VECTOR4_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_STRING_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_STRING_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_NODE:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_NODE);
            break;
        case Module.SchemaNodeType.EDTKT_LIST:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_LIST);
            break;
        case Module.SchemaNodeType.EDTKT_MAP:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_MAP);
            break;
        case Module.SchemaNodeType.EDTKT_TABLE:
            NewNode = _parentUdxNode.addChildNode(_Name, EKernelType.EKT_TABLE);
            break;
        default:
            break;
    }
    return NewNode;
}

//get array from list data(int_listr、real_list)
function list_data_to_array(_udxNode) {
    var rslt = new Array();

    if (_udxNode === undefined) {
        return [];
    }
    if (_udxNode.getKernel().getType() === EKernelType.EKT_INT_LIST) {

        for (var i = 0; i < _udxNode.getKernel().getArrayCount(); i++) {
            rslt.push(_udxNode.getKernel().getTypedValueByIndex(i));
        }

    } else if (_udxNode.getKernel().getType() === EKernelType.EKT_REAL_LIST) {
        for (var i = 0; i < _udxNode.getKernel().getArrayCount(); i++) {
            rslt.push(_udxNode.getKernel().getTypedValueByIndex(i));
        }
    }
    return rslt;

}