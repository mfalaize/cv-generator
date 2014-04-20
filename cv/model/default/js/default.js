function onReady() {
    // Workaround for the list-group-item active class removal
    $('.list-group-item').on('click', function(e) {
        var previous = $(this).closest(".list-group").children(".active");
        previous.removeClass('active'); // previous list-item
        $(e.target).addClass('active'); // activated list-item
    });

    // Activation des popover sur les compétences
    var popover = $("a[data-toggle=popover]");
    if (popover.popover) {
        popover.popover({
            html: true,
            trigger: "hover",
            container: "body",
            placement: "left"
        });
    }

    return false;
}