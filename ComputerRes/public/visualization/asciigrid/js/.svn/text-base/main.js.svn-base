/**
 * Created by Administrator on 2016/8/26.
 */

var developMode = false;

if(developMode){
    require.config({
        baseUrl:'./Cesium',
        waitSeconds: 60
    });
}else{
    require.config({
        paths:{
            'Cesium': '../Cesium/Cesium'
        },
        shim:{
            Cesium:{
                exports:'Cesium'
            }
        }
    });
}

if(typeof Cesium !== 'undefined'){
    onload(Cesium);
}else if(typeof require == 'function'){
    require(["Cesium"],onload);
}