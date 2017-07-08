'use strict';

var fs = require('fs');
var $ = require('jquery');
//默认的modeler
var BpmnModeler = require('bpmn-js/lib/Modeler');
//定制的modeler
var CustomModeler = require('./custom-modeler');

var canvas = $('#canvas');

var bpmnModeler = new CustomModeler({
    container: canvas,
    keyboard:{
        bindTo:document
    }
});

var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

function createNewDiagram() {
    bpmnModeler.importXML(newDiagramXML, function(err) {
        if (err) {
            $.gritter.add({
                title: '警告：',
                text: '初始化服务聚合框图失败！',
                sticky: false,
                time: 2000
            });
            console.error(err);
        } else {

        }
    });
}

$(document).on('ready', function() {
    createNewDiagram();

    //region 下载
    function saveDiagram(done) {
        bpmnModeler.saveXML({ format: true }, function(err, xml) {
            done(err, xml);
            // console.log(xml);
        });
    }

    var downloadLink = $('#js-download-diagram');

    $('.buttons a').click(function(e) {
        if (!$(this).is('.active')) {
            e.preventDefault();
            e.stopPropagation();
        }
        else{
            //TODO 向后台发送xml stream

        }
    });

    function setEncoded(link, name, data) {
        var encodedData = encodeURIComponent(data);
        if (data) {
            // link.addClass('active').attr({
            //     'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
            //     'download': name
            // });
            link.addClass('active').attr({
                'data-xml': encodedData
            });
        } else {
            link.removeClass('active');
        }
    }

    var debounce = require('lodash/function/debounce');
    var exportArtifacts = debounce(function() {
        saveDiagram(function(err, xml) {
            setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    }, 500);

    bpmnModeler.on('commandStack.changed', exportArtifacts);
    //endregion
});