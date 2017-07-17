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
            var width = $('#solution-list').width()-50;
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
                    width: width/5
                },{
                    id: 'author',
                    header: [
                        'Author',
                        {
                            content:'textFilter',
                            placeholder: 'Filter'
                        }
                    ],
                    width: width/5
                },{
                    id: 'desc',
                    header: 'Description',
                    width: width/5
                },{
                    id: 'time',
                    header: 'Time',
                    width: width/5
                }
            ];
            columns.push({
                id:'operate',
                header: 'Operate',
                template: function (obj) {
                    return "<div>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-detail-btn'><i class='fa fa-info'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-edit-btn'><i class='fa fa-pencil-square'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-configure-btn'><i class='fa fa-cogs'></i></button>" +
                        "<button class='btn btn-default btn-xs solution-operation-btn solution-delete-btn'><i class='fa fa-trash'></i></button>" +
                        "</div>";
                },
                width: width/5
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
                    size: 10,
                    group: 5,
                    level: 1,
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
            this.__bindDeleteBtnEvent();
            this.__bindConfigureBtnEvent();
        },

        __bindDetailBtnEvent: function () {
            __webixSolutionTable.on_click['solution-detail-btn'] = function (e, obj, trg) {
                var solutionSegment = this.getItem(obj.row);
                window.open('/aggregation/solution/detail?_id='+solutionSegment._id);
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

        __bindConfigureBtnEvent: function () {
            __webixSolutionTable.on_click['solution-configure-btn'] = function (e, obj, trg) {
                var solutionSegment = this.getItem(obj.row);

            };
        },

        __deleteSolutionTableByID: function (rowID) {
            __webixSolutionTable.remove(rowID);
        }
    };
})();

module.exports = SolutionLibrary;