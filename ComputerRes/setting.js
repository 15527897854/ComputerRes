/**
 * Created by Franklin on 16-3-16.
 * The setting of the site
 */
var os  = require('os');
var fs = require('fs');

module.exports =  {
    gate:{
        host:'127.0.0.1',
        port:3000
    },
    port:'8060',
    oid:'56f110136dde7f18b4cb2b87',
    platform:(function () {
        var platform = 1;
        if(os.type() == 'Linux'){
            platform = 2;
        }
        return platform;
    })(),
    mongodb:{
        name:'ComputerRes',
        host:'127.0.0.1',
        port:'27017'
    },
    redis:{
        host:'127.0.0.1',
        port:'6379',
        pwd:'fsa',
        dbIndex:'0'
    },
    socket:
    {
        host:'127.0.0.1',
        port:'6000'
    },
    modelpath: __dirname + '/geo_model/',
    data_size : 1024,
    debug : false,
    debugGUID : 'ec8fdb84-1625-4542-b3ca-f09c4087fd68'
};