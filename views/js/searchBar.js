$(document).ready(function () {

    $('#searchBar').keyup(function () {
        var searchType = $('#searchType').val();
        searchBarValue = $('#searchBar').val();
        if(searchBarValue != '') {
            $.ajax({
                type: 'GET',
                url: '/search',
                data: {
                    searchType: searchType,
                    searchBarValue: searchBarValue
                },
                success: function (data) {
                    if(data != 'unsuccessfull') {
                        $('#searchResult').text('');
                        if(data.length > 0) {
                            $('#searchResult').addClass('searchBarShadowClass');
                        } else {
                            $('#searchResult').removeClass('searchBarShadowClass');
                        }
                        for( var i = 0 ; i < data.length ; i++ ) {
                            $('#searchResult').append(
                                $('<a></a>', {
                                    'href': '/home/'+data[i].username
                                }).append(
                                    $('<div></div>', {
                                        'class': 'searchResultUserContainer'
                                    }).append(
                                        $('<div></div>', {
                                            'class': 'profilePicContainer',
                                            'onload': function () {
                                                loadProfilePic($(this), data[i].userId, data[i].username);
                                            }
                                        }).append(
                                            $('<img>')
                                        )
                                    ).append(
                                        $('<span></span>', {
                                            'class': 'searchResultUsername',
                                            'text': data[i].username
                                        })
                                    )
                                )
                            );
                        }
                    }
                }
            });
        } else {
            $('#searchResult').text('');
            $('#searchResult').removeClass('searchBarShadowClass');
        }
    });
});
