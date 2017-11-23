var socket = io();
socket.on('connect', function () {
    console.log('connected to server');
});
$(document).ready(function () {
    $('#signupForm').on('submit', function (e) {
        e.preventDefault();
        var username_ = $('#username').val();
        var email_ = $('#email').val();
        var password1_ = $('#password').val();
        var password2_ = $('#confirmPassword').val();
        var signupvalidation = new signupValidation(username_, email_, password1_, password2_);
        if(signupvalidation.isSignupFormValid()) {
          $.ajax({
            type: 'POST',
            url: '/register-user',
            data: {
              username: username_,
              email: email_,
              password: password1_
            },
            success: function(data) {
              if(data == 'successfull'){
                $('input').each(function (index){
                  $(this).val('');
                });
                $('#message').addClass('message-modify');
                $('#message').css('margin-top', '20px');
                $('#signupFormContainer').css('margin-top', '30px');
                $('#message').text('You have successfully signed up please check your email and confirm your account');
              } else {
                $('#message').addClass('message-modify');
                $('#message').css('margin-top', '20px');
                $('#signupFormContainer').css('margin-top', '30px');
                $('#message').text(data);
              }
            }
          });
        } else {
          $('#message').addClass('message-modify');
          $('#message').css('margin-top', '20px');
          $('#signupFormContainer').css('margin-top', '30px');
          $('#message').text("fill all entries properly");
        }
    });
});
