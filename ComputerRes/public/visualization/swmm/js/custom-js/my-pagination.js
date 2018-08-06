/**
 * 
 * @param {*} _TotalCount  24
 * @param {*} _OnePageCount  10
 * @param {*} _CurrentPage  1
 * @param {*} _MaxPage  5
 */
function load_pagination(_Id, _TotalCount, _OnePageCount, _CurrentPage) {

    //show nav
    var _MaxPage = 5;
    var pageCount = 0;
    var interval = parseInt(_MaxPage / 2);

    //pageCount
    if ((_TotalCount % _OnePageCount) !== 0) {
        pageCount = parseInt(_TotalCount / _OnePageCount) + 1;
    } else {
        pageCount = parseInt(_TotalCount / _OnePageCount);
    }
    if (_CurrentPage <= 0 || _CurrentPage > pageCount) return false;

    var NavHtml = '<ul class="pagination">';
    NavHtml += '<li id="previous"><a href="javascript:void(0);" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
    //generate all <li>
    for (var i = 0; i < pageCount; i++) {
        NavHtml += '<li class="page-nav-hide"><a href="#">' + (i + 1) + '</a></li>';
    }
    NavHtml += '<li id="next"> <a href="javascript:void(0);" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
    NavHtml += '</ul>';
    $("#" + _Id).html(NavHtml);


    //show current page

    var pageNav = $("#" + _Id + " ul");
    var pageNavArray = pageNav[0]['childNodes'];

    if (pageCount < _MaxPage) {
        for (var i = 0; i < pageCount; i++) {
            $(pageNavArray[i + 1]).removeClass('page-nav-hide');
            if (_CurrentPage === parseInt(i + 1)) {
                $(pageNavArray[i + 1]).addClass('active');
            }
        }
    } else if (_CurrentPage >= pageCount - interval) {

        for (var i = 0; i < _MaxPage; i++) {
            $(pageNavArray[pageCount - _MaxPage + 1 + i]).removeClass('page-nav-hide');
            if (_CurrentPage === parseInt(pageCount - _MaxPage + 1 + i)) {
                $(pageNavArray[pageCount - _MaxPage + 1 + i]).addClass('active');
            }
        }
    } else if (_CurrentPage <= interval) {
        for (var i = 0; i < _MaxPage; i++) {
            $(pageNavArray[1 + i]).removeClass('page-nav-hide');
            if (_CurrentPage === parseInt(1 + i)) {
                $(pageNavArray[1 + i]).addClass('active');
            }
        }
    } else {
        for (var i = 0; i < _MaxPage; i++) {
            $(pageNavArray[_CurrentPage - interval + i]).removeClass('page-nav-hide');
            if (_CurrentPage === parseInt(_CurrentPage - interval + i)) {
                $(pageNavArray[_CurrentPage - interval + i]).addClass('active');
            }
        }
    }

    $("#" + _Id + " ul li a").on('click', function () {

        var activeLiIndex = getActiveItemIndex(_Id);
        //active
        var currentPage = $(this)[0]['text'];
        if (currentPage === '»') {
            show_page_nav(pageCount, (activeLiIndex + 1), _MaxPage, pageNavArray, interval);
        } else if (currentPage === '«') {
            show_page_nav(pageCount, (activeLiIndex - 1), _MaxPage, pageNavArray, interval);
        } else {
            if (!isNaN(Number(currentPage))) {
                show_page_nav(pageCount, Number(currentPage), _MaxPage, pageNavArray, interval);
            }
        }
    })


    function show_page_nav(_pageCount, _currentPage, _MaxPage, _pageNavArray, _interval) {

        if (_currentPage <= 0 || _currentPage > _pageCount) return false;
        //hide all
        for (var i = 1; i < pageNavArray.length - 1; i++) {

            if (!$(pageNavArray[i]).hasClass('page-nav-hide')) {
                $(pageNavArray[i]).addClass('page-nav-hide');
            }
            if ($(pageNavArray[i]).hasClass('active')) {
                $(pageNavArray[i]).removeClass('active');
            }
        }

        if (_pageCount < _MaxPage) {
            for (var i = 0; i < _pageCount; i++) {
                $(_pageNavArray[i + 1]).removeClass('page-nav-hide');
                if (_currentPage === parseInt(i + 1)) {
                    $(_pageNavArray[i + 1]).addClass('active');
                }
            }
        } else if (_currentPage >= _pageCount - _interval) {

            for (var i = 0; i < _MaxPage; i++) {
                $(_pageNavArray[_pageCount - _MaxPage + 1 + i]).removeClass('page-nav-hide');
                if (_currentPage === parseInt(_pageCount - _MaxPage + 1 + i)) {
                    $(_pageNavArray[_pageCount - _MaxPage + 1 + i]).addClass('active');
                }
            }
        } else if (_currentPage <= _interval) {
            for (var i = 0; i < _MaxPage; i++) {
                $(_pageNavArray[1 + i]).removeClass('page-nav-hide');
                if (_currentPage === parseInt(1 + i)) {
                    $(_pageNavArray[1 + i]).addClass('active');
                }
            }
        } else {
            for (var i = 0; i < _MaxPage; i++) {
                $(_pageNavArray[_currentPage - _interval + i]).removeClass('page-nav-hide');
                if (_currentPage === parseInt(_currentPage - _interval + i)) {
                    $(_pageNavArray[_currentPage - _interval + i]).addClass('active');
                }
            }
        }
    }

}

function getActiveItemIndex(_Id) {
    var pageNav = $("#" + _Id + " ul");
    var pageNavArray = pageNav[0]['childNodes'];
    var activeLiIndex = 0;
    //get active index
    for (var i = 1; i < pageNavArray.length - 1; i++) {
        if ($(pageNavArray[i]).hasClass('active')) {
            activeLiIndex = i;
            break;
        }
    }
    return activeLiIndex;
}