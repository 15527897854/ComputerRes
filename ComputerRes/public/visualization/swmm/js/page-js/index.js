
$("div[name=chart]").click(function () {
    $("div[name=chart]").each(function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
    })

    $(this).addClass('selected');

})

function getSelected() {
    var Rslt = undefined;
    $("div[name=chart]").each(function () {
        if ($(this).hasClass('selected')) {
            var currentChild = $(this)['children']();
            var b = currentChild[0]['id'];
            Rslt = $(currentChild[0]).attr('id');
            return false;
        }
    })
    return Rslt;

}