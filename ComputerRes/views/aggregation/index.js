/**
 * Created by SCR on 2017/7/9.
 */
/*jshint esversion: 6 */
var MSAggreJS = require('./MSAggreJS');
var CanvasJS = require('./CanvasJS');

$().ready(function () {
    CanvasJS.init();
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
});