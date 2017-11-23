function loadLikes(postid, callback) {
    $.ajax({
        type: 'GET',
        url: '/get-post-likes',
        data: {
            postId: postid
        },
        success: function (data) {
            if(data != 'unsuccessfull')
            callback(data);
        }
    });
}
