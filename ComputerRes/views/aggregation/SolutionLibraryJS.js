/**
 * Created by SCR on 2017/7/17.
 */

var SolutionLibrary = (function () {
    var __url = '/aggregation/solution/getByID';
    var __webixSolutionTable = null;
    var __solutionsSegment = null;

    return {
        init: function () {
            var self = this;
            $.ajax({
                url: __url,
                data: {
                    _id: 'all',
                    isComplete: false
                },
                type: 'GET',
                dataType: 'json'
            })
                .done(function (res) {
                    if(res.error){
                        $.gritter.add({
                            title: 'Warning:',
                            text: 'Get solution library failed!<br><pre>' + JSON.stringify(res.error,null,4) + '</pre>',
                            sticky: false,
                            time: 2000
                        });
                    }
                    else{
                        __solutionsSegment = res.solutionsSegment;
                        self.__buildSolutionList();
                    }
                })
                .fail(function (error) {
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Get solution library failed!<br><pre>' + JSON.stringify(error,null,4) + '</pre>',
                        sticky: false,
                        time: 2000
                    });
                });
        },

        __buildSolutionList: function () {
            var width = $('#solution-list').width()-30;
            var height = 600;
            var columns = [
                {
                    id: 'name',
                    header: [
                        'Name',
                        {
                            content:'textFilter',
                            placeholder: 'Filter'
                        }
                    ],
                    adjust: true
                },{
                    id: 'author',
                    header: [
                        'Author',
                        {
                            content:'textFilter',
                            placeholder: 'Filter'
                        }
                    ],
                    adjust: true
                },{
                    id: 'desc',
                    header: 'Description',
                    minWidth: 150,
                    fillspace: true
                },{
                    id: 'time',
                    header: 'Time',
                    adjust: true
                }
            ];
            columns.push({
                id:'operate',
                header: 'Operate',
                template: function (obj) {
                    return "<div>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-detail-btn' title='solution detail'><i class='fa fa-info'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-edit-btn' title='edit solution'><i class='fa fa-pencil-square'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-configure-btn' title='configure this solution as a task'><i class='fa fa-cogs'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-delete-btn' title='delete solution'><i class='fa fa-trash'></i></button>" +
                        "</div>";
                },
                adjust: true
            });

            webix.locale.pager = {
                first: "<<",
                last: ">>",
                next: ">",
                prev: "<"
            };
            __webixSolutionTable = webix.ui({
                container: 'solution-list',
                view: 'datatable',
                pager:{
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    container: 'solution-list-pager',
                    size: 12,
                    group: 5,
                    width: 500
                },
                width: width,
                height: height,
                minheight: 600,
                autoheight: true,
                resizeColumn: true,
                select: false,
                editable: false,
                columns: columns,
                data:__solutionsSegment
            });
            this.__bindDetailBtnEvent();
            this.__bindEditBtnEvent();
            this.__bindDeleteBtnEvent();
            this.__bindConfigureBtnEvent();
            this.__bindResizeEvent();
        },

        __bindResizeEvent: function () {
            var resizeTable = function () {
                __webixSolutionTable.define('width', $('#solution-list').width()-30);
                __webixSolutionTable.resize();
            };

            $('.header-section .toggle-btn').on('click',function () {
                resizeTable();
            });

            window.onresize = function () {
                resizeTable();
            };
        },

        __bindDetailBtnEvent: function () {
            __webixSolutionTable.on_click['solution-detail-btn'] = function (e, obj, trg) {
                var solutionSegment = this.getItem(obj.row);
                window.open('/aggregation/solution/detail?_id='+solutionSegment._id);
            };
        },

        __bindEditBtnEvent: function () {
            __webixSolutionTable.on_click['solution-edit-btn'] = function (e, obj, trg) {
                var solutionSegment = this.getItem(obj.row);
                window.open('/aggregation/solution/edit?_id='+solutionSegment._id);
            };
        },

        __bindConfigureBtnEvent: function () {
            __webixSolutionTable.on_click['solution-configure-btn'] = function (e, obj, trg) {
                var solutionSegment = this.getItem(obj.row);
                window.open('/aggregation/task/new?solutionID='+solutionSegment._id);
            };
        },

        __bindDeleteBtnEvent: function () {
            var self = this;
            __webixSolutionTable.on_click['solution-delete-btn'] = function (e, obj, trg) {
                if(!confirm('Are you sure to delete this solution?')){
                    return ;
                }
                var solutionSegment = this.getItem(obj.row);
                var rowID = obj.row;
                $.ajax({
                    url: '/aggregation/solution/delete',
                    data: {
                        _id: solutionSegment._id
                    },
                    type: 'DELETE',
                    dataType: 'json'
                })
                    .done(function (res) {
                        if(res.error){
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Delete solution failed!<br><pre>' + JSON.stringify(res.error,null,4) + '</pre>',
                                sticky: false,
                                time: 2000
                            });
                        }
                        else{
                            self.__deleteSolutionTableByID(rowID);
                            $.gritter.add({
                                title: 'Notice:',
                                text: 'Delete solution success!',
                                sticky: false,
                                time: 2000
                            });
                        }

                    })
                    .fail(function (error) {
                        $.gritter.add({
                            title: 'Warning:',
                            text: 'Delete solution failed!<br><pre>' + JSON.stringify(error,null,4) + '</pre>',
                            sticky: false,
                            time: 2000
                        });
                    });
            };
        },

        __deleteSolutionTableByID: function (rowID) {
            __webixSolutionTable.remove(rowID);
        }
    };
})();

module.exports = SolutionLibrary;