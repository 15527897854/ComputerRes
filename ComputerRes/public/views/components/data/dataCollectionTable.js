/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var DataUploader = require('./dataUploader');

var DataCollectionTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            data : null,
            init : false
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if(data.data.res == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(!this.state.init)
                    {
                        $('#dataCollection-table').dataTable(
                            {
                                //数据URL
                                "data": "/modelser/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": true,
                                //排序配置
                                "aaSorting": [[2, "desc"]],
                                //自适应宽度
                                "bAutoWidth": true,
                                //多语言配置
                                "oLanguage": {
                                    "sLengthMenu": "每页显示 _MENU_ 条记录",
                                    "sZeroRecords": "对不起，查询不到任何相关数据",
                                    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                                    "sInfoEmtpy": "找不到相关数据",
                                    "sInfoFiltered": "数据表中共为 _MAX_ 条记录)",
                                    "sProcessing": "正在加载中...",
                                    "sSearch": "搜索",
                                    //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
                                    "sUrl": "",
                                    "oPaginate": {
                                        "sFirst":    "第一页",
                                        "sPrevious": " 上一页 ",
                                        "sNext":     " 下一页 ",
                                        "sLast":     " 最后一页 "
                                    }
                                }
                            }
                        );
                        this.setState({init : true});
                    }
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    displayData : function(e, gdid){
        window.open('/geodata/json/' + gdid);
    },

    downloadData : function(e, gdid){
        window.open('/geodata/' + gdid);
    },

    deleteData : function(e, gdid, gdtag){
        if(confirm('确认删除此数据 - ' + gdid + ' - ' + gdtag))
        {
            Axios.delete('/geodata/' + gdid).then(
                data => {
                    if(data.data.result == 'suc'){
                        alert('删除成功！');
                        this.refresh();
                    } },
                err => {  }
            );
        }
    },

    dataPreview : function (e,gdid) {
        // $("#myModal").attr("aria-hidden",false);
        var nice = $("html").niceScroll();
        nice.opt.mousescrollstep = 0;
        if($('#map:has(canvas)').length!=0){
            $("#map").empty();
        }
        $.ajax({
            url:'/geodata/snapshot/' + gdid,
            success:function (data) {
                var rst = JSON.parse(data);
                console.log(rst.layers)
                if(rst.suc == true){
                    var projection = 'EPSG:3857';
                    var layerExtents=[],map,
                        minx = 999999999,
                        miny = 999999999,
                        maxx = -999999999,
                        maxy = -999999999;
                    for(var j=0;j<rst.layers.length;j++){
                        var ENCorner = rst.layers[j].ENCorner;
                        var WSCorner = rst.layers[j].WSCorner;
                        ENCorner = proj4('EPSG:3857').forward(ENCorner);
                        WSCorner = proj4('EPSG:3857').forward(WSCorner);
                        layerExtents.push([WSCorner[0],WSCorner[1],ENCorner[0],ENCorner[1]]);
                        if(minx>WSCorner[0])
                            minx = WSCorner[0];
                        if(miny>WSCorner[1])
                            miny = WSCorner[1];
                        if(maxx<ENCorner[0])
                            maxx = ENCorner[0];
                        if(maxy<ENCorner[1])
                            maxy = ENCorner[1];
                    }
                    var imageExtent = [minx,miny,maxx,maxy];

                    var myView = new ol.View({
                        center: ol.extent.getCenter(imageExtent),
                        projection:projection
                    });
                    var overlayGroup = new ol.layer.Group({
                        title: 'Layers',
                        layers: [
                            new ol.layer.Tile({
                                title: 'OSM',
                                visible: true,
                                source: new ol.source.OSM()
                            })
                        ]
                    });
                    map = new ol.Map({
//                        controls: ol.control.defaults().extend([
//                            new ol.control.ZoomToExtent({})
//                        ]),
                        layers: [overlayGroup],
                        target: 'map',
                        view: myView
                    });
                    if(rst.dataType == 'geotiff'){
                        //坐标为平面坐标
                        for(var i=0;i<rst.layers.length;i++){
                            var title = rst.layers[i].path;
                            title = title.substring(title.lastIndexOf('_')+1,title.indexOf('.'));
                            overlayGroup.getLayers().push(new ol.layer.Image({
                                title: 'grid[band:' + title + ']',
                                source: new ol.source.ImageStatic({
                                    ratio: 1,
                                    params: {'LAYERS': 'show:0'},
                                    url: rst.layers[i].path,
                                    imageExtent: layerExtents[i],
                                    projection:projection
                                })
                            }));
                        }
                    }
                    else if(rst.dataType == 'shp'){
                        //经纬度
                        //考虑一个问题：geojosn的坐标和openlayers的坐标之间的关系
//                        ENCorner = proj4('EPSG:4326').forward(ENCorner);
//                        WSCorner = proj4('EPSG:4326').forward(WSCorner);
//                        imageExtent = [WSCorner[0],WSCorner[1],ENCorner[0],ENCorner[1]];
//                        projection = 'EPSG:4326';
                        overlayGroup.getLayers().push(new ol.layer.Vector({
                            ratio: 1,
                            params: {'LAYERS': 'show:0'},
                            title: 'shapefile',
                            source: new ol.source.Vector({
                                url: rst.layers[0].path,     // 地图来源
                                format: new ol.format.GeoJSON()    // 解析矢量地图的格式化类
                            })
                        }));
                    }
                    else if(rst.dataType == 'grid list'){
                        for(var i=0;i<rst.layers.length;i++){
                            var title = rst.layers[i].path;
                            var titlePart = title.split('_');
                            var listIndex = titlePart[titlePart.length-2];
                            var bandIndex = titlePart[titlePart.length-1];
                            bandIndex = bandIndex.substring(0,bandIndex.indexOf('.png'));
                            overlayGroup.getLayers().push(new ol.layer.Image({
                                title: 'list_' + listIndex + '[band:' + bandIndex + ']',
                                source: new ol.source.ImageStatic({
                                    ratio: 1,
                                    params: {'LAYERS': 'show:0'},
                                    url: rst.layers[i].path,
                                    imageExtent: layerExtents[i],
                                    projection:projection
                                })
                            }));
                        }
                    }
                    else if(rst.dataType == 'shp list'){
                        for(var i=0;i<rst.layers.length;i++) {
                            overlayGroup.getLayers().push(new ol.layer.Vector({
                                ratio: 1,
                                params: {'LAYERS': 'show:0'},
                                title: 'shapefile',
                                source: new ol.source.Vector({
                                    url: rst.layers[i].path,     // 地图来源
                                    format: new ol.format.GeoJSON()    // 解析矢量地图的格式化类
                                })
                            }));
                        }
                    }
                    else if(rst.dataType == 'table'){

                    }
                    map.getView().fit(imageExtent, map.getSize());
                    var layerSwitcher = new ol.control.LayerSwitcher({
                        tipLabel: 'Légende' // Optional label for button
                    });
                    map.addControl(layerSwitcher);
                }
                else{
                    alert('udx data err!');
                    $('#close-modal').trigger("click");
                }
            }.bind(this)
        });

        //恢复滚动条
        $('#myModal').on('hide.bs.modal',function () {
            var nice = $("html").niceScroll();
            nice.opt.enablemousewheel = true;
            nice.opt.mousescrollstep = 40;
        });
    },

    render : function() {
        if(this.state.loading)
        {
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        var dataItems = this.state.data.map(function(item){
            var format = null;
            if(item.gd_type == 'FILE')
            {
                format = (<span className="label label-info" ><i className="fa fa-file"></i> 文件</span>);
            }
            else if(item.gd_type == 'STREAM')
            {
                format = (<span className="label label-info" ><i className="fa fa-ellipsis-v"></i> 数据流</span>);
            }
            return(
                <tr key={item.gd_id}>
                    <td>{item.gd_id}</td>
                    <td>{format}</td>
                    <td>{item.gd_datetime}</td>
                    <td>{item.gd_tag}</td>
                    <td>
                        <button className="btn btn-info btn-xs" onClick={(e) => {this.displayData(e, item.gd_id)} } ><i className="fa fa-book"> </i> 查看</button>&nbsp;
                        <button className="btn btn-success btn-xs btn-lg" data-toggle="modal" data-target="#myModal"  onClick={(e) => {this.dataPreview(e, item.gd_id)} } ><i className="fa fa-picture-o"> </i> 渲染</button>&nbsp;
                        <button className="btn btn-default btn-xs" onClick={(e) => {this.downloadData(e, item.gd_id)} } ><i className="fa fa-download"> </i> 下载</button>&nbsp;
                        <button className="btn btn-warning btn-xs" onClick={(e) => {this.deleteData(e, item.gd_id, item.gd_tag)} } ><i className="fa fa-trash-o"> </i></button>
                    </td>
                </tr>
            );
        }.bind(this));

        return (
            <div>
                <div>
                    <DataUploader onFinish={this.refresh} />
                </div>
                <table className="display table table-bordered table-striped" id="dataCollection-table">
                    <thead>
                        <tr>
                            <th>数据ID</th>
                            <th>存储方式</th>
                            <th>生成时间</th>
                            <th>标签</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataItems}
                    </tbody>
                </table>

                <div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" tabIndex="-1" id="myModal" className="modal fade" style={{overflow: 'hidden'}}>
                    <div className="modal-dialog" style={{width: '750px'}}>
                        <div className="modal-content">
                            <div className="modal-header" style={{backgroundColor: 'rgba(0,0,0,0)',width: '750px',position: 'absolute',top: 0,left: 0,zIndex: 100}}>
                                <button type="button" id="close-modal" className="close" data-dismiss="modal" aria-hidden="true" style={{color: '#000'}}>
                                    &times;
                                </button>
                                <h4 className="modal-title" id="myModalLabel" style={{color: '#000'}}>
                                    UDX Visualization
                                </h4>
                            </div>
                            <div className="modal-body" style={{padding:0}}>
                                <div id="map"  className="map" style={{width:'750px',height: '500px'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DataCollectionTable;