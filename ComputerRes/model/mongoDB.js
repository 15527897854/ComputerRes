/**
 * Created by Franklin on 16-4-5.
 */

var setting = require('../setting'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(setting.mongodb.name,new Server(setting.mongodb.host,setting.mongodb.port),
    {safe:true});