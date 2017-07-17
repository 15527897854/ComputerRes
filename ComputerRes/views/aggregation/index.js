/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var MSAggreJS = require('./MSAggreJS');
var CanvasJS = require('./CanvasJS');
var SolutionLibraryJS = require('./SolutionLibraryJS');

$().ready(function () {
    var url = location.href;
    if(url.indexOf('aggregation/solution/new') != -1 || url.indexOf('aggregation/solution/update') != -1){
        CanvasJS.init('edit');
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
                return new Promise((resolve,reject)=> {
                    MSAggreJS.buildMSListModal(mss, (err, webixTree) => {
                        if(err){
                            reject(err);
                        }
                        else{
                            resolve(webixTree);
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
        var solution = JSON.parse($('#solution-detail').text().slice(1,-1));
        CanvasJS.init('view');
        CanvasJS.importSolution(solution);
    }
    else if(url.indexOf('aggregation/solution/edit') != -1){
        CanvasJS.init('edit');
    }
});