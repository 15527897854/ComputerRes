function bindContextMenu(parent_id,menu_id){
      $(document).on("mousedown", function (event) {
        //button等于0代表左键，button等于1代表中键
        if (event.button == 0 || event.button == 1||event.button == 2) {
            $("#"+menu_id).stop().fadeOut(200);//获取菜单停止动画，进行隐藏使用淡出效果
        }
    });

    //禁止浏览器右键事件
    $(document).on("contextmenu",function(event){
         event.preventDefault();
    })
    //文档对象注册上下文（右键）菜单事件
    $("#"+parent_id).on("contextmenu", function (event) {
        var pageX = event.pageX;//鼠标单击的x坐标
        var pageY = event.pageY;//鼠标单击的y坐标
        //获取菜单
        var contextMenu = $("#"+menu_id);
        var cssObj = {
            top: pageY + "px",//设置菜单离页面上边距离，top等效于y坐标
            left: pageX + "px"//设置菜单离页面左边距离，left等效于x坐标
        };
        //判断横向位置（pageX）+自定义菜单宽度之和，如果超过页面宽度及为溢出，需要特殊处理；
        var menuWidth = contextMenu.width();
        var pageWidth = $(parent_id).width();
        if (pageX + contextMenu.width() > pageWidth) {
            cssObj.left = pageWidth - menuWidth - 5 + "px"; //-5是预留右边一点空隙，距离右边太紧不太美观；
        }
        //设置菜单的位置
        $("#"+menu_id).css(cssObj).stop().fadeIn(200);//显示使用淡入效果,比如不需要动画可以使用show()替换;

       // event.preventDefault();//阻止浏览器与事件相关的默认行为；此处就是弹出右键菜单
    });
}

$(function () {
  
});