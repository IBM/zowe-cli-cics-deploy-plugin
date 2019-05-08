$('#mysidebar').height($(".nav").height());


$(document).ready(function () {

    //this script says, if the height of the viewport is greater than 800px, then insert affix class, which makes the nav bar float in a fixed
    // position as your scroll. if you have a lot of nav items, this height may not work for you.
    var h = $(window).height();
    //console.log (h);
    if (h > 800) {
        $("#mysidebar").attr("class", "nav affix");
    }
    // activate tooltips. although this is a bootstrap js function, it must be activated this way in your theme.
    $('[data-toggle="tooltip"]').tooltip({
        placement: 'top'
    });

    /**
     * AnchorJS
     */
    anchors.add('h2,h3,h4,h5');

    /**
     * Code that places a copy button after every code block
     * Thanks to: https://stackoverflow.com/questions/48078199/jekyll-code-snippet-copy-to-clipboard-button
     * Modified to use a fontawesome icon.
     */
    // get all <pre> elements
    var allCodeBlocksElements = $("pre");

    allCodeBlocksElements.each(function (i) {
        // add different id for each code block

        // target	
        var currentId = "codeblock" + (i + 1);
        $(this).attr('id', currentId);

        //trigger
        var clipButton = '<button class="btn btn-primary btn-xs" data-clipboard-target="#' + currentId + '"><i class="fa fa-copy"></i></button>';
        $(this).after(clipButton);
    });

    new Clipboard('.btn');

});

// needed for nav tabs on pages. See Formatting > Nav tabs for more details.
// script from http://stackoverflow.com/questions/10523433/how-do-i-keep-the-current-tab-active-with-twitter-bootstrap-after-a-page-reload
$(function () {
    var json, tabsState;
    $('a[data-toggle="pill"], a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var href, json, parentId, tabsState;

        tabsState = localStorage.getItem("tabs-state");
        json = JSON.parse(tabsState || "{}");
        parentId = $(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id");
        href = $(e.target).attr('href');
        json[parentId] = href;

        return localStorage.setItem("tabs-state", JSON.stringify(json));
    });

    tabsState = localStorage.getItem("tabs-state");
    json = JSON.parse(tabsState || "{}");

    $.each(json, function (containerId, href) {
        return $("#" + containerId + " a[href=" + href + "]").tab('show');
    });

    $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function () {
        var $this = $(this);
        if (!json[$this.attr("id")]) {
            return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
        }
    });
});