//toggle inputs by checking login status
$(document).ready(function() {
    if (window.location.href.substr(window.location.href.length - 6) === '?mes=1') {
        console.log('ready!');
        $("#status").removeClass("is-warning");
        $("#status").addClass("is-success");
        $("#log").hide();
        $("#exit").show();
    }
});


//navbar open and close
$("#cc-globalnav").on("click", function(event) {
    var state = $(this).attr("state");
    if (state == '0') {
        $(".globalnav").addClass("menu-opening");
        $(".globalnav").addClass("opened");
        $(this).attr("state", "1");
        setTimeout(
            function() {
                $(".is-fixed-top").removeClass("menu-opening");
            }, 640);
    } else {
        $(".globalnav").removeClass("opened");
        $(".globalnav").addClass("menu-closing");
        $(this).attr("state", "0");
        setTimeout(
            function() {
                $(".is-fixed-top").removeClass("menu-closing");
            }, 640);
    }
});

// set no scroll
$(".oftwo").on("click", function(event) {
    var scroll = $("html").hasClass("cc-noscroll");
    if (scroll == true) {
        $("html").removeClass("cc-noscroll");
        $("html").removeClass("cc-noscroll-long");
    } else {
        $("html").addClass("cc-noscroll");
        $("html").addClass("cc-noscroll-long");
    }

    $(this).toggleClass("is-active");

});


//删除通知块
$(".notification").on("click", ".delete", function(event) {
    $(this).parent().parent().hide('slow', function() { $(this).remove(); });
});


//切换焦点元素（多个地方）
$(".panel-tabs a,ul li, .panel a").on("click", function(event) {
    var prev = $(".panel-tabs .is-active");
    prev.removeClass("is-active");
    $(this).addClass("is-active");
});


$("#mode").on("click", function(event) {
    var mode = $("#mode");
    var word = $("#pw");
    var ssid = $("#ss");
    if (mode.html() == "User/P") {
        mode.html("Cookie");
        word.hide();
        ssid.show();

    } else {
        mode.html("User/P");
        ssid.hide();
        word.show();
    }
    var set = document.getElementById("setmode");

    var index = parseInt(set.value)
    index = 1 - index;
    $("#loginForm")[0].reset();
    set.setAttribute("value", index.toString());
});


/* var lastScrollTop = 0;
$(window).scroll(function(event) {
    var st = $(this).scrollTop();
    if (st > lastScrollTop)
        $('.navbar.is-fixed-bottom').css('box-shadow', 'rgba(0, 0, 0, 0.13) 0px -.1px 15px 0px');
    else
        $('.navbar.is-fixed-bottom').css('box-shadow', 'rgba(0, 0, 0, 0.13) 0px -.1px 15px 2px');
    lastScrollTop = st;
}); */