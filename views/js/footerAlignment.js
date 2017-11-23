$(document).ready(function () {
    alignFooter();
    $(window).resize(function () {
        alignFooter();
    });
    function alignFooter () {
       if( $('body').height() < $(window).height()) {
            $('body').css('height', $(window).height()+'px');
            $('footer').css('position', 'absolute');
            $('footer').css('bottom', '0px');
            $('footer').css('left', '0px');
            $('footer').css('right', '0px');
        }
    }
});