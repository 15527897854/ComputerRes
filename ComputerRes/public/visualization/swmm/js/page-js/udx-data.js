var udxDataset;
var currentDTNode;
var currentTreeNode;
var $NodeValueTable;
var current_cell_input = undefined;

function init() {

    bindContextMenu("tree1", "contextMenu");
    init_dataset();
    init_node_value_table();
    init_tree();
    bindClickEvent();



}

function init_tree() {

    var TempUDX = window.sessionStorage.getItem('UDX');
    var data = undefined;
    if (TempUDX !== undefined && TempUDX !== null) {
        udxDataset.loadFromXmlStream(TempUDX);
        data = udx_data_to_tree_data(udxDataset);

    } else {
        data = udx_data_to_tree_data(udxDataset);
    }



    load_tree_data(data);
    var xml_str = udxDataset.formatToXmlStream();
    $("#view-xml").text(xml_str);
}

function setInputValue(_name, _type, _description) {
    $("#node_name").val(_name);
    $("#node_type").val(_type);

}


function load_tree_data(_data) {
    $('#tree').treeview({
        data: _data,
        onNodeSelected: function (event, node) {
            //show info of selected node.
            currentTreeNode = node;
            var DTNode = undefined;
            var NodeType = undefined;
            if ((DTNode = find_udx_data_node(udxDataset, node)) !== undefined) {
                currentDTNode = DTNode;
                var NodeName = DTNode.getName();
                NodeType = DTNode.getKernel().getType();
                var NodeTypeStr = UDXDataType2String(NodeType);
                setInputValue(NodeName, NodeTypeStr);

                //test function

                var array1 = list_data_to_array(DTNode);
                console.log(array1);

                //set data
                var current_node_type = DTNode.getKernel().getType();
                var current_node_columns = getNodeValueColumns(current_node_type);
                var current_table_data = undefined;
                if (current_node_columns !== 0) {
                    current_table_data = get_data_from_udx(DTNode);
                    if (current_table_data != undefined) {
                        $NodeValueTable.bootstrapTable('load', current_table_data);
                    } else {
                        $NodeValueTable.bootstrapTable('removeAll');
                    }
                } else {
                    $NodeValueTable.bootstrapTable('load', []);
                }

                //console.log(current_node_value);

                //show node value table
                if (DTNode !== undefined && NodeType !== undefined) {
                    showColumn($NodeValueTable, current_node_columns);
                }
            }


        }
    });
}

function init_node_value_table() {
    $NodeValueTable = $('#node-value-table').bootstrapTable({
        'classes': 'table table-no-bordered',
        'showHeader':false,
        columns: [{
            field: 'x',
            title: 'X'
        }, {
            field: 'y',
            title: 'Y'
        }, {
            field: 'z',
            title: 'Z'
        }, {
            field: 'v',
            title: 'V'
        }],
        data: []
    });
    $NodeValueTable.hide();

}

function init_dataset() {

    udxDataset = new UdxDataset();
    udxDataset.createDataset();
    udxDataset.loadFromXmlStream('<dataset>' +
        '<XDO name="DataList" kernelType="list">' +
        '<XDO name="Data1" kernelType="real_array" value="12.000000, 342.000000, 5435.000000, 3424.000000, 3234.000000, 3432.000000, 4324.000000, 3242.000000, 43.000000, 32.000000"/>' +
        '<XDO name="Data2" kernelType="real_array" value="23.000000, 213.000000, 231.000000, 4123.000000, 2312.000000, 231.000000, 312.000000, 321.000000, 321.000000, 321.000000"/>' +
        '</XDO>' +
        '</dataset>')
    var xml_str = udxDataset.formatToXmlStream();
    $("#view-xml").text(xml_str);
}






function bindClickEvent() {

    var currentRowIndex = undefined;
    /**
     * node view table click event
     */
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

    //close window

    $("#continue-going").on('click', function () {

    });
    //nav click

    $("li[role='presentation'] a").on('click', function () {

        var NavType = $(this).attr('value');
        window.sessionStorage.setItem('UDX', udxDataset.formatToXmlStream());
        if (NavType === 'MAPPING') {
            window.location.href = "./mapping.html";
        } else if (NavType === 'SCHEMA') {
            window.location.href = "./udx-schema.html";
        }


    })

    //click cell to edit

    $NodeValueTable.on('dbl-click-cell.bs.table', function (event, column, value, row, $element) {

        let EditInput = '<input id="edit-input" type="text" style="color:black;"></input>';
        $element.html(EditInput);
        $("#edit-input").val(value);
        $("#edit-input")[0].focus();

        $("#edit-input").blur(function () {
            var content = $("#edit-input").val();
            //$element.html(content);
            var updateData = {
                index: currentRowIndex,
                field: column,
                value: content
            }
            $NodeValueTable.bootstrapTable('updateCell', updateData);
        });
        current_cell_input = $("#edit-input")[0];

        //回车失去焦点
        $("#edit-input").keydown(function (event) {
            event = document.all ? window.event : event;
            if ((event.keyCode || event.which) == 13) {
                $("#edit-input")[0].blur();
            }
        });


    })


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
            $("#update-udx-data").click();
        }
    });


    $("#load-schema").on("click", function () {


    });

    $("#show-view").on("click", function () {
        //show schema 
        var xml_str = udxDataset.formatToXmlStream();
        $("#view-xml").text(xml_str);
    });



    $("#update-udx-data").on("click", function () {

        if (current_cell_input !== undefined) {
            current_cell_input.blur();
        }
        if (currentDTNode != undefined && currentTreeNode !== undefined) {
            var table_data = $NodeValueTable.bootstrapTable('getData');
            var current_node_name = $("#node_name").val();
            if (current_node_name !== "" && current_node_name !== currentDTNode.getName()) {
                currentDTNode.setName(current_node_name);
                update_tree('tree', current_node_name, currentTreeNode);
            }
            //if no data
            if (table_data === undefined || table_data.length === 0) {
                if (getNodeMaxRows(currentDTNode.getKernel().getType()) !== 0) {
                    toastr.warning("Can not update null to value node.", 'Waring', { timeOut: 3000 });
                }
                return false;
            }
            if (check_data(currentDTNode.getKernel().getType(), table_data) !== true || update_udx_from_data(currentDTNode, table_data) !== true) {
                toastr.warning("Update UDX data failed.Maybe this value is not correct.", 'Warning', { timeOut: 3000 });
                return false;
            }
        } else {
            toastr.warning("Have no node to update.", 'Warning', { timeOut: 3000 });
            return false;
        }

    })

    $("#save-file").on("click", function () {

    })

    $("#add-row").on("click", function () {

        if (currentDTNode !== undefined) {
            var m_node_type = currentDTNode.getKernel().getType();
            var m_count = getNodeMaxRows(m_node_type);
            var current_data = $NodeValueTable.bootstrapTable('getData');
            if (m_count === 0) {
                toastr.warning("This node does not allow to be added rows.", 'Warning', { timeOut: 3000 });
                return false;
            } else if (m_count === 1) {
                if (current_data != undefined && current_data.length < m_count) {
                    $NodeValueTable.bootstrapTable('append', [{
                    }]);
                } else {
                    toastr.warning("The maximum length of the node has been reached.", 'Warning', { timeOut: 3000 });
                }
            } else {
                $NodeValueTable.bootstrapTable('append', [{
                }]);
            }
        } else {
            toastr.warning("No nodes are selected.", 'Warning', { timeOut: 3000 });
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

    $('#add-sub').on('click', function () {
        if (currentDTNode !== undefined) {
            if (getNodeMaxRows(currentDTNode.getKernel().getType()) !== 0) {
                toastr.warning("This node does not allow child nodes to be added.", 'Warning', { timeOut: 3000 });
                return false;
            }
        }
    })

    // add node click
    $("#add_node").on('click', function () {
        var add_node_name = $("#add_node_name").val();
        var add_ndoe_type_str = $("#add_ndoe_type").val();

        if (add_node_name === "") {
            toastr.warning("Node name cannot be null.", 'Warning', { timeOut: 3000 });
            return false;
        }

        var add_ndoe_type = string2UDXDataType(add_ndoe_type_str);

        if (currentDTNode !== undefined && add_node_name !== "" && add_ndoe_type !== undefined) {
            var name = currentDTNode.getName();
            if (currentDTNode != undefined) {
                var addNode = currentDTNode.addChildNode(add_node_name, add_ndoe_type);

                if (addNode != undefined) {
                    //  udx_data_to_tree(udxDataset,'tree');
                    add_node('tree', add_node_name, currentTreeNode);
                }
            }
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

function getTree() {
    // Some logic to retrieve, or generate tree structure 
    var tree = [
        {
            text: "UdxDataset"
        }
    ];
    return tree;
}


$(function () {
    init();

});