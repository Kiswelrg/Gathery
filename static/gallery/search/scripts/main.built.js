// kinds of clicking
$(document).on("click", function(e) {
    tgt = $(e.target);

    if (!tgt.closest(".tooltip").length) {
        //burger on search item
        if (!tgt.hasClass("burger")) {
            $(".tooltip").prev().removeClass("is-active");
            $(".tooltip").remove();
        }
    }

    //1.1.1
    //search btn
    if (tgt.hasClass("input-cell")) {
        p = tgt.parents().eq(2);
        p.toggleClass("fd--opened");
    } else {
        $(".fd--opened").removeClass("fd--opened");
    }

    //1.1.2
    //click option to input
    if (tgt.hasClass("fd-option")) {
        //toggle select
        if (!tgt.hasClass("fd-option--selected")) {
            tgt
                .parent()
                .find(".fd-option--selected")
                .removeClass("fd-option--selected");
            tgt.addClass("fd-option--selected");

            //change refresh state of warehouse after clicking gallery options
            if (tgt.parents().eq(3).attr("id") == "fc_gallery"){
                $("#fc_warehouse .input-cell").attr("aria-2bload", "1");
                $("#fc_warehouse .si-text").val("");
            }
        }

        p = tgt.parents().eq(3).find("input"); // instead of (2) because when dealing with vue elements, they are wrapped in a div

        if (p.length > 0) {
            var abc = tgt.text();
            var myRe =
                /^(?:(?:\r\n|\r|\n|\s|(?:\\n))+)([\u4e00-\u9fa5_a-zA-Z0-9]+)(?:(?:\r\n|\r|\n|\s|(?:\\n))+)$/g;
            var myArray = myRe.exec(abc);
            if (myArray == null) p.eq(0).val(abc);
            else {
                p.eq(0).val(myArray[1]);
            }
        }
        if (p.length > 1) {
            let attr_list = ["gid", "w_id"];
            for (a of attr_list) {
                var attr = tgt.attr(a);
                // For some browsers, `attr` is undefined; for others,
                // `attr` is false.  Check for both.

                if (typeof attr !== "undefined" && attr !== false) {
                    if (p.eq(1).hasClass("extra-input")) {
                        p.eq(1).val(attr);
                    }
                    break;
                }
            }
        }

        
    }

    //1.1.3
    //date comparison less or greater change
    if (tgt.hasClass("icon-range")) {
        let inp = tgt.parent().find("input").eq(1);
        inp.val((parseInt(inp.val()) + 1) % 3);
        tgt.attr("date_opt", (parseInt(tgt.attr("date_opt")) + 1) % 3);
    }

    //...
});

//change input placeholder in search panel
//for si-text input specifically
$(".si-text").each(function() {
    var elem = $(this);
    var c = "moved";
    // Save current value of element if u wanna see value changed
    var oldVal = elem.val();

    elem.bind("propertychange change click keyup input paste", function(event) {
        //change warehouse to be load status
        if (
            $("#fc_warehouse .input-cell").attr("aria-2bload") == "0" &&
            elem.val() != oldVal
        )
            $("#fc_warehouse .input-cell").attr("aria-2bload", "1");

        var title = elem.parent().parent().siblings(".input-title");
        if (elem.val() == "") {
            if (title.hasClass(c)) title.removeClass(c);
        } else if (!title.hasClass(c)) {
            title.addClass(c);
        }
    });
});

//pop up menu when clicking navbar-burger
$(".results").on("click", ".navbar-burger", function(event) {
    if ($(this).hasClass("is-active")) {
        $(".tooltip").remove();
        $(this).removeClass("is-active");
    } else {
        $(this).addClass("is-active");
        var position = $(this).offset();
        if (position.left + $(this).width() + 70.56 > $("body").width()) {
            var tooltip =
                '\
                                       <div class="tooltip fade cc-tooltip-left show" role="tooltip" id="" style="position: relative; transform: translate3d(' +
                (0 - $(this).width()).toString() +
                "px, " +
                (0 - $(this).height()).toString() +
                'px, 0px); top: 0px; left: 0px; will-change: transform;" x-placement="right">\
                           <div class="arrow" style="top: 18.9px;"></div>\
                           <div class="tooltip-inner">\
                               <div class="tip tip-h">Hide</div>\
                               <div class="tip tip-d">Delete</div>\
                           </div>\
                       </div>\
                   ';
        } else {
            var tooltip =
                '\
                                       <div class="tooltip fade cc-tooltip-right show" role="tooltip" id="" style="position: relative; transform: translate3d(' +
                70.56 +
                "px, " +
                (0 - $(this).height()).toString() +
                'px, 0px); top: 0px; left: 0px; will-change: transform;" x-placement="right">\
                           <div class="arrow" style="top: 18.9px;"></div>\
                           <div class="tooltip-inner">\
                               <div class="tip tip-h">Hide</div>\
                               <div class="tip tip-d">Delete</div>\
                           </div>\
                       </div>\
                   ';
        }
        $(this).parent().append(tooltip);
    }
});

// 1.1
// left-pane
//
//

//1.1.0
//form level actions


//1.1.1
//search btn

//1.1.2
//clear btn
$(".fc-button-container button.is-clear").on("click", function(event) {
    $(".filter-component input").val("");
});