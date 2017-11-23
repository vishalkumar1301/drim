function loadWallPainting (wallPaintingContainer, userId, username) {
    $.ajax({
        url: '/get-wall-painting',
        type: 'GET',
        data: {
            userId: userId
        },
        success: function (data) {
            var wallPaintingImg = wallPaintingContainer.find("img");
            console.log(wallPaintingImg);
            wallPaintingImg.attr('src', '/'+username+'/wallPaintings/'+data);
            var imgHeight = wallPaintingContainer.height();
            var imgWidth = (imgHeight*76)/25;
            var mar = (imgWidth - wallPaintingContainer.width())/2;
            wallPaintingImg.css('margin-left', (mar*-1)+'px');
        }
    });
}
