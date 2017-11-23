function loadProfilePic (profilePicContainer, userId, username) {
    $.ajax({
        url: '/get-profile-pic',
        type: 'GET',
        data: {
            userId: userId
        },
        success: function (data) {
            if(data != 'unsuccessfull') {
                var profilePicImg = profilePicContainer.find("img");
                profilePicImg.attr('src', '/'+username+'/profilePics/'+data);
                var imgHeight = profilePicContainer.height();
                var imgWidth = (imgHeight*4)/3;
                var mar = (imgWidth - imgHeight)/2;
                profilePicImg.css('margin-left', (mar*-1)+'px');
            }

        }
    });
}
