function showFirstTab() {

    var m_panels = $(".m_panels");
    var m_children = m_panels[0]['children'];

    for (var i = 0; i < m_children.length; i++) {
        $(m_children[i]).css({
            'opacity': '0.0'
        })
        $(m_children[i]).hide();

    }
    $(m_children[0]).show();
    $(m_children[0]).css({
        'opacity': '1.0'
    })
}

$(".tabs label").on('click', function () {

    var NameStr = $(this)[0]['attributes']['for']['nodeValue'];
    var index = parseInt(NameStr.split("_")[1]);

    var m_panels = $(".m_panels");
    var m_children = m_panels[0]['children'];

    for (var i = 0; i < m_children.length; i++) {
        $(m_children[i]).css({
            'opacity': '0.0'
        })
        $(m_children[i]).hide();

    }
    $(m_children[index - 1]).show();
    $(m_children[index - 1]).css({
        'opacity': '1.0'
    })
})

showFirstTab();

