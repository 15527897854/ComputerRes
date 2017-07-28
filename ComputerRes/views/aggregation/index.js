/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var MSAggreJS = require('./MSAggreJS');
var CanvasJS = require('./CanvasJS');
var SolutionLibraryJS = require('./SolutionLibraryJS');
var TaskListJS = require('./TaskListJS');

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