/**
 * Created by Administrator on 3.19.
 */
var fs = require('fs');
var lib_udx = require('./nxdat');
var Canvas = require('canvas');
var proj4 = require('proj4');
var GeoDataCtrl = require('../control/geoDataControl');

function UDXVisualization() {

}
module.exports = UDXVisualization;

UDXVisualization.test = function () {
    ctx.font = '30px Impact';
    ctx.rotate(.1);
    ctx.fillText("Awesome!", 50, 100);

    var te = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();

    console.log('<img src="' + canvas.toDataURL('/../public/images/awesome.png') + '" />');
};

UDXVisualization.getDataType = function (gdid,callback) {
    //查找不到数据？redis数据的持久化
    GeoDataCtrl.getByKey(gdid, function (err, gd) {
        if(err)
        {
            return callback(err);
        }
        if(gd == null)
        {
            return callback('Error:null data!');
        }
        var filename = __dirname + '/../geo_data/' + gd.gd_value;
        var filedata;
        if(gd.gd_type == 'FILE')
        {
            filedata = fs.readFileSync(filename,'utf8').toString();
        }
        else if(gd.gd_type == 'STREAM')
        {
            filedata = gd.gd_value;
        }
        var srcDataset = lib_udx.createDataset();
        //TODO可能会出现字符编码问题
        var ss = lib_udx.loadFromXmlFile(srcDataset, filedata);
        if (ss != 'Parse XML OK') {
            callback("Error:load udx err!");
        }
        var srcRootNode = lib_udx.getDatasetNode(srcDataset);
        var count = lib_udx.getNodeChildCount(srcRootNode);
        var firstFloor = [];
        for(var i=0;i<count;i++){
            var node = lib_udx.getChildNode(srcRootNode,i);
            var nodeName = lib_udx.getNodeName(node);
            firstFloor.push(nodeName);
        }
        if(firstFloor.indexOf('ShapeType') != -1 || firstFloor.indexOf('FeatureCollection') != -1 ||
            firstFloor.indexOf('AttributeTable') != -1 || firstFloor.indexOf('SpatialRef') != -1){
            callback(null,'shp',srcDataset);
        }
        else if(firstFloor.indexOf('header') != -1 || firstFloor.indexOf('bands') != -1 ||
            firstFloor.indexOf('projection') != -1){
            callback(null,'grid',srcDataset);
        }
        else if(firstFloor.indexOf('head') != -1 || firstFloor.indexOf('body') != -1){
            callback(null,'ascii grid',srcDataset);
        }
        else if(firstFloor.indexOf('grid list') != -1){
            callback(null,'grid list',srcDataset);
        }
        else if(firstFloor.indexOf('shp list') != -1){
            callback(null,'shp list',srcDataset);
        }
        else if(firstFloor.indexOf('table') != -1){
            callback(null,'table',srcDataset);
        }
        else{
            callback(null,'Unknown',null);
        }
    });
};

//将gtiff的所有波段进行可视化，factor为缩放因子，dstPath为存放路径
UDXVisualization.GtiffDataset = function (gdid,srcDataset, factor, callback) {
    var srcRootNode = lib_udx.getDatasetNode(srcDataset);
    var count = lib_udx.getNodeChildCount(srcRootNode);
    if (count < 3) {
        return console.log('Error:UDX err!');
    }
    //////////////////////////////////////////////
    // read
    {
        var srcHead, srcBody, srcProj,srcW,srcH,srcxll,srcyll,pixelW,pixelH,dataType;
        srcHead = lib_udx.getChildNode(srcRootNode, 0);
        srcBody = lib_udx.getChildNode(srcRootNode, 1);
        srcProj = lib_udx.getChildNode(srcRootNode, 2);
        srcxll = lib_udx.getChildNode(srcHead,0);
        pixelW = lib_udx.getChildNode(srcHead,1);
        srcyll = lib_udx.getChildNode(srcHead,3);
        pixelH = lib_udx.getChildNode(srcHead,4);
        srcW = lib_udx.getChildNode(srcHead, 6);
        srcH = lib_udx.getChildNode(srcHead, 7);
        dataType = lib_udx.getChildNode(srcHead, 8);
        var nrows = lib_udx.getNodeIntValue(srcH);
        var ncols = lib_udx.getNodeIntValue(srcW);
        var xll = lib_udx.getNodeRealValue(srcxll);
        var yll = lib_udx.getNodeRealValue(srcyll);
        var pixelWidth = Math.abs(lib_udx.getNodeRealValue(pixelW));
        var pixelHeight = Math.abs(lib_udx.getNodeRealValue(pixelH));
        var bandCount = lib_udx.getNodeChildCount(srcBody);
        var projection = lib_udx.getNodeStringValue(srcProj);
        var dt = lib_udx.getNodeStringValue(dataType);
    }

    //////////////////////////////////////////////
    // draw and save image
    var rstList = [];
    var saveOne = function (band) {
        //draw
        var srcBandNode = lib_udx.getChildNode(srcBody,band);
        var nodataNode = lib_udx.getChildNode(srcBandNode,0);
        var nodataV = lib_udx.getNodeRealValue(nodataNode);
        var srcValueNode = lib_udx.getChildNode(srcBandNode,4);
        var valueType = lib_udx.getNodeType(lib_udx.getChildNode(srcValueNode,0)).value;
        var pixelDeep = -1;
        if(pixelDeep == -1){
            var maxV=-99999,
                minV=99999;
            for(var i=0;i<nrows;i++) {
                for (var j = 0; j < ncols; j++) {
                    var kernal;
                    if(valueType==2)
                        kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                    else if(valueType == 1)
                        kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                    if(kernal == nodataV)
                        continue;
                    if(kernal>maxV){
                        maxV = kernal;
                    }
                    if(kernal<minV){
                        minV = kernal;
                    }
                }
            }
        }
        var canvasH = Math.floor(nrows/factor)+1;
        var canvasW = Math.floor(ncols/factor)+1;
        var canvas = new Canvas(canvasW,canvasH);
        var ctx = canvas.getContext('2d');
        for(var i=0;i<canvasH;i++){
            for(var j=0;j<canvasW;j++){
                var pixelV = 0;
                for(var k = 0;k<factor;k++){
                    for(var b = 0;b<factor;b++){
                        var row = i*factor+k;
                        var col = j*factor+b;
                        if(row >= nrows)
                            row = nrows - 1;
                        if(col >= ncols)
                            col = ncols - 1;
                        var kernal;
                        if(valueType==2)
                            kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                        else if(valueType == 1)
                            kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                        pixelV += kernal;
                    }
                }
                pixelV = pixelV/factor/factor;
                //nodata
                if(pixelV==nodataV)
                    continue;
                // draw piexl
                var val;
                if(pixelDeep == -1){
                    val = Math.floor((pixelV-minV)/(maxV-minV)*255);
                }
                else{
                    val = pixelV/Math.pow(2,pixelDeep-8);
                }
                ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
                ctx.fillRect(j,i,1,1);
            }
        }

        //save
        var dataURL = canvas.toDataURL('imag/png',1);
        //openlayers或者地图坐标系的坐标系与canvas的y轴方向不同，前者向上，后者向下
        //在此坐标表示地理坐标，向上，向右为正
        var WSCorner = [
            xll,
            yll-pixelHeight*nrows
        ];
        var ENCorner = [
            xll+pixelWidth*ncols,
            yll
        ];
        //提供给前台的是经纬度形式的extent
        try{
            WSCorner = proj4(projection).inverse(WSCorner);
            ENCorner = proj4(projection).inverse(ENCorner);
        }
        catch(err){
            WSCorner = proj4('EPSG:3857').inverse(WSCorner);
            ENCorner = proj4('EPSG:3857').inverse(ENCorner);
        }
        var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        var dstPath = __dirname + '/../public/images/snapshot/' + gdid + '_' + band + '.png';
        fs.writeFile(dstPath, dataBuffer, function(err) {
            if (err) {
                console.log('Error:sava image file err!');
                callback(err);
            } 
            else {
                rst = {
                    path:'/images/snapshot/' + gdid + '_' + band + '.png',
                    WSCorner:WSCorner,
                    ENCorner:ENCorner
                };
                rstList.push(rst);
                if(band == (bandCount-1)){
                    callback(null,rstList);
                }
                else{
                    saveOne(band+1);
                }
            }
        });
    };
    saveOne(0);
};

UDXVisualization.GtiffListDataset = function (gdid,srcDataset,factor,callback) {
    var gridListNode = lib_udx.getChildNode(lib_udx.getDatasetNode(srcDataset),0);
    var listCount = lib_udx.getNodeChildCount(gridListNode);
    var rstList = [];
    var getOneGtiff = function (index) {
        var srcRootNode = lib_udx.getChildNode(gridListNode,index);
        //////////////////////////////////////////////
        // read
        {
            var srcHead, srcBody, srcProj,srcW,srcH,srcxll,srcyll,pixelW,pixelH,dataType;
            srcHead = lib_udx.getChildNode(srcRootNode, 0);
            srcBody = lib_udx.getChildNode(srcRootNode, 1);
            srcProj = lib_udx.getChildNode(srcRootNode, 2);
            srcxll = lib_udx.getChildNode(srcHead,0);
            pixelW = lib_udx.getChildNode(srcHead,1);
            srcyll = lib_udx.getChildNode(srcHead,3);
            pixelH = lib_udx.getChildNode(srcHead,4);
            srcW = lib_udx.getChildNode(srcHead, 6);
            srcH = lib_udx.getChildNode(srcHead, 7);
            dataType = lib_udx.getChildNode(srcHead, 8);
            var nrows = lib_udx.getNodeIntValue(srcH);
            var ncols = lib_udx.getNodeIntValue(srcW);
            var xll = lib_udx.getNodeRealValue(srcxll);
            var yll = lib_udx.getNodeRealValue(srcyll);
            var pixelWidth = Math.abs(lib_udx.getNodeRealValue(pixelW));
            var pixelHeight = Math.abs(lib_udx.getNodeRealValue(pixelH));
            var bandCount = lib_udx.getNodeChildCount(srcBody);
            var projection = lib_udx.getNodeStringValue(srcProj);
            var dt = lib_udx.getNodeStringValue(dataType);
        }

        //////////////////////////////////////////////
        // draw and save image
        var saveOne = function (band) {
            //draw
            var srcBandNode = lib_udx.getChildNode(srcBody,band);
            var nodataNode = lib_udx.getChildNode(srcBandNode,0);
            var nodataV = lib_udx.getNodeRealValue(nodataNode);
            var srcValueNode = lib_udx.getChildNode(srcBandNode,4);
            var valueType = lib_udx.getNodeType(lib_udx.getChildNode(srcValueNode,0)).value;
            var pixelDeep = -1;
            if(pixelDeep == -1){
                var maxV=-99999,
                    minV=99999;
                for(var i=0;i<nrows;i++) {
                    for (var j = 0; j < ncols; j++) {
                        var kernal;
                        if(valueType==2)
                            kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                        else if(valueType == 1)
                            kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,i),j);
                        if(kernal == nodataV)
                            continue;
                        if(kernal>maxV){
                            maxV = kernal;
                        }
                        if(kernal<minV){
                            minV = kernal;
                        }
                    }
                }
            }
            var canvasH = Math.floor(nrows/factor)+1;
            var canvasW = Math.floor(ncols/factor)+1;
            var canvas = new Canvas(canvasW,canvasH);
            var ctx = canvas.getContext('2d');
            for(var i=0;i<canvasH;i++){
                for(var j=0;j<canvasW;j++){
                    var pixelV = 0;
                    for(var k = 0;k<factor;k++){
                        for(var b = 0;b<factor;b++){
                            var row = i*factor+k;
                            var col = j*factor+b;
                            if(row >= nrows)
                                row = nrows - 1;
                            if(col >= ncols)
                                col = ncols - 1;
                            var kernal;
                            if(valueType==2)
                                kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                            else if(valueType == 1)
                                kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcValueNode,row),col);
                            pixelV += kernal;
                        }
                    }
                    pixelV = pixelV/factor/factor;
                    //nodata
                    if(pixelV==nodataV)
                        continue;
                    // draw piexl
                    var val;
                    if(pixelDeep == -1){
                        val = Math.floor((pixelV-minV)/(maxV-minV)*255);
                    }
                    else{
                        val = pixelV/Math.pow(2,pixelDeep-8);
                    }
                    ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
                    ctx.fillRect(j,i,1,1);
                }
            }

            //save
            var dataURL = canvas.toDataURL('imag/png',1);
            //openlayers或者地图坐标系的坐标系与canvas的y轴方向不同，前者向上，后者向下
            //在此坐标表示地理坐标，向上，向右为正
            //transform coordinate
            {
                var WSCorner = [
                    xll,
                    yll-pixelHeight*nrows
                ];
                var ENCorner = [
                    xll+pixelWidth*ncols,
                    yll
                ];
                //提供给前台的是经纬度形式的extent
                try{
                    WSCorner = proj4(projection).inverse(WSCorner);
                    ENCorner = proj4(projection).inverse(ENCorner);
                }
                catch(err){
                    WSCorner = proj4('EPSG:3857').inverse(WSCorner);
                    ENCorner = proj4('EPSG:3857').inverse(ENCorner);
                }
            }
            var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = new Buffer(base64Data, 'base64');
            var dstPath = __dirname + '/../public/images/snapshot/' + gdid + '_' + index + '_' + band + '.png';
            fs.writeFile(dstPath, dataBuffer, function(err) {
                if (err) {
                    console.log('Error:sava image file err!');
                    callback(err);
                }
                else {
                    rst = {
                        path:'/images/snapshot/' + gdid + '_' + index + '_' + band + '.png',
                        WSCorner:WSCorner,
                        ENCorner:ENCorner
                    };
                    rstList.push(rst);
                    if(band == (bandCount-1)){
                        if(index == (listCount-1))
                            callback(null,rstList);
                        else
                            getOneGtiff(index+1);
                    }
                    else{
                        saveOne(band+1);
                    }
                }
            });
        };
        saveOne(0);
    };
    getOneGtiff(0);
};

UDXVisualization.AsciiGridDataset = function (gdid,srcDataset, factor, callback) {
    var srcRootNode = lib_udx.getDatasetNode(srcDataset);
    var count = lib_udx.getNodeChildCount(srcRootNode);
    if (count < 2) {
        return console.log('Error:UDX err!');
    }
    //////////////////////////////////////////////
    // read
    var nrows,ncols,xll,yll,cellsize,nodataV;
    var srcHead = lib_udx.getChildNode(srcRootNode, 0);
    var srcBody = lib_udx.getChildNode(srcRootNode, 1);
    for(var i=0;i<lib_udx.getNodeChildCount(srcHead);i++){
        var childNode = lib_udx.getChildNode(srcHead,i);
        var nodeName = lib_udx.getNodeName(childNode);
        switch (nodeName){
            case 'ncols':
                ncols = lib_udx.getNodeIntValue(childNode);
                break;
            case 'nrows':
                nrows = lib_udx.getNodeIntValue(childNode);
                break;
            case 'xllcorner':
                xll = lib_udx.getNodeRealValue(childNode);
                break;
            case 'yllcorner':
                yll = lib_udx.getNodeRealValue(childNode);
                break;
            case 'NODATA_value':
                nodataV = lib_udx.getNodeRealValue(childNode);
                break;
            case 'cellsize':
                cellsize = lib_udx.getNodeRealValue(childNode);
        }
    }

    //get max and min value
    {
        var maxV=-99999,
            minV=99999;
        for(var i=0;i<nrows;i++) {
            for (var j = 0; j < ncols; j++) {
                var kernal;
                try{
                    kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcBody,i),j);
                }
                catch(err){
                    kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcBody,i),j);
                }
                if(kernal == nodataV)
                    continue;
                if(kernal>maxV){
                    maxV = kernal;
                }
                if(kernal<minV){
                    minV = kernal;
                }
            }
        }
    }
    var canvasH = Math.floor(nrows/factor)+1;
    var canvasW = Math.floor(ncols/factor)+1;
    var canvas = new Canvas(canvasW,canvasH);
    var ctx = canvas.getContext('2d');
    // var myImageData = ctx.createImageData(canvasH,canvasW);
    for(var i=0;i<canvasH;i++){
        for(var j=0;j<canvasW;j++){
            var pixelV = 0;
            for(var k = 0;k<factor;k++){
                for(var b = 0;b<factor;b++){
                    var row = i*factor+k;
                    var col = j*factor+b;
                    if(row >= nrows)
                        row = nrows - 1;
                    if(col >= ncols)
                        col = ncols - 1;
                    var kernal;
                    try{
                        kernal = lib_udx.getNodeRealArrayValue(lib_udx.getChildNode(srcBody,row),col);
                    }
                    catch(err){
                        kernal = lib_udx.getNodeIntArrayValue(lib_udx.getChildNode(srcBody,row),col);
                    }
                    pixelV += kernal;
                }
            }
            pixelV = pixelV/factor/factor;
            //nodata
            if(pixelV==nodataV)
                continue;
            // draw piexl
            val = Math.floor((pixelV-minV)/(maxV-minV)*255);
            ctx.fillStyle = 'rgba(' + val + ',' + val + ',' + val + ',1)';
            ctx.fillRect(j,i,1,1);
        }
    }

    //save image
    var dataURL = canvas.toDataURL('imag/png',1);
    var WSCorner = [
        xll,
        yll-cellsize*nrows
    ];
    var ENCorner = [
        xll+cellsize*ncols,
        yll
    ];

    //提供给前台的是经纬度形式的extent
    //ascii grid 没有存投影信息
    WSCorner = proj4('EPSG:3857').inverse(WSCorner);
    ENCorner = proj4('EPSG:3857').inverse(ENCorner);
    var base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var dstPath = __dirname + '/../public/images/snapshot/' + gdid + '.png';
    fs.writeFile(dstPath, dataBuffer, function(err) {
        if (err) {
            console.log('Error:sava image file err!');
            callback(err);
        } else {
            rst = {
                path:'/images/snapshot/' + gdid + '.png',
                WSCorner:WSCorner,
                ENCorner:ENCorner
            };
            console.log("ok!");
            callback(null,[rst]);
        }
    });
};




UDXVisualization.GtiffFile = function (srcPath,dstPath,band,factor, callback) {
    fs.readFile(srcPath,function (err, data) {
        if (err) {
            console.log("Error:read file err!\n");
            callback(err);
        }
        var strUDX = data.toString();
        var srcDataset = lib_udx.createDataset();
        // bug
        // Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X
        // with X higher than the current value 16777216, (2) compile with
        // ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some
        // optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.
        var ss = lib_udx.loadFromXmlFile(srcDataset, strUDX);
        if (ss != 'Parse XML OK') {
            return console.log('Error:load udx err!');
        }
        UDXVisualization.GtiffDataset(srcDataset,band,factor,function (err, rst) {
            if(err){
                callback(err);
            }
            else{
                fs.writeFile(dstPath, rst.image, function(err) {
                    if (err) {
                        console.log('Error:sava image file err!');
                        callback(err);
                    } else {
                        callback(null,rst)
                    }
                });
            }
        })
    })
};