/**
 * Created by Franklin on 2016/7/26.
 * Client ModelService Opera
 */

//关闭模型服务
function ms_stop(msid) {
    if(confirm("确认关闭模型服务？") == true)
    {
        $.ajax({
            url:'/modelser/' + msid + '?ac=stop',
            success:function (data) {
                var resjson = JSON.parse(data);
                if(resjson.res == "Error")
                {
                    alert(resjson.mess);
                }
                else if(resjson.res == "Stopped")
                {
                    alert("模型服务已经处于关闭状态！");
                }
                else if(resjson.res == "Success")
                {
                    alert("已关闭模型服务！");
                    window.location.reload();
                }
            }
        });
    }
}

//开启模型服务
function ms_start(msid) {
    if(confirm("确认开启模型服务？") == true)
    {
        $.ajax({
            url:'/modelser/' + msid + '?ac=start',
            success:function (data) {
                var resjson = JSON.parse(data);
                if(resjson.res == "Error")
                {
                    alert(resjson.mess);
                }
                else if(resjson.res == "Started")
                {
                    alert("模型服务已经处于开启状态！");
                }
                else if(resjson.res == "Success")
                {
                    alert("已开启模型服务！");
                    window.location.reload();
                }
            }
        });
    }
}