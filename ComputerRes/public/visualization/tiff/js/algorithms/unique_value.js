
// 显示到地球上
function go2Map(projection) {
    // 计算显示位置
    var upleft = proj4(projection).inverse([uplefterX, uplefterY]);
    var bottomright = proj4(projection).inverse([uplefterX + width * cellsizeX, uplefterY + height * cellsizeY]);

    sessionStorage.ulx = upleft[0];
    sessionStorage.uly = upleft[1];

    sessionStorage.brx = bottomright[0];
    sessionStorage.bry = bottomright[1];

    window.parent.location.href = '../Map.html';
}

function process_unique_value_display() {
    // 显示色带
    showColorBar();
}

// 加载投影信息
$('#prjModal').on('shown.bs.modal', function () {
    // alert('shown');
});

// 判断数据是否有投影信息
$('#prjModal').on('hidden.bs.modal', function () {
    // 检查是否填写了投影信息
    if ($('#txt_prj').val().length > 0) {
        go2Map($('#txt_prj').val());
    }
});

// unique value ok
$('#btn_cfg_unique_ok').click(function () {
    var proj = dataset.getChildNode(2).getKernel().getTypedValue();
    // 没有投影信息
    if (proj.length <= 0) {
        // alert('您的数据没有投影信息，暂不支持在地球上显示');
        $("#prjModal").modal();
        return;
    }
    go2Map(proj);
});

// unique value apply
$('#btn_cfg_unique_apply').click(function () {

    // 要显示的node的name
    var nodename = sessionStorage.nodename;
    // 获得要显示的listnode,
    // 奇技淫巧：递归中return好像不太管用，所以，传递一个数组接受（引用传递），如果是单纯的变量接受的话，则是值传递。
    // var listnodes = new Array();
    // getListNodeByName(dataset, nodename, listnodes);
    // var listnode = listnodes[0];

    var bandsNode = dataset.getChildNode(1);
    var bandItemNode = bandsNode.getChildNode(0);
    var nodata = bandItemNode.getChildNode(0).getKernel().getTypedValue();
    var listnode = bandItemNode.getChildNode(5);

    var colorJsonStr = sessionStorage.colorJson;
    if (colorJsonStr === undefined) {
        alert('please choose a color clamp.');
        return;
    }

    var colorBar = new Array();
    var colorJSON = JSON.parse(colorJsonStr);

    for (var i = 0; i <= 255; i++) {
        var rgb = {};
        rgb = colorJSON[i.toString()];
        colorBar.push({ 'r': rgb.r, 'g': rgb.g, 'b': rgb.b });
    }

    // unique_preview_canvas
    //读取数据生成img
    var canvas = document.getElementById("unique_preview_canvas");
    var ctx = canvas.getContext("2d");

    var srcData = new Array();

    var min = 99999, max = -99999;

    var rows = listnode.getChildNodeCount();
    // 一开始已经检测过了，保证了每个item(int_array|real_array)的长度是一致的，所以，这里直接取第一个的长度就可以了。
    var cols = listnode.getChildNode(0).getKernel().getArrayCount();

    for (var i = 0; i < rows; i++) {
        var child = listnode.getChildNode(i);

        for (var j = 0; j < cols; j++) {

            var curValue = child.getKernel().getTypedValueByIndex(j); //parseFloat(oneLineArray[j]);
            if (curValue != nodata) {
                if (curValue < min) {
                    min = curValue;
                }
                if (curValue > max) {
                    max = curValue;
                }
            }
            srcData.push(curValue);
        }
    }

    // 将高程数据映射到0-255之间
    for (var i = 0; i < srcData.length; i++) {
        if(srcData[i]!=nodata)
            srcData[i] = parseInt((srcData[i] - min) / (max - min) * 255);
    }

    //创建一个图片
    var imgData = ctx.createImageData(cols, rows);
    // ImageData 有一个data属性，是一个一维数组，依次存储这r,g,b,a ，该数组的长度等于 w*h*4
    var flag = 0;
    for (var i = 0; i < imgData.data.length; i += 4) {
        if (srcData[flag] === nodata) {
            imgData.data[i + 0] = 1;
            imgData.data[i + 1] = 1;
            imgData.data[i + 2] = 1;
            imgData.data[i + 3] = 0;
            flag++;
        } else {
            var color = colorBar[srcData[flag]];
            imgData.data[i + 0] = color.r;
            imgData.data[i + 1] = color.g;
            imgData.data[i + 2] = color.b;
            imgData.data[i + 3] = 255;
            flag++;
        }
    }

    // ctx.putImageData(imgData, 550 / 2, 300 / 2);

    var cW = canvas.width;
    var cH = canvas.height;

    // 计算显示的坐标（左上角）
    var x = cW / 2 - cols / 2;
    var y = cH / 2 - rows / 2;

    ctx.clearRect(0, 0, cW, cH);
    ctx.putImageData(imgData, x, y);

    // 重新生成一个canvas
    var newcanvas = document.createElement('canvas');
    newcanvas.width = width;
    newcanvas.height = height;
    var newctx = newcanvas.getContext('2d');
    newctx.putImageData(imgData, 0, 0);

    // console.log(JSON.stringify(imgData.data));
    sessionStorage.dataurl = newcanvas.toDataURL(); //JSON.stringify(imgData.data);

    initCanvasEv('unique_preview_canvas', imgData, x, y);

});