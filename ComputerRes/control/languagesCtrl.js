/**
 * Created by Franklin on 2017/7/1.
 */
var fs = require('fs');

var LanguageCtrl = function (){}

LanguageCtrl.getAllLanguageConfig = function(callback){
    var path = __dirname + '/../public/languages/';
    fs.readdir(path, function(err, files){
        if(err){
            return callback(err);
        }
        var langConfigs = [];
        files.forEach(function(item){
            var languagesJson = fs.readFileSync(path + item);
            try{
                languagesJson = JSON.parse(languagesJson);
                languagesJson['File'] = item;
                langConfigs.push(languagesJson);
            }
            catch(ex){
                return callback(ex);
            }
        });

        var configs = [];

        for(var i = 0; i < langConfigs.length; i++){
            if(langConfigs[i].ConfigName){
                configs.push({
                    ConfigName : langConfigs[i].ConfigName,
                    File : langConfigs[i].File,
                    SelectButton : langConfigs[i].SelectButton
                });
            }
        }

        return callback(null, configs);
    });
};

LanguageCtrl.updateLanguage = function(file, callback){
    try{
        var path = __dirname + '/../public/languages/';
        var path = path + file;
        configLanguage = fs.readFileSync(path);
        configLanguage = JSON.parse(configLanguage);
        global.configLanguage = configLanguage;
        return callback(null, true);
    }
    catch(ex){
        return callback(err);
    }
}

module.exports = LanguageCtrl;