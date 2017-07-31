/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var MSAggreJS = require('./MSAggreJS');
var CanvasJS = require('./CanvasJS');
var SolutionLibraryJS = require('./SolutionLibraryJS');
var TaskListJS = require('./TaskListJS');

(function($, h, c) {
    var a = $([]),
        e = $.resize = $.extend($.resize, {}),
        i,
        k = "setTimeout",
        j = "resize",
        d = j + "-special-event",
        b = "delay",
        f = "throttleWindow";
    e[b] = 250;
    e[f] = true;
    $.event.special[j] = {
        setup: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {
                w: l.width(),
                h: l.height()
            });
            if (a.length === 1) {
                g();
            }
        },
        teardown: function() {
            if (!e[f] && this[k]) {
                return false;
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
                clearTimeout(i);
            }
        },
        add: function(l) {
            if (!e[f] && this[k]) {
                return false;
            }
            var n;
            function m(s, o, p) {
                var q = $(this),
                    r = $.data(this, d);
                r.w = o !== c ? o: q.width();
                r.h = p !== c ? p: q.height();
                n.apply(this, arguments);
            }
            if ($.isFunction(l)) {
                n = l;
                return m;
            } else {
                n = l.handler;
                l.handler = m;
            }
        }
    };
    function g() {
        i = h[k](function() {
                a.each(function() {
                    var n = $(this),
                        m = n.width(),
                        l = n.height(),
                        o = $.data(this, d);
                    if (m !== o.w || l !== o.h) {
                        n.trigger(j, [o.w = m, o.h = l]);
                    }
                });
                g();
            },
            e[b]);
    }
})(jQuery, this);

$().ready(function () {
    var url = location.href;
    var solution = null;
    var task = null;
    var socket = null;
    // var serverHost = 'localhost';
    // var serverPort = '8060';
    // var socketUrl = null;
    // if($('#serverHost').length && $('#serverPort').length) {
    //     serverHost = $('#serverHost').text().slice(1,-1);
    //     serverPort = $('#serverPort').text().slice(1,-1);
    //     socketUrl = 'http://' + serverHost + ':' + serverPort;
    // }

    if(url.indexOf('aggregation/solution/new') != -1){
        $('#saveas-solution-tool').remove();
        CanvasJS.init('edit','solution');

        new Promise((resolve, reject)=> {
            MSAggreJS.getALLMS((err, mss)=> {
                if(err){
                    reject(err);
                }
                else{
                    resolve(mss);
                }
            });
        })
            .then((mss)=> {
                return new Promise((reject)=> {
                    MSAggreJS.buildMSListModal(mss, true, (err) => {
                        if(err){
                            reject(err);
                        }
                    });
                });
            })
            .catch((err)=> {
                var errMsg = '<pre>'+JSON.stringify(err,null,4)+'</pre>';
                $.gritter.add({
                    title: '警告：',
                    text: errMsg,
                    sticky: false,
                    time: 2000
                });
                return;
            });
    }
    else if(url.indexOf('aggregation/solution/query') != -1){
        SolutionLibraryJS.init();
    }
    else if(url.indexOf('aggregation/solution/detail') != -1){
        CanvasJS.init('view','solution');

        solution = $('#solution-detail').text().slice(1,-1);
        if(!solution || solution == ''){
            $.gritter.add({
                title: 'Warning:',
                text: 'Can\'t find this solution' ,
                sticky: false,
                time: 2000
            });
            return ;
        }
        solution = JSON.parse(solution);

        CanvasJS.initImport('SOLUTION',solution);
        CanvasJS.importSolution();
    }
    else if(url.indexOf('aggregation/solution/edit') != -1){
        CanvasJS.init('edit','solution');

        solution = $('#solution-detail').text().slice(1,-1);
        if(!solution || solution == ''){
            $.gritter.add({
                title: 'Warning:',
                text: 'Can\'t find this solution' ,
                sticky: false,
                time: 2000
            });
            return ;
        }
        solution = JSON.parse(solution);

        MSAggreJS.importLayoutBySolution(solution);
        CanvasJS.initImport('SOLUTION',solution);
        CanvasJS.importSolution();
    }
    else if(url.indexOf('aggregation/task/query') != -1){
        TaskListJS.init();
    }
    else if(url.indexOf('aggregation/task/new') != -1){
        $('#saveas-task-tool').remove();
        CanvasJS.init('configure','task');

        solution = $('#solution-detail').text().slice(1,-1);
        if(!solution || solution == ''){
            $.gritter.add({
                title: 'Warning:',
                text: 'Can\'t find this solution' ,
                sticky: false,
                time: 2000
            });
            return ;
        }
        solution = JSON.parse(solution);

        CanvasJS.initImport('SOLUTION',solution);
        CanvasJS.importSolution();
    }
    else if(url.indexOf('aggregation/task/detail') != -1){
        CanvasJS.init('view','task');

        task = $('#task-detail').text().slice(1,-1);
        if(!task || task == ''){
            $.gritter.add({
                title: 'Warning:',
                text: 'Can\'t find this solution' ,
                sticky: false,
                time: 2000
            });
            return ;
        }
        task = JSON.parse(task);

        CanvasJS.initImport('TASK',task);
        CanvasJS.importTask();
    }
    else if(url.indexOf('aggregation/task/edit') != -1){
        CanvasJS.init('configure','task');

        task = $('#task-detail').text().slice(1,-1);
        if(!task || task == ''){
            $.gritter.add({
                title: 'Warning:',
                text: 'Can\'t find this solution' ,
                sticky: false,
                time: 2000
            });
            return ;
        }
        task = JSON.parse(task);

        CanvasJS.initImport('TASK',task);
        CanvasJS.importTask();
    }
});