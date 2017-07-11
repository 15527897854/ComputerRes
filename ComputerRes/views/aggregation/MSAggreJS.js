/**
 * Created by SCR on 2017/7/9.
 */
var Promise = require('bluebird');
var CanvasJS = require('./CanvasJS');

var MSAggreJS = (function () {
    var __Dnd = ()=> {
        return {
            init: function () {
                var self = this;
                self.src = $('.webix_accordionitem_label');
                self.dst = $('#canvas');
                $(self.src).on('dragstart', self.onDragStart);
                $(self.dst).on('dragenter', self.onDragEnter);
                $(self.dst).on('dragover', self.onDragOver);
                $(self.dst).on('dragleave', self.onDragLeave);
                $(self.dst).on('drop', self.onDrop);
            },
            onDragStart: function (e) {
                e.dataTransfer = e.originalEvent.dataTransfer;
                e.dataTransfer.setData('text/plain', $($(e.target).parents('.webix_view .webix_accordionitem')[0]).index());
                return true;
            },
            onDragEnter: function (e) {
                return true;
            },
            onDragLeave: function (e) {
                return true;
            },
            onDragOver: function (e) {
                return false;
            },
            onDrop: function (e) {
                e.dataTransfer = e.originalEvent.dataTransfer;
                var index = e.dataTransfer.getData('text/plain');
                var config = accordion.getChildViews()[+index].config;
                if (config.error) {
                    $.gritter.add({
                        title: '警告：',
                        text: '获取服务输入输出详细信息失败！',
                        sticky: false,
                        time: 2000
                    });
                    return;
                }
                else {
                    CanvasJS.addServiceRole(config.SADLService);
                }
            }
        };
    };
    var __getServiceDetail = (mss, cb)=> {
        $.ajax({
            url:'/aggregation/SADL/getServices',
            method:'GET',
            dataType:'json',
            data:{
                mss:mss
            }
        })
            .done((res) => {
                return cb(null,res);
            })
            .fail((err) => {
                $.gritter.add({
                    title: '警告：',
                    text: '获取服务详细信息失败',
                    sticky: false,
                    time: 2000
                });
                return cb(err);
            });
    };

    return {
        getALLMS: (cb) => {
            $.ajax({
                url:'/aggregation/ms/all',
                method:'GET',
                dataType:'json'
            })
                .done((res) => {
                    if(res.error){
                        $.gritter.add({
                            title: '警告：',
                            text: '获取服务列表失败',
                            sticky: false,
                            time: 2000
                        });
                        return cb(res.error);
                    }
                    else{
                        return cb(null,res.mss);
                    }
                })
                .fail((err) => {
                    $.gritter.add({
                        title: '警告：',
                        text: '获取服务列表失败',
                        sticky: false,
                        time: 2000
                    });
                    return cb(err);
                });
        },

        buildMSListModal: function(msTreeData,cb) {
            var webixTree = webix.ui({
                container: 'ms-tree',
                view: 'tree',
                select: 'multiselect',
                multiselect: true,
                activeTitle: true,
                resizeColumn: true,
                height: 400,
                width: 550,
                autowidth: true,
                autoheight: true,
                editable: false,
                data: msTreeData,
                template: "{common.icon()} {common.checkbox()} {common.folder()} <span>#ms_model.m_name#</span>",
                on: {
                    'onItemCheck':function (id) {
                        if(this.getChecked().length == 0)
                            $('#ms-cart-modal .btn-tt-submit').attr('disabled',true);
                        else
                            $('#ms-cart-modal .btn-tt-submit').attr('disabled',false);
                    },
                    'onSelectChange': function (ids) {
                        this.checkItem(ids[0]);
                    }
                }
            });
            $('#ms-cart-modal').modal('show');
            $('#ms-cart-modal .btn-tt-submit').click((e) => {
                var Aggre_MS = webixTree.getChecked();
                var mss = [];
                for(var i=0;i<Aggre_MS.length;i++){
                    mss.push({
                        _id:webixTree.getItem(Aggre_MS[i])._id,
                        host:webixTree.getItem(Aggre_MS[i]).host,
                        port:webixTree.getItem(Aggre_MS[i]).port
                    });
                }
                __getServiceDetail(mss, (err,mss)=> {
                    this.buildMSDetailAccordion(mss)
                });
            });
            return cb(null,webixTree);
        },

        buildMSDetailAccordion: (msList) => {
            $('#webix-AggreMS-list').children().remove();
            $('.webix_accordionitem_label').unbind();
            $('#canvas').unbind();
            var accoData = [];
            for(var i=0;i<msList.length;i++){
                if(msList[i].error){
                    accoData.push({
                        header:'Error',
                        body:'<pre>'+JSON.stringify(msList[i].error,null,4)+'</pre>',
                        collapsed:true,
                        scroll:'xy',
                        width:$('#webix-AggreMS-list').width(),
                        height:300,
                        error:msList[i].error
                    });
                }
                else{
                    accoData.push({
                        header:msList[i].SADLService.ms_model.m_name,
                        body:'<pre>'+JSON.stringify(msList[i].SADLService.states,null,4)+'</pre>',
                        collapsed:true,
                        scroll:'xy',
                        width:$('#webix-AggreMS-list').width(),
                        height:300,
                        SADLService:msList[i].SADLService,
                        error:null
                    });
                }
                // if(i<msList.length-1){
                //     accoData.push({view:'resizer'});
                // }
            }

            accordion = webix.ui({
                container:'webix-AggreMS-list',
                view:'accordion',
                multi:true,
                width:$('#webix-AggreMS-list').width(),
                height:$('#webix-AggreMS-list').height(),
                scroll:'y',
                rows:accoData
            });
            $('.webix_accordionitem_label').click((e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            $('.webix_accordionitem_label').attr('draggable',true);

            var dnd = __Dnd();
            dnd.init();
        }
    }

})();

module.exports = MSAggreJS;
