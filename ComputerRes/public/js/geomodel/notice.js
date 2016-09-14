var tagName = 'all';
var renderData = [];
var tagData = [];
var SIZE = 10;
var currentPage = 1;

function longPolling() {
    $.ajax({
        url:'/notices',
        type:'GET',
        data:{latest:false},
        datatype:'json',
        success:function (data){
            if(data.data){
                renderData = data.data;
                showPartTag(tagName);
                if(data.arr[0]){
                    $('#startServer').html(data.arr[0]);
                }
                if(data.arr[1]){
                    $('#stopServer').html(data.arr[1]);
                }
                if(data.arr[2]){
                    $('#startRun').html(data.arr[2]);
                }
                if(data.arr[3]){
                    $('#stopRun').html(data.arr[3]);
                }
                if(data.arr[4]){
                    $('#delServer').html(data.arr[4]);
                }
                if(data.arr[5]){
                    $('#errInfo').html(data.arr[5]);
                }
            }
            setTimeout(longPolling,5000);
        }
    })
}

function refresh() {
    $.ajax({
        url:'/notices',
        type:'GET',
        data:{latest:false},
        datatype:'json',
        success:function (data) {
            if(data.data){
                renderData = data.data;
                showPartTag(tagName);
                if(data.arr[0]){
                    $('#startServer').html(data.arr[0]);
                }
                if(data.arr[1]){
                    $('#stopServer').html(data.arr[1]);
                }
                if(data.arr[2]){
                    $('#startRun').html(data.arr[2]);
                }
                if(data.arr[3]){
                    $('#stopRun').html(data.arr[3]);
                }
                if(data.arr[4]){
                    $('#delServer').html(data.arr[4]);
                }
                if(data.arr[5]){
                    $('#errInfo').html(data.arr[5]);
                }
            }
        }
    })
}

(function () {
    longPolling();
})();

function showPartTag(tag) {
    if(tag == 'all'){
        tagData = renderData;
    }
    else {
        tagData = [];
        renderData.forEach(function (item) {
            if(item.type == tag){
                tagData.push(item);
            }
        })
    }
    if(tag!=tagName){
        gotoPage(1);
        $('#pager').remove();
        $('#header').prepend($('#get-pager').html());

        currentPage = 1;
        $('#pager').jqPagination({
            current_page:1,
            max_page: Math.ceil(tagData.length/SIZE),
            page_string: ' {current_page} / {max_page}',
            paged: function (page) {
                currentPage = page;
                gotoPage(page);
            }
        });
    }
    else {
        gotoPage(currentPage);
        $('#pager').remove();
        $('#header').prepend($('#get-pager').html());

        $('#pager').jqPagination({
            current_page:currentPage,
            max_page: Math.ceil(tagData.length/SIZE),
            page_string: ' {current_page} / {max_page}',
            paged: function (page) {
                currentPage = page;
                gotoPage(page);
            }
        });
    }
    tagName = tag;
}

function gotoPage(page) {
    $('#notices').html('');
    var start = (page - 1) * SIZE;
    var end = Math.min(page * SIZE, tagData.length);
    for (var i = start, j = end; i < j; i++) {
        var item = tagData[i];
        var news = '';
        var tmp = $('#template').html();
        tmp = tmp.replace(/\{(\w+)\}/g, function (source, key) {
            if (source == "{time}") {
                var myDate = new Date(item[key]);
                return myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDay() + ' ' + myDate.getHours() + ':' + (myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes()) + ':' + myDate.getSeconds();
            }
            return item[key];
        });
        if (item.hasRead == 0) {
            news = '<span id="{_id}" name="{type}" class="label label-sm btn-success" style="margin-left: 30px"' +
                'onclick="markToRead(this.id)"' +
                '><small>new</small></span>';
            news = news.replace(/\{(\w+)\}/g, function (source, key) {
                return item[key];
            });
        }
        tmp += news + '</a> </li>';
        $('#notices').append(tmp);
    }
}

function markToRead(id) {
    $.ajax({
        url:"/notices",
        type:"POST",
        data:{_id:id},
        datatype:'json',
        // async: false,
        success:function (data) {
            if(data.status){
                var type = $('#'+id).attr('name');
                if(type == 'startServer'){
                    if(($('#startServer').html()-1) == 0){
                        $('#startServer').html(null);
                    }
                    else {
                        $('#startServer').html($('#startServer').html()-1);
                    }
                }
                if(type == 'stopServer'){
                    if(($('#stopServer').html()-1) == 0){
                        $('#stopServer').html(null);
                    }
                    else {
                        $('#stopServer').html($('#stopServer').html()-1);
                    }
                }
                if(type == 'startRun'){
                    if(($('#startRun').html()-1) == 0){
                        $('#startRun').html(null);
                    }
                    else {
                        $('#startRun').html($('#startRun').html()-1);
                    }
                }
                if(type == 'stopRun'){
                    if(($('#stopRun').html()-1) == 0){
                        $('#stopRun').html(null);
                    }
                    else {
                        $('#stopRun').html($('#stopRun').html()-1);
                    }
                }
                if(type == 'delServer'){
                    if(($('#delServer').html()-1) == 0){
                        $('#delServer').html(null);
                    }
                    else {
                        $('#delServer').html($('#delServer').html()-1);
                    }
                }
                if(type == 'errInfo'){
                    if(($('#errInfo').html()-1) == 0){
                        $('#errInfo').html(null);
                    }
                    else {
                        $('#errInfo').html($('#errInfo').html()-1);
                    }
                }
                if($('#'+id)){
                    $('#'+id).remove();
                }
                click();
            }
        }
    })
}

function markAll(i) {
    if(tagData[i].hasRead == 0){
        $.ajax({
            url:"/notices",
            type:"POST",
            data:{_id:tagData[i]._id},
            datatype:'json',
            // async: false,
            success:function (data) {
                if(data.status){
                    var type = tagData[i].type;
                    if(type == 'startServer'){
                        if(($('#startServer').html()-1) == 0){
                            $('#startServer').html(null);
                        }
                        else {
                            $('#startServer').html($('#startServer').html()-1);
                        }
                    }
                    if(type == 'stopServer'){
                        if(($('#stopServer').html()-1) == 0){
                            $('#stopServer').html(null);
                        }
                        else {
                            $('#stopServer').html($('#stopServer').html()-1);
                        }
                    }
                    if(type == 'startRun'){
                        if(($('#startRun').html()-1) == 0){
                            $('#startRun').html(null);
                        }
                        else {
                            $('#startRun').html($('#startRun').html()-1);
                        }
                    }
                    if(type == 'stopRun'){
                        if(($('#stopRun').html()-1) == 0){
                            $('#stopRun').html(null);
                        }
                        else {
                            $('#stopRun').html($('#stopRun').html()-1);
                        }
                    }
                    if(type == 'delServer'){
                        if(($('#delServer').html()-1) == 0){
                            $('#delServer').html(null);
                        }
                        else {
                            $('#delServer').html($('#delServer').html()-1);
                        }
                    }
                    if(type == 'errInfo'){
                        if(($('#errInfo').html()-1) == 0){
                            $('#errInfo').html(null);
                        }
                        else {
                            $('#errInfo').html($('#errInfo').html()-1);
                        }
                    }
                    if($('#'+tagData[i]._id)){
                        $('#'+tagData[i]._id).remove();
                    }
                    click();
                    i++;
                    if(i<tagData.length){
                        console.log(i);
                        markAll(i);
                    }
                }
            }
        })
    }
    else {
        i++;
        // if(i<tagData.length){
        console.log(i);
        markAll(i);
        // }
    }
}