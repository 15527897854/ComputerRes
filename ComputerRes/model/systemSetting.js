/**
 * Created by Franklin on 16-4-9.
 * Model for SystemSetting
 */
var mongoose = require('./mongooseModel');

function SystemSetting(ss)
{}
module.exports = SystemSetting;

var userSchema = new mongoose.Schema({
    ss_index : String,
    ss_value : String
},{collection:'systemsetting'});
var Users = mongoose.model('systemsetting',userSchema);

SystemSetting.getValueByIndex = function(ss_index, callback)
{
        Users.findOne({'ss_index':ss_index},function (err, data) {
            if(err)
            {
                console.log('mongoDB err in query!');
                return callback(err);
            }
            callback(err,data);
        });
};