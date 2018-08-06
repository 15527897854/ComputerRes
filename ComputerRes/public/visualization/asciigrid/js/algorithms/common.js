// 显示颜色色带
function showColorBar() {
    var ramp1 = new Ramp();
    var ColorJson = {};
    var canvasName = 'mycanvas';

    //拼装Data
    var DataArray = new Array();

    for (var i = 0; i < ramp1.rampCount; i++) {
        var ColorItem = {};
        ColorItem = {
            text: '<canvas id = "' + canvasName + (i + 1).toString() + '" width = "128" height = "20"> </canvas>',
            id: i + 1
        }
        DataArray.push(ColorItem);
    }

    // $(function () {
    $("#SelectColor").ligerComboBox({
        selectBoxWidth: 150,
        data: DataArray,
        valueFieldID: 'test3',
        onSelected: function (newvalue) {
            // 将颜色存储起来
            sessionStorage.colorJson = JSON.stringify(ramp1.getSingleRamp(newvalue));
            $("#SelectColor").val('第' + newvalue + '色带');

            var c = document.getElementById('nowShow');
            var cxt = c.getContext("2d");

            for (var x = 0; x < ramp1.colorCount; ++x) {
                var rgb = ramp1.getSingleRamp(newvalue)[x.toString()];
                cxt.fillStyle = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
                cxt.fillRect(x / 2, 0, (x + 1) / 2, 20);
            }
        }
    });
    // });
    for (var j = 1; j <= ramp1.rampCount; j++) {
        var c = document.getElementById(canvasName + j.toString());
        var cxt = c.getContext("2d");

        for (var x = 0; x < ramp1.colorCount; ++x) {
            var rgb = ramp1.getSingleRamp(j)[x.toString()];
            cxt.fillStyle = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
            cxt.fillRect(x / 2, 0, (x + 1) / 2, 20);

        }
    }
    // flag = true;
}


// 根据名字找udx中对应的list节点，该方法不是找任意节点，慎用！！！
// function getListNodeByName(udx, name, listnodes) {
//     for (var i = 0; i < udx.getChildNodeCount(); i++) {
//         if (udx.getChildNode(i).getKernel().getType() === EKernelType.EKT_LIST) {
//             if (udx.getChildNode(i).getName() === name) {
//                 // return udx.getChildNode(i);
//                 listnodes.push(udx.getChildNode(i));
//                 return;
//             }
//         }
//         getListNodeByName(udx.getChildNode(i), name, listnodes);
//     }
// }


// ************************** TODO：未实现canvas中图片的移动和缩放******************************

// 是否点击了画布，说明有可能要进行移动
var bStart = 0;
var bginX, bginY, startX = 0, startY = 0;
var offsetX_ctx = 0, offsetY_ctx = 0;

function getEvtLocation(ev) {
    if (ev === undefined) return;

    return {
        x: ev.offsetX,
        y: ev.offsetY
    }
}

// 为画布绑定鼠标事件
function initCanvasEv(canvasId, imgData, imgX, imgY) {
    $('#' + canvasId).unbind('mousedown').bind('mousedown', function (ev) {
        ev.preventDefault();
        bStart = 1;
        var poi = getEvtLocation(ev);

        bginX = poi.x;
        bginY = poi.y;

        // console.log('start: ' + bginX + ',' + bginY);
    });

    $('#' + canvasId).unbind('mousemove').bind('mousemove', function (ev) {
        ev.preventDefault();
        if (bStart === 0) return;

        var poi = getEvtLocation(ev);
        var offsetX = poi.x - bginX,
            offsetY = poi.y - bginY;

        //album.translate(offsetX, offsetY);

        var ctx = document.getElementById(canvasId).getContext("2d");
        // ctx.translate(offsetX, offsetY);//变换新的位置，再次绘制矩形

        // 清空画布
        ctx.clearRect(0, 0,  document.getElementById(canvasId).width,  document.getElementById(canvasId).height);

        // ctx.clearRect(-550, -300, 2 * 550, 2 * 300);

        // ctx.putImageData(imgData, -100/2,-97/2);

        // console.log('ox:' + offsetX + ', oy: ' + offsetY);

        // var imgW = 100, imgH = 97;

        // 这是清除图片因为平移而造成的痕迹，-ctxw是图片平移的反方向的位置，2*ctxW，是清除的面积


        //  图像的   左上角 + offset
        ctx.putImageData(imgData, imgX + offsetX, imgY + offsetY);
        // 更新图像左上角的位置
        imgX += offsetX;
        imgY += offsetY;
        // 
        bginX = poi.x;
        bginY = poi.y;

        // console.log('move: ' + bginX + ',' + bginY);
    });

    $('#' + canvasId).unbind('mouseup').bind('mouseup', function (ev) {
        ev.preventDefault();
        bStart = 0;

        // console.log('up: ' + bginX + ',' + bginY);
    });

    $('#' + canvasId).unbind('mouseout').bind('mouseout', function (ev) {
        ev.preventDefault();
        bStart = 0;

        // console.log('out: ' + bginX + ',' + bginY);
    });

}