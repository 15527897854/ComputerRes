/**
 * List 选中、获取选中的内容
 */


var udxSchemaDataset;

function initList() {
    bindClick();
}

function bindClick() {

    //item click
    $(".list-group a").on('click', function () {

        //foreach to remove active
        $('.list-group a').each(function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
            }
        })
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
        }
    })

    //disabled drag <a> to open a new window 
    $(".list-group a").on('dragstart', function () {
        return false;
    })
    // const ipc = require('electron').ipcRenderer;


};

function isRepeat(_id, _filePath) {
    var state = false;
    $(' .list-group a').each(function () {
        var a= $(this);
        let currentId = $($(this).parent()).attr("id");
        if ( currentId === _id) {
            let currentPath = $(this).attr("file_path");
            if (currentPath === _filePath) {
                state=true;
                return false;
            }
        }
    })
    return state;
}

function getSelectedItem(_id){
    var ItemName = "";
    var ItemFilePath ="";
      $(' .list-group a').each(function () {
        var a= $(this);
        let currentId = $($(this).parent()).attr("id");
        if ( currentId === _id) {
              if ($(this).hasClass("active")) {
                ItemName=$(this).text();
                ItemFilePath=$(this).attr("file_path");
                return false;
            }
        }
    })
    var rslt = {
        "name":ItemName,
        "filepath":ItemFilePath

    }
    return rslt;


}

//add list

function addList(_id, _text, _path) {
    let htmlStr = "";
    htmlStr += '<a href="#" class="list-group-item" file_path="' + _path + '" >' + _text + '</a>';
    $("#" + _id).append(htmlStr);
    initList();
}

$(function () {
    initList();
})
