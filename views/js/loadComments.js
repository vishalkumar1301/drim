function loadComments(postid, type, callback) {
    $.ajax({
        type: 'GET',
        url: '/get-comments',
        data: {
            postId: postid,
            type: type
        },
        success: function (data) {
            if(data != 'unsuccessfull')
            callback(data);
        }
    });
}
