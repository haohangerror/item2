(function(){
    var w = $('body').width();
    $('#shelfpage').click(function(){
        $('#p-wrap').animate({marginLeft:-w},500);
        $('#homepage').children().removeClass('click');
        $('#shelfpage').children().addClass('click');
    });
    $('#homepage').click(function(){
        $('#p-wrap').animate({marginLeft:0},500);
        $('#shelfpage').children().removeClass('click');
        $('#homepage').children().addClass('click');
    });
    $(".summary-title li").click(function() {
        var index = $(this).index();
        $(".summary-show").eq(index).show().siblings().hide();
    });
})();
