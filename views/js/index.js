var socket = io();
socket.on('connect', function () {
    console.log('connected to server');
});
$(document).ready(function () {
   $('#signinForm').on('submit', function (e) {
       e.preventDefault();
       var username_ = $('#username').val();
       var password_ = $('#password').val();
       var signinvalidation = new signinValidation(username_, password_);
       if(signinvalidation.isSigninFormValid()) {
         $.ajax({
           type: 'GET',
           url: '/check-signin',
           data: {
             username: username_,
             password: password_
           },
           success: function(data) {
             if(data == 'successfull'){
               window.location.href="/";
             }
             else {
               $('#message').addClass('message-modify');
               $('#message').css('margin-top', '20px');
               $('#signinFormContainer').css('margin-top', '30px');
               $('#message').text(data);
             }
           }
         });
      //      socket.emit('signinEvent', {
      //         username:  username_,
      //          password: password_
      //      }, function () {
      //          alert("successfully sent data");
      //      });
      //  } else {
      //      alert('wrong details');
       }
       else {
         $('#message').addClass('message-modify');
         $('#message').css('margin-top', '20px');
         $('#signinFormContainer').css('margin-top', '30px');
         $('#message').text('enter all the entries');
       }
   });
});
