/**
 * Created by Franklin on 16-4-9.
 * Model for SystemSetting
 */
var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');

function SystemSetting(ss) {}
SystemSetting.__proto__ = ModelBase;
SystemSetting.ModelName = 'system setting';

module.exports = SystemSetting;

var SystemSettingSchema = new mongoose.Schema({
    ss_index : String,
    ss_value : String
},{collection:'systemsetting'});
var SystemSettingModel = mongoose.model('systemsetting',SystemSettingSchema);

SystemSetting.getValueByIndex = function(ss_index, callback) {
    SystemSettingModel.findOne({'ss_index':ss_index},function (err, data) {
        if(err)
        {
            console.log('mongoDB err in query!');
            return callback(err);
        }
        data = JSON.parse(JSON.stringify(data));
        return callback(null, data);
        });
};

SystemSetting.setValueByIndex = function(item, callback) {
    var where = {'ss_index':item.ss_index},
        toUpdate = item;
    SystemSettingModel.update(where, toUpdate, function(err, res){
        if(err){
            return callback(err);
        }
        return callback(null, res);
    });
};
