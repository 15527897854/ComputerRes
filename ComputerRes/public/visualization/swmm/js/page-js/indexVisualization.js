var udxDataset;
var udxSchema;
var currentSNode;
var currentTreeNode;
var $NodeValueTable;
var current_cell_input = undefined;

//获取地址栏url参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function init() {
    init_schema();
}

function init_node_value_table() {
    $NodeValueTable = $('#node-value-table').bootstrapTable({
        'classes': 'table table-no-bordered',
        'showHeader': false,
        columns: [{
            field: 'x',
            title: 'X'
        }],
        data: []

    })
    //默认添加time数据作为可视化的x轴
    $NodeValueTable.bootstrapTable('append', [{
        'x': 'time',
        'X': "the time of data"
    }]);
}

function init_tree() {
    var mData = udx_Schema_to_tree_data(udxSchema);
    load_tree_data(mData);
}

function setInputValue(_name, _type, _description) {
    $("#node_name").val(_name);
    $("#node_type").val(_type);
    $("#current_node_value").val(_description);
}

function load_tree_data(_data) {
    $("#tree").treeview({
        data: _data,
        onNodeSelected: function (event, node) {
            currentTreeNode = node;
            var nodeText = node.text;
            var NodeType = undefined;
            if (nodeText !== undefined && nodeText !== "") {
                if ((currentSNode = find_schema_node(udxSchema, node.text)) !== undefined) {
                    var NodeName = currentSNode.getNodeName();
                    NodeType = currentSNode.getNodeType();
                    var NodeTypeStr = UDXSchemaType2String(NodeType);
                    var NodeDescription = currentSNode.getDescription();
                    var NodeDesc = NodeDescription.getNodeDescription();
                    setInputValue(NodeName, NodeTypeStr, NodeDesc);
                }
            }
        }
    });
}

function bindClickEvent() {
    var currentRowIndex = undefined;
    //node view table click event
    $NodeValueTable.on('click-row.bs.table', function (event, field, $element) {
        //remove all active
        $('#node-value-table tbody tr').each(function () {
            if ($(this).hasClass('m_active')) {
                $(this).removeClass('m_active');
            }
        })
        //active clicked row 
        currentRowIndex = $element[0].rowIndex - 1;
        $element.addClass('m_active');

    });

    $("#show-view").on("click", function () {
        //show schema 
        var xml_str = udxDataset.formatToXmlStream();
        $("#view-xml").text(xml_str);
    });

    $("#add-to-table").on("click", function () {
        var current_value = $("#current_node_value").val();
        var current_node_name = $("#node_name").val();
        if (current_value != "") {
            //Check whether the data is repeated
            var all_data = $NodeValueTable.bootstrapTable('getData');
            for (var i = 0; i < all_data.length; i++) {
                if (all_data[i]['x'] === current_node_name) {
                    return false;
                }
            }
            $NodeValueTable.bootstrapTable('append', [{
                'x': current_node_name,
                'X': current_value
            }]);
        }
    })

    $("#delete-row").on("click", function () {
        var current_all_data = $NodeValueTable.bootstrapTable('getData');
        var data_after_delete = current_all_data;
        if (current_all_data !== undefined && current_all_data.length > 0) {
            //get selected index of table
            var selected_row_index = get_select_row('node-value-table');
            if (selected_row_index !== undefined) {
                if (selected_row_index === 0) {
                    toastr.warning("This node can not be allowed to delete", 'Warning', { timeOut: 3000 });
                } else {
                    data_after_delete = array_delete_by_index(current_all_data, selected_row_index);
                }
            } else {
                data_after_delete.pop();
            }
            $NodeValueTable.bootstrapTable('load', data_after_delete);
        } else {
            toastr.warning("No nodes are selected, or no data to delete.", 'Warning', { timeOut: 3000 });
        }
    })

    //visualization-ensure click事件
    $("#visualization-ensure").on("click", function () {
        var dataNameArray = [];

        var allData = $NodeValueTable.bootstrapTable('getData');
        for (var i = 0; i < allData.length; i++) {
            dataNameArray.push(allData[i]['x']);
        }
        //根据Schema名字从Udx中抽出相对应的数据
        var json = { dataX: [], dataY: [] };
        var tempBodyNode = udxDataset.getChildNode(1);
        for (var t = 0; t < dataNameArray.length; t++) {
            var row1 = {};
            var tempArray = [];
            if (dataNameArray[t] === "time") {
                for (var i = 0; i < tempBodyNode.getChildNodeCount(); i++) {
                    //数据的首行必须是time数据
                    var valueIndexNode = tempBodyNode.getChildNode(i);
                    var timedataNode = valueIndexNode.getChildNode(0);
                    var valueNodedata = timedataNode.getKernel().getTypedValue();
                    tempArray.push(valueNodedata);
                }
                row1.name = dataNameArray[t];
                row1.value = tempArray;
                json.dataX.push(row1);

            } else {
                for (var i = 0; i < tempBodyNode.getChildNodeCount(); i++) {
                    var valueIndexNode = tempBodyNode.getChildNode(i);
                    for (var j = 0; j < valueIndexNode.getChildNodeCount(); j++) {
                        var valueNode = valueIndexNode.getChildNode(j);
                        var valueNodeName = valueNode.getName();
                        var valueNodedata = valueNode.getKernel().getTypedValue();
                        if (dataNameArray[t].trim() == valueNodeName.trim()) {
                            tempArray.push(valueNodedata);
                        }
                    }
                }
                row1.name = dataNameArray[t];
                row1.value = tempArray;
                json.dataY.push(row1);

            }
        }
        //console.log(JSON.stringify(json));
        sessionStorage.setItem("TempData", JSON.stringify(json));
        // //判断所选类别的个数，从而选定以哪种方式展示可视化效果
        // if (dataNameArray.length <= 4 && dataNameArray.length > 1) {
        //     window.open('OMSOtherLineChartExample.html');
        // } else if (dataNameArray.length > 4) {
        //     window.open('OmsLineChartExample.html');
        // } else {
        //     toastr.warning("you don't choose Y category.", 'Waring', { timeOut: 3000 });
        //     return false;
        // }


    })
    // visualization_type_modal click事件
    $("#visualization-confirm").on("click", function () {
        var image_id = getSelected();
        console.log(image_id);
        if (image_id == "img_Chart") {
            $("#visualization_type_modal").modal('hide');
            window.open('pages/OMSOtherLineChartExample.html');
        } else if (image_id == "img_LineChart") {
            $("#visualization_type_modal").modal('hide');
            window.open('pages/OmsLineChartExample.html');
        } else {
            toastr.warning("you must choose type.", 'Waring', { timeOut: 3000 });
            return false;
        }
    })

    //Delete
    $("#delete").on("click", function () {

        var mParentNode = currentDTNode.getParentNode();
        if (mParentNode !== undefined) {
            if (mParentNode.removeChildNode(currentDTNode) === true) {
                remove_tree_node('tree', currentTreeNode);
                currentDTNode = undefined;
                $NodeValueTable.bootstrapTable('removeAll');
                showColumn($NodeValueTable, 0);
            } else {
                toastr.error("Delete error.", 'Error', { timeOut: 3000 });
            }

        }

    });


}

function init_dataset() {
    udxDataset = new UdxDataset();
    udxDataset.createDataset();
    udxDataset.loadFromXmlStream('<dataset>' +
        '<XDO name="head" kernelType="any">' +
        '<XDO name="@T" kernelType="string" value=" output"/>' +
        '<XDO name="created_at" kernelType="string" value=" &quot;Sun Apr 16 21:56:12 CST 2017&quot;"/>' +
        '<XDO name="date_format" kernelType="string" value=" yyyy-MM-dd hh:mm:ss"/>' +
        '<XDO name="@H" kernelType="string" value=" time, BioNAct, zrootd, BioAct, FPHUact, nstrs, wstrs, tstrs, nmin, NYield, BioYield, Addresidue_pooln, Addresidue_pool, cropid, gift"/>' +
        '<XDO name="Type" kernelType="string" value=" Date, Double, Double, Double, Double, Double, Double, Double, Double, Double, Double, Double, Double, Double, Double"/>' +
        '</XDO>' +
        '<XDO name="body" kernelType="list">' +
        '<XDO name="1" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-01 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="3.7378279999999999"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="2" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-02 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="3.8158020000000001"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="3" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-03 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="3.898155"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="4" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-04 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="3.9837050000000001"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="5" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-05 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="4.138223"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="6" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-06 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="4.2240539999999998"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '<XDO name="7" kernelType="any">' +
        '<XDO name=" time" kernelType="string" value="1990-01-07 12:00:00"/>' +
        '<XDO name=" BioNAct" kernelType="real" value="0"/>' +
        '<XDO name=" zrootd" kernelType="real" value="1.018524"/>' +
        '<XDO name=" BioAct" kernelType="real" value="0"/>' +
        '<XDO name=" FPHUact" kernelType="real" value="0"/>' +
        '<XDO name=" nstrs" kernelType="real" value="0.024912"/>' +
        '<XDO name=" nmin" kernelType="real" value="4.3103350000000002"/>' +
        '<XDO name=" gift" kernelType="real" value="0"/>' +
        '</XDO>' +
        '</XDO>' +
        '</dataset>');
    // var filename = GetQueryString('filename1');
    // $.get(filename, {}, function (data) {
    // 	var udx_xml = (new XMLSerializer()).serializeToString(data);
    // 	udxDataset = new UdxDataset();
    // 	udxDataset.createDataset();
    // 	udxDataset.loadFromXmlStream(udx_xml);

    // 	var xml_str = udxDataset.formatToXmlStream();
    // 	$("#view-xml").text(xml_str);

    // });

    var xml_str = udxDataset.formatToXmlStream();
    $("#view-xml").text(xml_str);
}

function init_schema() {

    udxSchema = new UdxSchemaDataset();
    udxSchema.createDataset();
    udxSchema.loadFromXmlStream('<UdxDeclaration name="Catchment_Crop_Growth" description="Catchment_Crop_Growth Output Data">' +
        '<UdxNode>' +
        '<UdxNode name="head" type="DTKT_ANY" description="the head of data">' +
        '<UdxNode name="@T" type="DTKT_STRING" description="the type of data"/>' +
        '<UdxNode name="created_at" type="DTKT_STRING" description="the time of data created"/>' +
        '<UdxNode name="date_format" type="DTKT_STRING" description="format for day/month/year representation"/>' +
        '<UdxNode name="@H" type="DTKT_STRING" description="headline of output data"/>' +
        '<UdxNode name="Type" type="DTKT_STRING" description="the type list of output data"/>' +
        '</UdxNode>' +
        '<UdxNode name="body" type="DTKT_LIST" description="the body of data">' +
        '<UdxNode name="valueindex" type="DTKT_ANY" description="the line index of data">' +
        '<UdxNode name="time" type="DTKT_STRING" description="the time of data"/>' +
        '<UdxNode name="BioNAct" type="DTKT_REAL" description="Actual nitrogen content in Biomass"/>' +
        '<UdxNode name="zrootd" type="DTKT_REAL" description="Actual depth of roots"/>' +
        '<UdxNode name="BioAct" type="DTKT_REAL" description="Biomass sum produced for a given day drymass"/>' +
        '<UdxNode name="nmin" type="DTKT_REAL" description="Mineral nitrogen content in the soil profile down to 60 cm depth"/>' +
        '<UdxNode name="gift" type="DTKT_REAL" description="Number of fertilisation action in crop"/>' +
        '</UdxNode>' +
        '</UdxNode>' +
        '</UdxNode>' +
        '<SemanticAttachment>' +
        '<Concepts/>' +
        '<SpatialRefs/>' +
        '<Units/>' +
        '<DataTemplates/>' +
        '</SemanticAttachment>' +
        '</UdxDeclaration>');
    // var url = window.location.href;
    // var subStr = url.substring(7, url.length);
    // var sid = subStr.split('/')[2]
    // var schemaname = 'schema.xml';
    // var filename = '/visualization/schema?id=' + sid + '&schemaname=' + schemaname;
    // $.get(filename, {}, function (data) {
    //     var schema_xml = data;
    //     udxSchema = new UdxSchemaDataset();
    //     udxSchema.createDataset();
    //     udxSchema.loadFromXmlStream(schema_xml);

    //     init_dataset();
    //     init_node_value_table();
    //     init_tree();
    //     bindClickEvent();
    // });



    init_dataset();
    init_node_value_table();
    init_tree();
    bindClickEvent();

}

$(function () {
    init();

});