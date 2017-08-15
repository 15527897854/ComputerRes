const m_fs = require("fs");
const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;

var udxSchemaDataset;
var currentSchemaNode;
var currentTreeNode;
var currentUnitId = undefined;
var currentConceptId = undefined;
var currentSpatialRefId = undefined;
var DataTemplateId = undefined;

var HasUpdate = false;
var ClickedNav = undefined;


function init() {

    bindContextMenu("tree", "contextMenu");
    catchMainProcessMessage();
    bindClickEvent();
    init_dataset();
    init_tree();




}

function init_tree() {

    var TempSchema = window.sessionStorage.getItem('SCHEMA');
    if (TempSchema !== undefined && TempSchema !== null) {
        udxSchemaDataset.loadFromXmlStream(TempSchema);
        var data = udx_Schema_to_tree_data(udxSchemaDataset);
        load_tree_data(data);
    } else {
        load_tree_data(getTree());
    }


    var xml_str = udxSchemaDataset.formatToXmlStream();
    $("#view-xml").text(xml_str);
}

function load_tree_data(_data) {
    $('#tree').treeview({
        data: _data,
        onNodeSelected: function (event, node) {

            //show info of selected node.
            currentTreeNode = node;
            var NodeName = node.text;
            var SchemaNode = undefined;
            if ((SchemaNode = find_schema_node(udxSchemaDataset, NodeName)) !== undefined) {
                currentSchemaNode = SchemaNode;

                setInputValue(SchemaNode);
            }
        }
    });
}

function load_addtional_data_tree(_treeId, _data) {
    $('#' + _treeId).treeview({
        data: _data,
        onNodeSelected: function (event, node) {

            //show info of selected node.

            var UnitName = node.unit_name;

            var ConceptName = node.concept_name;


            var SpatialRefName = node.SR_name;



            if (UnitName !== undefined) {
                getAddtionalDesc(AdditionalDescType.UNIT_DIMENSION, node.unit_id, function (data) {
                    var UnitName = data.detailInfo.enName;
                    var UnitDescription = data.detailInfo.enDescription;
                    if (UnitName != undefined) {
                        $("#UnitsName").val(UnitName);
                    }
                    if (UnitDescription != undefined) {
                        $("#UnitsDescription").val(UnitDescription);
                    }
                    $('#additional_desc_unit_modal button[name=AdditionalClose]')[0].click();
                    currentUnitId = node.unit_id;
                })


            } else if (ConceptName !== undefined) {
                getAddtionalDesc(AdditionalDescType.CONCEPT, node.concept_Id, function (data) {
                    var ConceptName = data.detailInfo.enName;
                    var ConceptDescription = data.detailInfo.enDescription;
                    if (ConceptName != undefined) {
                        $("#ConceptName").val(ConceptName);
                    }
                    if (ConceptDescription != undefined) {
                        $("#ConceptDescription").val(ConceptDescription);
                    }
                    $('#additional_desc_concept_modal button[name=AdditionalClose]')[0].click();
                    currentConceptId = node.concept_Id;
                });

            } else if (SpatialRefName !== undefined) {
                getAddtionalDesc(AdditionalDescType.SPATIALREF, node.SR_id, function (data) {
                    var SR_name = data.sr_name_en;
                    var SR_type = data.sr_type;
                    if (SR_name !== undefined) {
                        $("#SpatialRefName").val(SR_name);
                    }
                    if (SR_type !== undefined) {
                        $("#SpatialRefType").val(SR_type);
                    }
                    $('#additional_desc_spatialRef_modal button[name=AdditionalClose]')[0].click();
                    currentSpatialRefId = node.SR_id;
                });

            }




        }
    });
}

function setInputValue(_SchemaNode) {

    var NodeName = _SchemaNode.getNodeName();
    var NodeType = _SchemaNode.getNodeType();
    var NodeDescription = _SchemaNode.getDescription().getNodeDescription();
    var NodeTypeStr = UDXSchemaType2String(NodeType);
    var UnitId = _SchemaNode.getDescription().getNodeUnitInfo();
    var ConceptId = _SchemaNode.getDescription().getNodeConceptInfo();
    var SpatialRefId = _SchemaNode.getDescription().getNodeSpatialRefInfo();
    var DataTemplateId = _SchemaNode.getDescription().getNodeDataTemplateInfo();

    if (UnitId !== undefined && UnitId !== "") {
        currentUnitId = UnitId;
        getAddtionalDesc(AdditionalDescType.UNIT_DIMENSION, UnitId, function (data) {
            var UnitName = data.detailInfo.enName;
            var UnitDescription = data.detailInfo.enDescription;
            if (UnitName != undefined) {
                $("#UnitsName").val(UnitName);
            }
            if (UnitDescription != undefined) {
                $("#UnitsDescription").val(UnitDescription);
            }
        });
    } else {
        $("#UnitsName").val("");
        $("#UnitsDescription").val("");
    }

    if (ConceptId !== undefined && ConceptId !== "") {
        currentConceptId = ConceptId;
        getAddtionalDesc(AdditionalDescType.CONCEPT, ConceptId, function (data) {
            var ConceptName = data.detailInfo.enName;
            var ConceptDescription = data.detailInfo.enDescription;
            if (ConceptName != undefined) {
                $("#ConceptName").val(ConceptName);
            }
            if (ConceptDescription != undefined) {
                $("#ConceptDescription").val(ConceptDescription);
            }
        });
    } else {
        $("#ConceptName").val("");
        $("#ConceptDescription").val("");
    }

    if (SpatialRefId !== undefined && SpatialRefId !== "") {
        currentSpatialRefId = SpatialRefId;
        getAddtionalDesc(AdditionalDescType.SPATIALREF, SpatialRefId, function (data) {
            var SR_name = data.sr_name_en;
            var SR_type = data.sr_type;
            if (SR_name !== undefined) {
                $("#SpatialRefName").val(SR_name);
            }
            if (SR_type !== undefined) {
                $("#SpatialRefType").val(SR_type);
            }
        });
    } else {
        $("#SpatialRefName").val("");
        $("#SpatialRefType").val("");
    }

    $("#node_name").val(NodeName);
    $("#node_type").val(NodeTypeStr);
    $("#node_description").val(NodeDescription);

}

function getAddtionalDesc(_AdditionalDescType, _id, callback) {
    var rsltId = undefined;
    var data_url = undefined;
    if (_id !== undefined) {
        rsltId = encode64(_id);
        rsltId = encode64(rsltId);
    }


    var timeout = setTimeout(function () {
        toastr.error("Request timeout!Please check your network.", 'Error', { timeOut: 3000 });
        return false;
    },
        4000
    );

    switch (_AdditionalDescType) {
        case AdditionalDescType.UNIT_DIMENSION:

            data_url = AdditionalDescType.UNIT_DIMENSION.data['unit'];
            break;
        case AdditionalDescType.CONCEPT:

            data_url = AdditionalDescType.CONCEPT.data;
            break;
        case AdditionalDescType.SPATIALREF:

            data_url = AdditionalDescType.SPATIALREF.data;
            break;
        default:
            break;
    }
    if (data_url !== undefined || rsltId !== undefined) {
        $.post(data_url, { "uid": rsltId }, function (data) {
            if (timeout) { //清除定时器
                clearTimeout(timeout);
                timeout = null;
            }
            var JsonObject = JSON.parse(data);
            callback(JsonObject);
        });
    }
}

function init_dataset() {
    udxSchemaDataset = new UdxSchemaDataset();
    udxSchemaDataset.createDataset();

}


function catchMainProcessMessage() {
    //after choose schema file 
    ipc.on('openUdxSchemaFile-path', function (event, path) {
        if (!path) path = '';
        if (path !== "") {
            //load schema
            var m_path = path[0];
            m_fs.readFile(m_path, function (err, data) {
                if (err) {
                    toastr.error("Load file error.", 'Error', { timeOut: 3000 });
                    return console.log(err);
                }

                var ReadyData = data.toString();

                if (ReadyData.startsWith('<UdxDeclaration')) {
                    udxSchemaDataset.destroyDataset();
                    udxSchemaDataset.createDataset();
                    udxSchemaDataset.loadFromXmlStream(ReadyData);
                    var data = udx_Schema_to_tree_data(udxSchemaDataset);
                    load_tree_data(data);
                } else {
                    toastr.warning('This File is not UDX schema file.', 'Warning', { timeOut: 3000 });
                    return false;
                }



            });
        }
    })


    //saveUdxSchemaFile-dialog

    ipc.on('saveUdxSchemaFile-path', function (event, path) {
        if (!path) path = '';
        if (path !== "") {
            //save schema

            var m_schema = udxSchemaDataset.formatToXmlStream();

            m_fs.writeFile(path, m_schema, (err) => {
                if (err) {
                    toastr.info("Save File Error.", 'Error', { timeOut: 3000 });
                    return err;
                }
                toastr.info("The file has been saved.", 'Note', { timeOut: 3000 });
            });
        }
    })
    
    ipc.on('window-close',function(event){
        $("#close-window")[0].click();
    })
}


/********************************function   */


var AdditionalDescType = {
    UNIT_DIMENSION: {
        tree: 'http://222.192.7.74/GeoModeling/UnitAndDimensionRelationServlet',
        data: {
            unit: 'http://222.192.7.74/GeoModeling/unitServlet',
            dimension: 'http://222.192.7.74/GeoModeling/dimensionServlet'
        }
    },
    CONCEPT: {
        tree: 'http://222.192.7.74/GeoModeling/ConceptRelationServlet',
        data: "http://222.192.7.74/GeoModeling/conceptServlet"

    },
    SPATIALREF: {
        tree: 'http://222.192.7.74/GeoModeling/SpatialReferenceRelationServlet',
        data: 'http://222.192.7.74/GeoModeling/spatialReferenceServlet'
    }
}
function getFirstTreeIdAndType(_tree_id) {
    var rslt = {
        uid: undefined,
        type: undefined
    }
    $("#" + _tree_id + " ul li a").each(function () {
        var a = $(this);
        if (a[0]['attributes']['uid'] !== undefined) {
            rslt.uid = a[0]['attributes']['uid']['nodeValue'];
        }
        if (a[0]['attributes']['type'] !== undefined) {
            rslt.type = a[0]['attributes']['type']['nodeValue'];
        }
        return false;
    })
    return rslt;
}

function showDescriptionRightList(_data_url, _right_list_id, _uid, _page, _sortType) {
    //set timer
    var timeout = setTimeout(function () {
        toastr.error("Request timeout!Please check your network.", 'Error', { timeOut: 3000 });
        return false;
    },
        4000
    );

    $.get(_data_url, { uid: _uid, page: parseInt(_page), sortType: _sortType }, function (data) {
        if (timeout) { //清除定时器
            clearTimeout(timeout);
            timeout = null;
        }

        var json = JSON.parse(data);
        var tree_data = addtional_desc_data_to_tree_data(json);
        load_addtional_data_tree(_right_list_id, tree_data);
        load_pagination('page-nav', json['count'], 10, _page);

        //click to query
        $("#page-nav ul li a").on('click', function () {
            var activeIndex = getActiveItemIndex('page-nav');
            showDescriptionRightList(_data_url, _right_list_id, _uid, activeIndex, _sortType);
        })
    });
}

function showDescriptionLeftTree(_left_treeId, _right_listId, _AdditionalDescType) {
    //set timer
    var timeout = setTimeout(function () {
        toastr.error("Request timeout!Please check your network.", 'Error', { timeOut: 3000 });
        return false;
    },
        4000
    );

    var _left_tree_url = _AdditionalDescType['tree'];

    $.get(_left_tree_url, function (data, status) {

        if (timeout) { //清除定时器
            clearTimeout(timeout);
            timeout = null;
        }
        if (status === 'success') {
            $("#" + _left_treeId).html(data);
            treeViewReset(_left_treeId);

            //隐藏掉dimension tree
            if (_AdditionalDescType === AdditionalDescType.UNIT_DIMENSION) {
                var TreeLi = $("#unit_left_tree ul li .parent_li");
                $(TreeLi[1]).hide();
            }

            var first_item_data_url = undefined;
            var first_item = undefined;

            //根据类型分别绑定事件
            switch (_AdditionalDescType) {
                case AdditionalDescType.UNIT_DIMENSION:
                    //注册点击事件(更新表)
                    $("#" + _left_treeId + " ul li a").on('click', function () {
                        var m_type = $(this)[0]['attributes']['type']['nodeValue'];
                        var m_uid = $(this)[0]['attributes']['uid']['nodeValue'];
                        var _data_url = undefined;
                        if (m_type === undefined) {
                            _data_url = _AdditionalDescType['data'];

                        } else {
                            _data_url = _AdditionalDescType['data'][m_type];

                        }
                        showDescriptionRightList(_data_url, _right_listId, m_uid, 1, 'name');
                    });
                    //查询第一个
                    var first_item = getFirstTreeIdAndType(_left_treeId);

                    if (first_item.type === undefined) {
                        first_item_data_url = _AdditionalDescType['data'];
                    } else {
                        first_item_data_url = _AdditionalDescType['data'][first_item.type];
                    }
                    break;
                case AdditionalDescType.CONCEPT:
                    //注册点击事件(更新表)
                    $("#" + _left_treeId + " ul li a").on('click', function () {
                        var m_uid = $(this)[0]['attributes']['uid']['nodeValue'];
                        var _data_url = undefined;
                        _data_url = _AdditionalDescType['data'];
                        showDescriptionRightList(_data_url, _right_listId, m_uid, 1, 'name');
                    });
                    //查询第一个
                    first_item = getFirstTreeIdAndType(_left_treeId);

                    first_item_data_url = _AdditionalDescType['data'];



                    break;
                case AdditionalDescType.SPATIALREF:

                    //注册点击事件(更新表)
                    $("#" + _left_treeId + " ul li a").on('click', function () {
                        var m_uid = $(this)[0]['attributes']['uid']['nodeValue'];

                        _data_url = _AdditionalDescType['data'];

                        showDescriptionRightList(_data_url, _right_listId, m_uid, 1, 'name');
                    });
                    //查询第一个
                    first_item = getFirstTreeIdAndType(_left_treeId);

                    first_item_data_url = _AdditionalDescType['data'];

                    break;

                default:
                    break;
            }

            showDescriptionRightList(first_item_data_url, _right_listId, first_item.uid, 1, 'name');
        }

    });
}

function treeViewReset(treeId) {
    $("#" + treeId + ' li:has(ul)').addClass('parent_li');
    $("#" + treeId + ' li.parent_li > span i').on('click', function (e) {
        var children = $(this).parent('SPAN').parent('li.parent_li').find(' > ul > li');
        var siblingsLi = $(this).parent('SPAN').parent('li.parent_li').siblings();
        if (children.is(":visible")) {
            children.hide("fast");
            $(this).addClass("fa-caret-right").removeClass("fa-caret-down");
        } else {
            children.show("fast");
            $(this).addClass("fa-caret-down").removeClass("fa-caret-right");
            for (var i = 0; i < siblingsLi.length; i++) {
                var siblingsChildren = $(siblingsLi[i]).find(">ul>li");
                if (siblingsChildren.is(":visible")) {
                    siblingsChildren.hide("fast");
                    $(siblingsLi[i]).children("SPAN").find("i").addClass("fa-caret-right").removeClass("fa-caret-down");
                }
            }
        }
        e.stopPropagation();
    });
    //默认显示第一个分类
    var hideParents = $("#" + treeId + ' li.parent_li:not(:first-child) > span');
    var hideChildren = hideParents.parent('li.parent_li').find(' > ul > li');
    hideChildren.hide('fast');
    hideParents.find(' > i').addClass("fa-caret-right").removeClass("fa-caret-down");
}




/********************************function   */
function bindClickEvent() {


    //close window

    $("#continue-going").on('click',function(){
        ipc.send('close-window');
    });

    //nav click

    $("li[role='presentation'] a").on('click', function () {
        console.log();
        if (HasUpdate) {
            ClickedNav = this;
        } else {
            var NavType = $(this).attr('value');
            window.sessionStorage.setItem('SCHEMA', udxSchemaDataset.formatToXmlStream());
            if (NavType === 'MAPPING') {
                window.location.href = "./mapping.html";
            } else if (NavType === 'UDX') {
                window.location.href = "./udx-data.html";
            }
        }

    })

    $("#show-view").on('click', function () {
        //show schema 
        var xml_str = udxSchemaDataset.formatToXmlStream();
        $("#view-xml").text(xml_str);
    })

    $("#set-unit").on("click", function () {
        if (currentSchemaNode !== undefined) {
            var a = currentSchemaNode.getParentNode();
            if (currentSchemaNode.getParentNode() === undefined) {
                toastr.warning("Root node can not be set unit!", 'Warning', { timeOut: 3000 });
                return false;
            }
            showDescriptionLeftTree('unit_left_tree', 'unit_right_list', AdditionalDescType.UNIT_DIMENSION);
        } else {
            toastr.warning("No node to set unit!", 'Warning', { timeOut: 3000 });
            return false;
        }

    });

    $("#clear-unit").on("click", function () {
        if (currentSchemaNode !== undefined) {
            $("#UnitsName").val("");
            $("#UnitsDescription").val("");
            currentUnitId = undefined;
        }
    })

    $("#set-concept").on("click", function () {
        if (currentSchemaNode !== undefined) {
            if (currentSchemaNode.getParentNode() === undefined) {
                toastr.warning("Root node can not be set concept!", 'Warning', { timeOut: 3000 });
                return false;
            }
            showDescriptionLeftTree('concept_left_tree', 'concept_right_list', AdditionalDescType.CONCEPT);
        } else {
            toastr.warning("No node to set concept!", 'Warning', { timeOut: 3000 });
            return false;
        }
    });

    $("#clear-concept").on("click", function () {
        if (currentSchemaNode !== undefined) {

            $("#ConceptName").val("");
            $("#ConceptDescription").val("");
            currentConceptId = undefined;
        }
    })

    $("#set-spatial-ref").on("click", function () {
        if (currentSchemaNode !== undefined) {
            if (currentSchemaNode.getParentNode() === undefined) {
                toastr.warning("Root node can not be set spatial ref!", 'Warning', { timeOut: 3000 });
                return false;
            }
            showDescriptionLeftTree('spatialRef_left_tree', 'spatialRef_right_list', AdditionalDescType.SPATIALREF);
        } else {
            toastr.warning("No node to set spatial ref!", 'Warning', { timeOut: 3000 });
            return false;
        }
    });

    $("#clear-spatial-ref").on("click", function () {
        if (currentSchemaNode !== undefined) {
            $("#SpatialRefName").val("");
            $("#SpatialRefType").val("");
            currentSpatialRefId = undefined;
        }
    })


    $("#set-data-template").on("click", function () {
        toastr.warning("No data template to set!", 'Warning', { timeOut: 3000 });
        return false;
        // showDescriptionLeftTree('unit_left_tree', 'unit_right_list', AdditionalDescType.UNIT_DIMENSION);
    });


    //bind Enter key 

    $("#add_node_modal").bind('keypress', function (event) {
        if (event.keyCode == 13) {
            $('#add_node').click();
            return false;

        }

    });

    //bind Ctrl+s to save
    $("body").bind('keypress', function (event) {
        if (event.ctrlKey && (event.keyCode == 19)) {
            $("#save-change").click();
        }
    });

    $("#load-schema").on("click", function () {

        //load from file
        ipc.send('openUdxSchemaFile-dialog');
    })

    $("#save-change").on("click", function () {
        if (currentTreeNode !== undefined && currentSchemaNode !== undefined) {

            var m_node_name = $("#node_name").val();
            var m_node_description = $("#node_description").val();
            var m_node_concepts = $("#node_concepts").val();
            var m_node_spatialRefs = $("#node_spatialRefs").val();
            var m_node_units = $("#node_units").val();
            var m_node_dataTemplates = $("#node_dataTemplates").val();

            //update name and description
            if (m_node_name === '') {
                toastr.warning("Node name can not be null !", 'Warning', { timeOut: 3000 });
                return false;
            }
            if (m_node_name !== currentSchemaNode.getNodeName()) {
                if (find_schema_node(udxSchemaDataset, m_node_name) !== undefined) {
                    toastr.warning("This node with the same name is not allowed.", 'Warning', { timeOut: 3000 });
                    return false;
                }
                update_tree('tree', m_node_name, currentTreeNode);
            }
            currentSchemaNode.setNodeName(m_node_name);
            currentSchemaNode.getDescription().modifyNodeDescription(m_node_description);

            if (currentUnitId !== undefined) {

                currentSchemaNode.getDescription().modifyNodeUnitInfo(currentUnitId);

            } else {
                currentSchemaNode.getDescription().modifyNodeUnitInfo("");
            }
            if (currentConceptId !== undefined) {
                currentSchemaNode.getDescription().modifyNodeConceptInfo(currentConceptId);
            } else {
                currentSchemaNode.getDescription().modifyNodeConceptInfo("");
            }
            if (currentSpatialRefId !== undefined) {

                currentSchemaNode.getDescription().modifyNodeSpatialRefInfo(currentSpatialRefId);
            } else {
                currentSchemaNode.getDescription().modifyNodeSpatialRefInfo("");
            }

            // currentSchemaNode.getDescription().modifyNodeDataTemplateInfo(m_node_dataTemplates);



        }

    })


    $("#save-file").on("click", function () {
        //load from file
        ipc.send('saveUdxSchemaFile-dialog');
    })


    $('#add-sub').on('click', function () {
        if (currentSchemaNode !== undefined) {
            if (getNodeMaxRows(currentSchemaNode.getNodeType()) !== 0) {
                toastr.warning("This node does not allow child nodes to be added.", 'Warning', { timeOut: 3000 });
                return false;
            }
        }
    })

    $("#add_node").on('click', function () {
        var add_node_name = $("#add_node_name").val();
        var add_ndoe_type_str = $("#add_ndoe_type").val();
        var add_node_description = $("#add_node_description").val();

        if(add_node_name===""){
            toastr.warning("Node name cannot be null.", 'Warning', { timeOut: 3000 });
            return false;
        }
        if (find_schema_node(udxSchemaDataset, add_node_name) !== undefined) {
            toastr.warning("This node with the same name is not allowed.", 'Warning', { timeOut: 3000 });
            return false;
        }

        var add_ndoe_type = string2UDXSchemaType(add_ndoe_type_str);

        if (currentSchemaNode !== undefined && add_node_name !== "" && add_ndoe_type !== undefined) {
            // var name = currentSchemaNode.getNodeName();
            if (currentSchemaNode != undefined) {
                var addNode = currentSchemaNode.addChildNode(add_node_name, add_ndoe_type, add_node_description);
                if (addNode != undefined) {
                    add_node('tree', add_node_name, currentTreeNode);
                } else {
                    toastr.warning("This node does not allow more nodes to be added.", 'Warning', { timeOut: 3000 });
                }
            }
        }
    })

    //Delete
    $("#delete").on("click", function () {
        var selectedNode = $('#tree').treeview('getSelected')[0];

        // $('#tree').treeview('removeNode', [selectedNode, { silent: true }]);
        var mParentNode = currentSchemaNode.parentNode;
        if (mParentNode !== undefined) {
            if (mParentNode.removeChildNode(currentSchemaNode) === true) {
                remove_tree_node('tree', currentTreeNode);
                currentTreeNode = undefined;
                currentSchemaNode = undefined;

                $("#node_name").val('');
                $("#node_type").val('');
                $("#node_description").val('');

            } else {
                toastr.error("Delete error.", 'Error', { timeOut: 3000 });
            }
        }
    });
}

function getTree() {
    // Some logic to retrieve, or generate tree structure 
    var tree = [
        {
            text: "UdxDeclaration"
        }
    ];

    return tree;
}

$(function () {
    init();
    //sasa();
});