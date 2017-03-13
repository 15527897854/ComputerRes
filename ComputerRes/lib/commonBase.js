/**
 * Created by Franklin on 2017/3/7.
 */

function ModelBase() {
    
}

ModelBase.returnFunction = function(callback, errMess)
{
    return (function (err, res) {
        if(err)
        {
            if(errMess != null && typeof errMess == "string")
            {
                console.log(errMess);
            }
            return callback(err);
        }
        res = JSON.parse(JSON.stringify(res));
        return callback(err,res);
    });
};

ModelBase.checkParam = function(callback, param, type)
{
    if(param == null || param == undefined)
    {
        return callback({
            err : "param error",
            message : "param is null"
        });
    }
    if(type != null && typeof param != type)
    {
        return callback({
            err : "param error",
            message : "type of param is wrong"
        });
    }
};

module.exports = ModelBase;