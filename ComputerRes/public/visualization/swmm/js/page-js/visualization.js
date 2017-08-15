var udxDataset;
var currentDTNode;
var currentTreeNode;
var $NodeValueTable;
var current_cell_input = undefined;

function init() {

    //bindContextMenu("tree", "contextMenu");
    init_dataset();
    



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
                if (array1.length > 0) {
                    $("#current_node_value").val(array1.toString());
                }else{
                     $("#current_node_value").val('');
                }
            }


        }
    });
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
    });

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
    init_node_value_table();
    init_tree();
    bindClickEvent();
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

    $("#show-view").on("click", function () {
        //show schema 
        var xml_str = udxDataset.formatToXmlStream();
        $("#view-xml").text(xml_str);
    });

    $("#add-to-table").on("click", function () {

        var current_value = $("#current_node_value").val();
        var current_node_name = $("#node_name").val();
        if (current_value !== "") {

            //Check whether the data is repeated
            var all_data =  $NodeValueTable.bootstrapTable('getData');

            for(var i=0;i<all_data.length;i++){
                if(all_data[i]['x']===current_value){
                    return false;
                }
            }
            $NodeValueTable.bootstrapTable('append', [{
                'x': current_value,
                'X': current_node_name
            }]);
        }




    })
    //visualization-ensure click事件
    $("#visualization-ensure").on("click",function(){
        var testdata = [];
        var testnodename = [];
        var arr = [];
       
        var alldata = $NodeValueTable.bootstrapTable('getData');
        for(var i = 0; i < alldata.length; i++){
            testdata.push(alldata[i]['x']);
            testnodename.push(alldata[i]['X']);
        }
        var json = {data:[]};
         //json.name = testnodename;
         //json.value = testdata;
         //console.log(JSON.stringify(json));

         for(var j = 0 ; j < testnodename.length; j++){
            var count = testdata[j].split(',');
            var row1 = {};
            //var tempname = testnodename[j];
            //json[tempname] = count;
             row1.name = testnodename[j];
             row1.value = count;
            //var name = testnodename[j];
            json.data.push(row1);
          // json = count;
         }
          console.log(JSON.stringify(json));
          sessionStorage.setItem("temp",JSON.stringify(json));
        var aa = sessionStorage.getItem("temp");
          console.log(aa);
        // Application["data"] = testdata;
        // server.Transfer("EchartsVisluation.aspx");


    })

// visualization_type_modal click事件
    $("#visualization-confirm").on("click",function(){
        var image_id = getSelected();
        console.log(image_id);
        if(image_id == "img_Chart"){
          $("#visualization_type_modal").modal('hide');
          window.open('EchartsVisluation.html');
        }else if(image_id == "img_LineChart"){
            $("#visualization_type_modal").modal('hide');
            window.open('LineChartExample.html');
        }else if(image_id == "img_PieChart"){
            $("#visualization_type_modal").modal('hide');
            window.open('PieChartExample.html');
        }else{
             toastr.warning("you must choose type.", 'Waring', { timeOut: 3000 });
             return false;
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