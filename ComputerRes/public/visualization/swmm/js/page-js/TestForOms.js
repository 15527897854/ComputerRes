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
                data_after_delete = array_delete_by_index(current_all_data, selected_row_index);
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
        var json = { dataX: [], dataY: [] };

        var bodyNode = udxDataset.getChildNode(0);
        for (var i = 0; i < bodyNode.getChildNodeCount(); i++) {
            var tempBodyNode = bodyNode.getChildNode(i);
            var tempBodyNodeType = tempBodyNode.getKernel().getType();
            var tempBodyNodeTypevalue = tempBodyNodeType.value;
            if (tempBodyNodeTypevalue == "256") {
                var tempdatavalue = tempBodyNode.getChildNode(0).getChildNode(0).getName();
                if (dataNameArray[0].trim() == tempdatavalue.trim()) {
                    for (var t = 0; t < dataNameArray.length; t++) {
                        var row1 = {};
                        var tempArray = [];
                        if (dataNameArray[t].trim() == tempBodyNode.getChildNode(0).getChildNode(0).getName().trim()) {
                            for (var j = 0; j < tempBodyNode.getChildNodeCount(); j++) {
                                var valueIndexNode = tempBodyNode.getChildNode(j);
                                var xValueNode = valueIndexNode.getChildNode(0);
                                var valueNodedata = xValueNode.getKernel().getTypedValue();
                                tempArray.push(valueNodedata);
                            }
                            row1.name = dataNameArray[t];
                            row1.value = tempArray;
                            json.dataX.push(row1);
                        } else {
                            for (var j = 0; j < tempBodyNode.getChildNodeCount(); j++) {
                                var valueIndexNode = tempBodyNode.getChildNode(j);
                                for (var k = 0; k < valueIndexNode.getChildNodeCount(); k++) {
                                    var valueNode = valueIndexNode.getChildNode(k);
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
                    //如果执行了该语句，说明了已经找到该List结构，则后面不需要在遍历了
                    break;
                } else {

                    continue;
                }
            }

            else {
                continue;
            }
        }

        //console.log(JSON.stringify(json));
        sessionStorage.setItem("TempData", JSON.stringify(json));
        if (dataNameArray.length <= 1) {
            toastr.warning("you must choose at least two type.", 'Waring', { timeOut: 3000 });
            return false;
        } else {
            window.open('pages/TestLineChartExample.html');
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
    // udxDataset = new UdxDataset();
    // udxDataset.createDataset();
    // udxDataset.loadFromXmlStream('<dataset>' +
    //     '<XDO name="SWMMRptUdxData" kernelType="any">' +
    //     '<XDO name="TITLE" kernelType="any">' +
    //     '<XDO name="Title Version" kernelType="string" value="  EPA STORM WATER MANAGEMENT MODEL - VERSION 5.1 (Build 5.1.007)" />' +
    //     '<XDO name="Title Title and Warning" kernelType="string" value="  INP file created on 2017/6/10 18:21:57 by nnuxd with inpPINS version 0.0.3.0 &#xA;  Title/Notes: " />' +
    //     '<XDO name="Title Notes" kernelType="string" value="  NOTE: The summary statistics displayed in this report are&#xA;  based on results found at every computational time step,  &#xA;  not just on results from each reporting time step." />' +
    //     '</XDO>' +
    //     '<XDO name="Routing Time Step Summary" kernelType="list">' +
    //     '<XDO name="RTSS Minimum Time Step Node" kernelType="any">' +
    //     '<XDO name="RTSS Minimum Time Step Value" kernelType="real" value="15" />' +
    //     '<XDO name="RTSS Minimum Time Step Unit" kernelType="string" value="sec" />' +
    //     '</XDO>' +
    //     '<XDO name="RTSS Average Time Step Node" kernelType="any">' +
    //     '<XDO name="RTSS Average Time Step Value" kernelType="real" value="15" />' +
    //     '<XDO name="RTSS Average Time Step Unit" kernelType="string" value="sec" />' +
    //     '</XDO>' +
    //     '<XDO name="RTSS Maximum Time Step Node" kernelType="any">' +
    //     '<XDO name="RTSS Maximum Time Step Value" kernelType="real" value="15" />' +
    //     '<XDO name="RTSS Maximum Time Step Unit" kernelType="string" value="sec" />' +
    //     '</XDO>' +
    //     '<XDO name="RTSS Percent in Steady State" kernelType="real" value="0" />' +
    //     '<XDO name="RTSS Average Iterations per Step" kernelType="real" value="1.60000002384186" />' +
    //     '<XDO name="RTSS Percent Not Converging" kernelType="real" value="0" />' +
    //     '</XDO>' +
    //     '<XDO name="Subcatchment Runoff Summary" kernelType="list">' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub0" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="11.2399997711182" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="8.21000003814697" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0.00999999977648258" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="4.34000015258789" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.407999992370605" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub1" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="14.8400001525879" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="4.86999988555908" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="2.5" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.243000000715256" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub2" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="5.92000007629395" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="13.1400003433228" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="3.09999990463257" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.653999984264374" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub3" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="18.6299991607666" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="2.94000005722046" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.926999986171722" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub4" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="18.6100006103516" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="1.02999997138977" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.925999999046326" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub5" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="8.35999965667725" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="10.8900003433228" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="1.5" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.541999995708466" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub6" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="18.6200008392334" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="0.829999983310699" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.926999986171722" />' +
    //     '</XDO>' +
    //     '<XDO name="SRS Node" kernelType="any">' +
    //     '<XDO name="SRS Subcatchment" kernelType="string" value="Sub7" />' +
    //     '<XDO name="SRS Total Precip" kernelType="real" value="20.0900001525879" />' +
    //     '<XDO name="SRS Total Runon" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Evap" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Total Infil" kernelType="real" value="0.00999999977648258" />' +
    //     '<XDO name="SRS Total Runoff(mm)" kernelType="real" value="18.6200008392334" />' +
    //     '<XDO name="SRS Total Runoff(ltr)" kernelType="real" value="0" />' +
    //     '<XDO name="SRS Peak Runoff" kernelType="real" value="0.889999985694885" />' +
    //     '<XDO name="SRS Runoff Coeff " kernelType="real" value="0.926999986171722" />' +
    //     '</XDO>' +
    //     '</XDO>' +
    //     '</XDO>' +
    //     '</dataset>');
    // var xml_str = udxDataset.formatToXmlStream();
    // $("#view-xml").text(xml_str);
    var filename = GetQueryString('filename1');
	$.get(filename, {}, function (data) {
		var udx_xml = (new XMLSerializer()).serializeToString(data);
		udxDataset = new UdxDataset();
		udxDataset.createDataset();
		udxDataset.loadFromXmlStream(udx_xml);
		
		var xml_str = udxDataset.formatToXmlStream();
		$("#view-xml").text(xml_str);
	
	});
}

function init_schema() {
    // udxSchema = new UdxSchemaDataset();
    // udxSchema.createDataset();
    // udxSchema.loadFromXmlStream('<UdxDeclaration>' +
    //     '<UdxNode>' +
    //     '<UdxNode name="Title" type="DTKT_ANY" description="Title of the RptData">' +
    //     '<UdxNode name="Title_Version" type="DTKT_STRING" description="Version description" />' +
    //     '<UdxNode name="Title_Title and Warning" type="DTKT_STRING" description="Title and Warning description" />' +
    //     '<UdxNode name="Title_Notes" type="DTKT_STRING" description="Notes description" />' +
    //     '</UdxNode>' +
    //     '<UdxNode name="Routing Time Step Summary" type="DTKT_LIST" description="Routing Time Step Summary">' +
    //     '<UdxNode name="RTSS Minimum Time Step Node" type="DTKT_ANY" description="One node of subcatchments">' +
    //     '<UdxNode name="RTSS Minimum Time Step Value" type="DTKT_REAL" description="RTSS Minimum Time Step Value" />' +
    //     '<UdxNode name="RTSS Minimum Time Step Unit" type="DTKT_STRING" description="RTSS Minimum Time Step Unit" />' +
    //     '</UdxNode>' +
    //     '</UdxNode>' +
    //     '<UdxNode name="Subcatchment Runoff Summary" type="DTKT_LIST" description="Subcatchment Runoff Summary">' +
    //     '<UdxNode name="SRS Node" type="DTKT_ANY" description="SRS Node">' +
    //     '<UdxNode name="SRS Subcatchment" type="DTKT_STRING" description="SRS Subcatchment" />' +
    //     '<UdxNode name="SRS Total Precip" type="DTKT_REAL" description="SRS Total Precipa" />' +
    //     '<UdxNode name="SRS Total Runon" type="DTKT_REAL" description="SRS Total Runon" />' +
    //     '<UdxNode name="SRS Total Evap" type="DTKT_REAL" description="SRS Total Evap" />' +
    //     '<UdxNode name="SRS Total Infil" type="DTKT_REAL" description="SRS Total Infil" />' +
    //     '<UdxNode name="SRS Total Runoff(mm)" type="DTKT_REAL" description="SRS Total Runoff(mm)" />' +
    //     '<UdxNode name="SRS Total Runoff(ltr)" type="DTKT_REAL" description="SRS Total Runoff(ltr)" />' +
    //     '<UdxNode name="SRS Peak Runoff" type="DTKT_REAL" description="SRS Peak Runoff" />' +
    //     '<UdxNode name="SRS Runoff Coeff" type="DTKT_REAL" description="SRS Runoff Coeff" />' +
    //     '</UdxNode>' +
    //     '</UdxNode>' +
    //     '</UdxNode>' +
    //     '<SemanticAttachment>' +
    //     '<Concepts/>' +
    //     '<SpatialRefs/>' +
    //     '<Units/>' +
    //     '<DataTemplates/>' +
    //     '</SemanticAttachment>' +
    //     '</UdxDeclaration>');
    // init_dataset();
    // init_node_value_table();
    // init_tree();
    // bindClickEvent();
    var url = window.location.href;
    var subStr = url.substring(7, url.length);
    var sid = subStr.split('/')[2]
    var schemaname = 'schema.xml';
    var filename = '/visualization/schema?id=' + sid + '&schemaname=' + schemaname;
    $.get(filename, {}, function (data) {
        var schema_xml = data;
        udxSchema = new UdxSchemaDataset();
        udxSchema.createDataset();
        udxSchema.loadFromXmlStream(schema_xml);

        init_dataset();
        init_node_value_table();
        init_tree();
        bindClickEvent();
    });

}

$(function () {
    init();

});