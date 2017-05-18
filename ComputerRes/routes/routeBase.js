/**
 * Created by Franklin on 2017/3/22.
 */
var RouteBase = function () {};

RouteBase.returnFunction = function (res, errMessage, field) {
    return function (err, data) {
        if(err)
        {
            return res.end(JSON.stringify({
                result : 'err',
                message : errMessage + JSON.stringify(err)
            }));
        }
        if(field != null && field != undefined && typeof field == 'string'){
            data = data[field];
        }
        return res.end(JSON.stringify({
            result : 'suc',
            data : data
        }));
    };
};

RouteBase.returnRender = function (res, view, dataName) {
    return function (err, data) {
        if(err)
        {
            return res.end(JSON.stringify({
                result : 'err',
                message : errMessage + JSON.stringify(err)
            }));
        }
        return res.render(view, {dataName : data});
    }
};

module.exports = RouteBase;