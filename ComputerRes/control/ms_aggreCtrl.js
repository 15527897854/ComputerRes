var setting = require('../setting');
var remoteReqCtrl = require('./remoteReqControl');

var MS_AggreCtrl = function () {

};
module.exports = MS_AggreCtrl;

MS_AggreCtrl.getAllMS = function () {

};

MS_AggreCtrl.prototype.getPortalMS = function () {

};

MS_AggreCtrl.getCloudMSTree = function(callback){
    remoteReqCtrl.getRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/GetClassServlet', function(err, categories){
        if(err){
            return callback(err);
        }
        for(var i = 0; i < categories.length; i++){
            if(categories[i].children.length > 0){
                categories[i]['nodes'] = [];
            }
            for(var j = 0; j < categories[i].children.length; j++){
                var index = MS_AggreCtrl.getCategoryById(categories, categories[i].children[j]);
                if(index != -1){
                    categories[index]['backColor'] = '#FFFFFF';
                    categories[index]['text'] = categories[index]['name'];
                    if(categories[index]['isLeaf'] === 'true'){
                        categories[index]['selectable'] = true;
                        categories[index]['icon'] = "fa fa-book";
                        categories[index]['selectedIcon'] = "fa fa-check";
                    }
                    else{
                        categories[index]['selectable'] = false;
                        categories[index]['state'] = {
                            expanded : false
                        };
                    }
                    categories[i].nodes.push(categories[index]);
                }
            }
        }

        return callback(null, categories[0]);
    });
};

MS_AggreCtrl.getCategoryById = function(array, id){
    for(var i = 0; i < array.length; i++){
        if(array[i].id == id){
            return i;
        }
    }
    return -1;
};