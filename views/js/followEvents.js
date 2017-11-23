$('document').ready(function () {
  function getDropDownButton (elem) {
    elem.append(
      $('<div></div>', {'class': 'dropdown profileContainerFooterContainerLeftElements', 'id': 'following'}).append(
        $('<button></button>', {
          'class': 'btn btn-secondary dropdown-toggle profileContainerFooterContainerLeftElements',
          'type': 'button',
          'id': 'followingButton',
          'data-toggle': 'dropdown',
          'aria-haspopup': 'true',
          'aria-expanded': 'false',
          'text': 'following'
        })).append($('<div></div>', {
          'class': 'dropdown-menu',
          'aria-labelledby': 'dropdownMenuButton',
        }).append($('<a></a>', {
          'class': 'dropdown-item',
          'id': 'unfollow',
          'text': 'unfollow'
        }))
      )
    );
  }
  $('#profileContainerFooterContainerLeft').on('click', '#follow', function () {
    var userId = $('#follow').attr('user-id');

    $.ajax({
      type: 'POST',
      url: '/follow',
      data: {
        following: userId
      },
      success: function (data) {
        if(data == 'successfull') {
          $('#follow').remove();
          getDropDownButton($('#profileContainerFooterContainerLeft'));
        } else if (data == 'unsuccessfull') {
          alert('some problem occured');
        }
      }
    });
  });
  $('#profileContainerFooterContainerLeft').on('click', '#following', function () {

  });
});
