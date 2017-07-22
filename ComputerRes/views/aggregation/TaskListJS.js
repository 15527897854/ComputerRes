/**
 * Created by SCR on 2017/7/17.
 */
/*jshint esversion: 6 */

var TaskList = (function () {
    var __url = '/aggregation/task/getByID';
    var __webixTaskTable = null;
    var __tasksSegment = null;

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
                            text: 'Get task list failed!<br><pre>' + JSON.stringify(res.error,null,4) + '</pre>',
                            sticky: false,
                            time: 2000
                        });
                    }
                    else{
                        __tasksSegment = res.tasksSegment;

                        self.__buildTasksList();
                    }
                })
                .fail(function (error) {
                    $.gritter.add({
                        title: 'Warning:',
                        text: 'Get task list failed!<br><pre>' + JSON.stringify(error,null,4) + '</pre>',
                        sticky: false,
                        time: 2000
                    });
                });
        },

        __buildTasksList: function () {
            for(let i=0;i<__tasksSegment.length;i++){
                __tasksSegment[i].name = __tasksSegment[i].taskInfo.taskName;
                __tasksSegment[i].author = __tasksSegment[i].taskInfo.taskAuthor;
                __tasksSegment[i].desc = __tasksSegment[i].taskInfo.taskDesc;
                __tasksSegment[i].time = __tasksSegment[i].taskInfo.time;
            }

            var width = $('#task-list').width()-50;
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
                        "<button class='btn btn-default btn-xs task-operation-btn task-detail-btn' title='task detail'><i class='fa fa-info'></i></button>" +
                        "<button class='btn btn-default btn-xs task-operation-btn task-edit-btn' title='edit task'><i class='fa fa-pencil-square'></i></button>" +
                        "<button class='btn btn-default btn-xs task-operation-btn task-delete-btn' title='delete task'><i class='fa fa-trash'></i></button>" +
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
            __webixTaskTable = webix.ui({
                container: 'task-list',
                view: 'datatable',
                pager:{
                    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()}",
                    container: 'task-list-pager',
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
                data:__tasksSegment
            });
            this.__bindDetailBtnEvent();
            this.__bindEditBtnEvent();
            this.__bindDeleteBtnEvent();
        },

        __bindDetailBtnEvent: function () {
            __webixTaskTable.on_click['task-detail-btn'] = function (e, obj, trg) {
                var taskSegment = this.getItem(obj.row);
                window.open('/aggregation/task/detail?_id='+taskSegment._id);
            };
        },

        __bindEditBtnEvent: function () {
            __webixTaskTable.on_click['task-edit-btn'] = function (e, obj, trg) {
                var taskSegment = this.getItem(obj.row);
                window.open('/aggregation/task/edit?_id='+taskSegment._id);
            };
        },

        __bindDeleteBtnEvent: function () {
            var self = this;
            __webixTaskTable.on_click['task-delete-btn'] = function (e, obj, trg) {
                if(!confirm('Are you sure to delete this task?')){
                    return ;
                }
                var taskSegment = this.getItem(obj.row);
                var rowID = obj.row;
                $.ajax({
                    url: '/aggregation/task/delete',
                    data: {
                        _id: taskSegment._id
                    },
                    type: 'DELETE',
                    dataType: 'json'
                })
                    .done(function (res) {
                        if(res.error){
                            $.gritter.add({
                                title: 'Warning:',
                                text: 'Delete task failed!<br><pre>' + JSON.stringify(res.error,null,4) + '</pre>',
                                sticky: false,
                                time: 2000
                            });
                        }
                        else{
                            self.__deleteTaskTableByID(rowID);
                            $.gritter.add({
                                title: 'Notice:',
                                text: 'Delete task success!',
                                sticky: false,
                                time: 2000
                            });
                        }

                    })
                    .fail(function (error) {
                        $.gritter.add({
                            title: 'Warning:',
                            text: 'Delete task failed!<br><pre>' + JSON.stringify(error,null,4) + '</pre>',
                            sticky: false,
                            time: 2000
                        });
                    });
            };
        },

        __deleteTaskTableByID: function (rowID) {
            __webixTaskTable.remove(rowID);
        }
    };
})();

module.exports = TaskList;